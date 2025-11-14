const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts to network:", hre.network.name);

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy ReputationSystem
  console.log("\n1. Deploying ReputationSystem...");
  const ReputationSystem = await hre.ethers.getContractFactory("ReputationSystem");
  const reputationSystem = await ReputationSystem.deploy();
  await reputationSystem.waitForDeployment();
  const reputationAddress = await reputationSystem.getAddress();
  console.log("✅ ReputationSystem deployed to:", reputationAddress);

  // Deploy FreelanceEscrow
  console.log("\n2. Deploying FreelanceEscrow...");
  const platformWallet = deployer.address; // Use deployer as platform wallet for now
  const FreelanceEscrow = await hre.ethers.getContractFactory("FreelanceEscrow");
  const freelanceEscrow = await FreelanceEscrow.deploy(platformWallet);
  await freelanceEscrow.waitForDeployment();
  const escrowAddress = await freelanceEscrow.getAddress();
  console.log("✅ FreelanceEscrow deployed to:", escrowAddress);

  // Setup: Authorize escrow contract in reputation system
  console.log("\n3. Setting up contract permissions...");
  const authTx = await reputationSystem.setAuthorizedContract(escrowAddress, true);
  await authTx.wait();
  console.log("✅ Escrow contract authorized in ReputationSystem");

  // Setup: Add supported tokens (example: add a mock USDT address or use actual token)
  // For local testing, you might want to deploy a mock ERC20 token
  console.log("\n4. Configuration complete!");

  // Print deployment summary
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Platform Wallet:", platformWallet);
  console.log("\nContract Addresses:");
  console.log("- ReputationSystem:", reputationAddress);
  console.log("- FreelanceEscrow:", escrowAddress);
  console.log("=".repeat(60));

  // Save deployment addresses to a file
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    platformWallet: platformWallet,
    contracts: {
      ReputationSystem: reputationAddress,
      FreelanceEscrow: escrowAddress,
    },
    timestamp: new Date().toISOString(),
  };

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const filename = `${deploymentsDir}/${hre.network.name}-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n📄 Deployment info saved to: ${filename}`);

  // Verification instructions
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n📝 To verify contracts on Etherscan, run:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${reputationAddress}`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${escrowAddress} ${platformWallet}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

