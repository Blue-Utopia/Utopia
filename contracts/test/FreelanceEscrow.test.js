const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("FreelanceEscrow", function () {
  let escrow, mockToken;
  let owner, platformWallet, client, developer;
  let deadline;

  beforeEach(async function () {
    [owner, platformWallet, client, developer] = await ethers.getSigners();

    // Deploy mock ERC20 token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockToken = await MockERC20.deploy("Mock USDT", "USDT", ethers.parseUnits("1000000", 18));
    await mockToken.waitForDeployment();

    // Transfer tokens to client
    await mockToken.transfer(client.address, ethers.parseUnits("10000", 18));

    // Deploy escrow contract
    const FreelanceEscrow = await ethers.getContractFactory("FreelanceEscrow");
    escrow = await FreelanceEscrow.deploy(platformWallet.address);
    await escrow.waitForDeployment();

    // Add mock token as supported
    await escrow.setSupportedToken(await mockToken.getAddress(), true);

    // Client approves escrow to spend tokens
    await mockToken.connect(client).approve(
      await escrow.getAddress(),
      ethers.parseUnits("10000", 18)
    );

    deadline = (await time.latest()) + 86400 * 7; // 7 days from now
  });

  describe("Job Creation", function () {
    it("Should create a new job successfully", async function () {
      const totalAmount = ethers.parseUnits("1000", 18);

      const tx = await escrow.connect(client).createJob(
        developer.address,
        await mockToken.getAddress(),
        totalAmount,
        deadline
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find((log) => {
        try {
          return escrow.interface.parseLog(log).name === "JobCreated";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
    });

    it("Should fail if developer address is invalid", async function () {
      await expect(
        escrow.connect(client).createJob(
          ethers.ZeroAddress,
          await mockToken.getAddress(),
          ethers.parseUnits("1000", 18),
          deadline
        )
      ).to.be.revertedWith("Invalid developer address");
    });

    it("Should fail if client tries to hire themselves", async function () {
      await expect(
        escrow.connect(client).createJob(
          client.address,
          await mockToken.getAddress(),
          ethers.parseUnits("1000", 18),
          deadline
        )
      ).to.be.revertedWith("Client cannot be developer");
    });
  });

  describe("Initial Payment", function () {
    let jobId;
    const totalAmount = ethers.parseUnits("1000", 18);

    beforeEach(async function () {
      const tx = await escrow.connect(client).createJob(
        developer.address,
        await mockToken.getAddress(),
        totalAmount,
        deadline
      );
      const receipt = await tx.wait();
      jobId = 0; // First job has ID 0
    });

    it("Should allow client to deposit 50% upfront", async function () {
      await expect(escrow.connect(client).depositInitialPayment(jobId))
        .to.emit(escrow, "FundsDeposited")
        .withArgs(jobId, client.address, totalAmount / 2n);

      const job = await escrow.getJob(jobId);
      expect(job.paidAmount).to.equal(totalAmount / 2n);
      expect(job.status).to.equal(1); // Funded status
    });

    it("Should fail if non-client tries to deposit", async function () {
      await expect(
        escrow.connect(developer).depositInitialPayment(jobId)
      ).to.be.revertedWith("Only client can deposit");
    });
  });

  describe("Job Workflow", function () {
    let jobId;
    const totalAmount = ethers.parseUnits("1000", 18);

    beforeEach(async function () {
      // Create job
      await escrow.connect(client).createJob(
        developer.address,
        await mockToken.getAddress(),
        totalAmount,
        deadline
      );
      jobId = 0;

      // Deposit initial payment
      await escrow.connect(client).depositInitialPayment(jobId);
    });

    it("Should allow developer to start job", async function () {
      await escrow.connect(developer).startJob(jobId);
      const job = await escrow.getJob(jobId);
      expect(job.status).to.equal(2); // InProgress status
    });

    it("Should allow developer to submit work", async function () {
      await escrow.connect(developer).startJob(jobId);
      await escrow.connect(developer).submitWork(jobId);
      const job = await escrow.getJob(jobId);
      expect(job.status).to.equal(3); // UnderReview status
    });

    it("Should complete job and transfer funds correctly", async function () {
      // Start and submit work
      await escrow.connect(developer).startJob(jobId);
      await escrow.connect(developer).submitWork(jobId);

      // Get initial balances
      const platformBalanceBefore = await mockToken.balanceOf(platformWallet.address);
      const developerBalanceBefore = await mockToken.balanceOf(developer.address);

      // Client approves and pays remaining
      await escrow.connect(client).approveAndPayRemaining(jobId);

      // Check balances
      const platformBalanceAfter = await mockToken.balanceOf(platformWallet.address);
      const developerBalanceAfter = await mockToken.balanceOf(developer.address);

      const platformFee = (totalAmount * 250n) / 10000n; // 2.5% fee
      const developerAmount = totalAmount - platformFee;

      expect(platformBalanceAfter - platformBalanceBefore).to.equal(platformFee);
      expect(developerBalanceAfter - developerBalanceBefore).to.equal(developerAmount);

      // Check job status
      const job = await escrow.getJob(jobId);
      expect(job.status).to.equal(4); // Completed status
    });
  });

  describe("Disputes", function () {
    let jobId;
    const totalAmount = ethers.parseUnits("1000", 18);

    beforeEach(async function () {
      await escrow.connect(client).createJob(
        developer.address,
        await mockToken.getAddress(),
        totalAmount,
        deadline
      );
      jobId = 0;
      await escrow.connect(client).depositInitialPayment(jobId);
      await escrow.connect(developer).startJob(jobId);
    });

    it("Should allow initiating a dispute", async function () {
      await expect(escrow.connect(client).initiateDispute(jobId))
        .to.emit(escrow, "JobDisputed")
        .withArgs(jobId, client.address);

      const job = await escrow.getJob(jobId);
      expect(job.status).to.equal(5); // Disputed status
    });

    it("Should allow owner to resolve dispute", async function () {
      await escrow.connect(client).initiateDispute(jobId);

      // Resolve: 60% to client, 40% to developer
      await escrow.resolveDispute(jobId, 6000);

      const job = await escrow.getJob(jobId);
      expect(job.status).to.equal(4); // Completed status
    });
  });

  describe("Platform Management", function () {
    it("Should allow owner to update platform fee", async function () {
      await escrow.setPlatformFee(500); // 5%
      expect(await escrow.platformFee()).to.equal(500);
    });

    it("Should not allow fee above 10%", async function () {
      await expect(escrow.setPlatformFee(1001)).to.be.revertedWith("Fee too high (max 10%)");
    });

    it("Should allow adding/removing supported tokens", async function () {
      const newToken = ethers.Wallet.createRandom().address;
      await escrow.setSupportedToken(newToken, true);
      expect(await escrow.supportedTokens(newToken)).to.be.true;

      await escrow.setSupportedToken(newToken, false);
      expect(await escrow.supportedTokens(newToken)).to.be.false;
    });
  });
});

// Mock ERC20 contract for testing
// Note: This should be in a separate file in a real project

