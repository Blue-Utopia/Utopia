// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FreelanceEscrow
 * @dev Manages escrow payments for freelance jobs
 * - Client deposits 50% upfront
 * - Remaining 50% paid on completion
 * - Supports multiple ERC20 tokens (USDT, USDC, etc.)
 */
contract FreelanceEscrow is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    enum JobStatus {
        Created,
        Funded,
        InProgress,
        UnderReview,
        Completed,
        Disputed,
        Cancelled,
        Refunded
    }

    struct Job {
        uint256 jobId;
        address client;
        address developer;
        address paymentToken;
        uint256 totalAmount;
        uint256 paidAmount;
        JobStatus status;
        uint256 createdAt;
        uint256 deadline;
        bool clientApproved;
        bool developerApproved;
    }

    // Platform fee (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFee = 250;
    uint256 public constant FEE_DENOMINATOR = 10000;

    // Job counter
    uint256 private _jobIdCounter;

    // Mapping from job ID to Job
    mapping(uint256 => Job) public jobs;

    // Mapping to track supported payment tokens
    mapping(address => bool) public supportedTokens;

    // Platform wallet for collecting fees
    address public platformWallet;

    // Events
    event JobCreated(
        uint256 indexed jobId,
        address indexed client,
        address indexed developer,
        address paymentToken,
        uint256 totalAmount
    );

    event FundsDeposited(
        uint256 indexed jobId,
        address indexed depositor,
        uint256 amount
    );

    event JobCompleted(
        uint256 indexed jobId,
        address indexed developer,
        uint256 amount
    );

    event JobDisputed(uint256 indexed jobId, address indexed initiator);

    event DisputeResolved(
        uint256 indexed jobId,
        address winner,
        uint256 clientAmount,
        uint256 developerAmount
    );

    event JobCancelled(uint256 indexed jobId);

    event JobRefunded(uint256 indexed jobId, uint256 amount);

    event PlatformFeeUpdated(uint256 newFee);

    event TokenSupportUpdated(address indexed token, bool supported);

    constructor(address _platformWallet) {
        require(_platformWallet != address(0), "Invalid platform wallet");
        platformWallet = _platformWallet;
    }

    /**
     * @dev Create a new job
     */
    function createJob(
        address _developer,
        address _paymentToken,
        uint256 _totalAmount,
        uint256 _deadline
    ) external returns (uint256) {
        require(_developer != address(0), "Invalid developer address");
        require(_developer != msg.sender, "Client cannot be developer");
        require(supportedTokens[_paymentToken], "Token not supported");
        require(_totalAmount > 0, "Amount must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in future");

        uint256 jobId = _jobIdCounter++;

        jobs[jobId] = Job({
            jobId: jobId,
            client: msg.sender,
            developer: _developer,
            paymentToken: _paymentToken,
            totalAmount: _totalAmount,
            paidAmount: 0,
            status: JobStatus.Created,
            createdAt: block.timestamp,
            deadline: _deadline,
            clientApproved: false,
            developerApproved: false
        });

        emit JobCreated(jobId, msg.sender, _developer, _paymentToken, _totalAmount);

        return jobId;
    }

    /**
     * @dev Client deposits 50% upfront to start the job
     */
    function depositInitialPayment(uint256 _jobId) external nonReentrant {
        Job storage job = jobs[_jobId];

        require(job.client == msg.sender, "Only client can deposit");
        require(job.status == JobStatus.Created, "Job not in created state");

        uint256 initialAmount = job.totalAmount / 2;

        IERC20(job.paymentToken).safeTransferFrom(
            msg.sender,
            address(this),
            initialAmount
        );

        job.paidAmount = initialAmount;
        job.status = JobStatus.Funded;

        emit FundsDeposited(_jobId, msg.sender, initialAmount);
    }

    /**
     * @dev Developer marks job as in progress
     */
    function startJob(uint256 _jobId) external {
        Job storage job = jobs[_jobId];

        require(job.developer == msg.sender, "Only developer can start job");
        require(job.status == JobStatus.Funded, "Job not funded");

        job.status = JobStatus.InProgress;
    }

    /**
     * @dev Developer submits work for review
     */
    function submitWork(uint256 _jobId) external {
        Job storage job = jobs[_jobId];

        require(job.developer == msg.sender, "Only developer can submit");
        require(job.status == JobStatus.InProgress, "Job not in progress");

        job.status = JobStatus.UnderReview;
    }

    /**
     * @dev Client deposits remaining 50% and approves completion
     */
    function approveAndPayRemaining(uint256 _jobId) external nonReentrant {
        Job storage job = jobs[_jobId];

        require(job.client == msg.sender, "Only client can approve");
        require(
            job.status == JobStatus.UnderReview,
            "Job not under review"
        );

        uint256 remainingAmount = job.totalAmount - job.paidAmount;

        // Transfer remaining amount from client
        IERC20(job.paymentToken).safeTransferFrom(
            msg.sender,
            address(this),
            remainingAmount
        );

        job.paidAmount = job.totalAmount;
        job.clientApproved = true;
        job.status = JobStatus.Completed;

        // Calculate platform fee
        uint256 fee = (job.totalAmount * platformFee) / FEE_DENOMINATOR;
        uint256 developerAmount = job.totalAmount - fee;

        // Transfer fee to platform
        if (fee > 0) {
            IERC20(job.paymentToken).safeTransfer(platformWallet, fee);
        }

        // Transfer payment to developer
        IERC20(job.paymentToken).safeTransfer(job.developer, developerAmount);

        emit JobCompleted(_jobId, job.developer, developerAmount);
    }

    /**
     * @dev Initiate a dispute
     */
    function initiateDispute(uint256 _jobId) external {
        Job storage job = jobs[_jobId];

        require(
            msg.sender == job.client || msg.sender == job.developer,
            "Not authorized"
        );
        require(
            job.status == JobStatus.InProgress ||
                job.status == JobStatus.UnderReview,
            "Cannot dispute at this stage"
        );

        job.status = JobStatus.Disputed;

        emit JobDisputed(_jobId, msg.sender);
    }

    /**
     * @dev Resolve dispute (called by platform owner or DAO)
     * @param _clientPercentage Percentage to client (in basis points)
     */
    function resolveDispute(
        uint256 _jobId,
        uint256 _clientPercentage
    ) external onlyOwner nonReentrant {
        Job storage job = jobs[_jobId];

        require(job.status == JobStatus.Disputed, "Job not disputed");
        require(_clientPercentage <= FEE_DENOMINATOR, "Invalid percentage");

        uint256 clientAmount = (job.paidAmount * _clientPercentage) / FEE_DENOMINATOR;
        uint256 developerAmount = job.paidAmount - clientAmount;

        job.status = JobStatus.Completed;

        // Transfer amounts
        if (clientAmount > 0) {
            IERC20(job.paymentToken).safeTransfer(job.client, clientAmount);
        }

        if (developerAmount > 0) {
            IERC20(job.paymentToken).safeTransfer(job.developer, developerAmount);
        }

        emit DisputeResolved(_jobId, address(0), clientAmount, developerAmount);
    }

    /**
     * @dev Cancel job (only before funding or by mutual agreement)
     */
    function cancelJob(uint256 _jobId) external {
        Job storage job = jobs[_jobId];

        require(
            msg.sender == job.client || msg.sender == job.developer,
            "Not authorized"
        );

        if (job.status == JobStatus.Created) {
            require(msg.sender == job.client, "Only client can cancel");
            job.status = JobStatus.Cancelled;
            emit JobCancelled(_jobId);
        } else if (job.status == JobStatus.Funded || job.status == JobStatus.InProgress) {
            // Require both parties to agree
            if (msg.sender == job.client) {
                job.clientApproved = true;
            } else {
                job.developerApproved = true;
            }

            if (job.clientApproved && job.developerApproved) {
                job.status = JobStatus.Cancelled;
                
                // Refund paid amount to client
                if (job.paidAmount > 0) {
                    IERC20(job.paymentToken).safeTransfer(job.client, job.paidAmount);
                    emit JobRefunded(_jobId, job.paidAmount);
                }
                
                emit JobCancelled(_jobId);
            }
        }
    }

    /**
     * @dev Add or remove supported payment token
     */
    function setSupportedToken(address _token, bool _supported) external onlyOwner {
        require(_token != address(0), "Invalid token address");
        supportedTokens[_token] = _supported;
        emit TokenSupportUpdated(_token, _supported);
    }

    /**
     * @dev Update platform fee
     */
    function setPlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee too high (max 10%)");
        platformFee = _newFee;
        emit PlatformFeeUpdated(_newFee);
    }

    /**
     * @dev Update platform wallet
     */
    function setPlatformWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "Invalid wallet address");
        platformWallet = _newWallet;
    }

    /**
     * @dev Get job details
     */
    function getJob(uint256 _jobId) external view returns (Job memory) {
        return jobs[_jobId];
    }
}

