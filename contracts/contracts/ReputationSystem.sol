// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReputationSystem
 * @dev On-chain reputation tracking for freelancers and clients
 * - Immutable reputation scores
 * - Track completed jobs, ratings, earnings
 * - Skill badges and verification
 */
contract ReputationSystem is Ownable {
    
    struct UserReputation {
        uint256 totalJobs;
        uint256 completedJobs;
        uint256 cancelledJobs;
        uint256 disputedJobs;
        uint256 totalEarnings; // For developers
        uint256 totalSpent; // For clients
        uint256 totalRatingPoints; // Sum of all ratings
        uint256 ratingCount; // Number of ratings received
        uint256 lastActiveTimestamp;
        bool isVerified;
        bool isBanned;
    }

    struct Rating {
        address rater;
        address ratee;
        uint256 jobId;
        uint8 rating; // 1-5 stars
        string comment;
        uint256 timestamp;
    }

    struct SkillBadge {
        string skillName;
        uint256 earnedAt;
        address verifiedBy;
    }

    // Mapping from user address to reputation
    mapping(address => UserReputation) public userReputations;

    // Mapping from user address to array of ratings
    mapping(address => Rating[]) public userRatings;

    // Mapping from user address to skill badges
    mapping(address => SkillBadge[]) public userSkillBadges;

    // Mapping to track if a job has been rated (jobId => rater => bool)
    mapping(uint256 => mapping(address => bool)) public hasRated;

    // Authorized contracts that can update reputation
    mapping(address => bool) public authorizedContracts;

    // Events
    event ReputationUpdated(
        address indexed user,
        uint256 totalJobs,
        uint256 completedJobs,
        uint256 averageRating
    );

    event RatingAdded(
        address indexed rater,
        address indexed ratee,
        uint256 indexed jobId,
        uint8 rating
    );

    event SkillBadgeEarned(
        address indexed user,
        string skillName,
        address indexed verifier
    );

    event UserVerified(address indexed user);

    event UserBanned(address indexed user, bool banned);

    event ContractAuthorized(address indexed contractAddress, bool authorized);

    modifier onlyAuthorized() {
        require(
            authorizedContracts[msg.sender] || msg.sender == owner(),
            "Not authorized"
        );
        _;
    }

    /**
     * @dev Add or update a rating for a user
     */
    function addRating(
        address _ratee,
        uint256 _jobId,
        uint8 _rating,
        string memory _comment
    ) external {
        require(_ratee != address(0), "Invalid ratee address");
        require(_ratee != msg.sender, "Cannot rate yourself");
        require(_rating >= 1 && _rating <= 5, "Rating must be 1-5");
        require(!hasRated[_jobId][msg.sender], "Already rated this job");

        UserReputation storage reputation = userReputations[_ratee];

        // Add rating
        Rating memory newRating = Rating({
            rater: msg.sender,
            ratee: _ratee,
            jobId: _jobId,
            rating: _rating,
            comment: _comment,
            timestamp: block.timestamp
        });

        userRatings[_ratee].push(newRating);

        // Update reputation
        reputation.totalRatingPoints += _rating;
        reputation.ratingCount += 1;

        // Mark as rated
        hasRated[_jobId][msg.sender] = true;

        emit RatingAdded(msg.sender, _ratee, _jobId, _rating);
        emit ReputationUpdated(
            _ratee,
            reputation.totalJobs,
            reputation.completedJobs,
            getAverageRating(_ratee)
        );
    }

    /**
     * @dev Update job completion statistics (called by escrow contract)
     */
    function updateJobCompletion(
        address _user,
        bool _completed,
        bool _disputed,
        uint256 _amount
    ) external onlyAuthorized {
        require(_user != address(0), "Invalid user address");

        UserReputation storage reputation = userReputations[_user];

        reputation.totalJobs += 1;

        if (_completed) {
            reputation.completedJobs += 1;
            reputation.totalEarnings += _amount; // For developers
        } else {
            reputation.cancelledJobs += 1;
        }

        if (_disputed) {
            reputation.disputedJobs += 1;
        }

        reputation.lastActiveTimestamp = block.timestamp;

        emit ReputationUpdated(
            _user,
            reputation.totalJobs,
            reputation.completedJobs,
            getAverageRating(_user)
        );
    }

    /**
     * @dev Update client spending (called by escrow contract)
     */
    function updateClientSpending(address _client, uint256 _amount) external onlyAuthorized {
        require(_client != address(0), "Invalid client address");
        
        UserReputation storage reputation = userReputations[_client];
        reputation.totalSpent += _amount;
        reputation.lastActiveTimestamp = block.timestamp;
    }

    /**
     * @dev Award a skill badge to a user
     */
    function awardSkillBadge(
        address _user,
        string memory _skillName
    ) external onlyAuthorized {
        require(_user != address(0), "Invalid user address");
        require(bytes(_skillName).length > 0, "Skill name required");

        SkillBadge memory badge = SkillBadge({
            skillName: _skillName,
            earnedAt: block.timestamp,
            verifiedBy: msg.sender
        });

        userSkillBadges[_user].push(badge);

        emit SkillBadgeEarned(_user, _skillName, msg.sender);
    }

    /**
     * @dev Verify a user (after skill validation)
     */
    function verifyUser(address _user) external onlyAuthorized {
        require(_user != address(0), "Invalid user address");
        userReputations[_user].isVerified = true;
        emit UserVerified(_user);
    }

    /**
     * @dev Ban or unban a user
     */
    function setBannedStatus(address _user, bool _banned) external onlyOwner {
        require(_user != address(0), "Invalid user address");
        userReputations[_user].isBanned = _banned;
        emit UserBanned(_user, _banned);
    }

    /**
     * @dev Authorize a contract to update reputation
     */
    function setAuthorizedContract(address _contract, bool _authorized) external onlyOwner {
        require(_contract != address(0), "Invalid contract address");
        authorizedContracts[_contract] = _authorized;
        emit ContractAuthorized(_contract, _authorized);
    }

    /**
     * @dev Get user's average rating (scaled by 100, e.g., 450 = 4.50 stars)
     */
    function getAverageRating(address _user) public view returns (uint256) {
        UserReputation memory reputation = userReputations[_user];
        
        if (reputation.ratingCount == 0) {
            return 0;
        }

        return (reputation.totalRatingPoints * 100) / reputation.ratingCount;
    }

    /**
     * @dev Get user's completion rate (percentage * 100)
     */
    function getCompletionRate(address _user) public view returns (uint256) {
        UserReputation memory reputation = userReputations[_user];
        
        if (reputation.totalJobs == 0) {
            return 0;
        }

        return (reputation.completedJobs * 10000) / reputation.totalJobs;
    }

    /**
     * @dev Get user's dispute rate (percentage * 100)
     */
    function getDisputeRate(address _user) public view returns (uint256) {
        UserReputation memory reputation = userReputations[_user];
        
        if (reputation.totalJobs == 0) {
            return 0;
        }

        return (reputation.disputedJobs * 10000) / reputation.totalJobs;
    }

    /**
     * @dev Get all ratings for a user
     */
    function getUserRatings(address _user) external view returns (Rating[] memory) {
        return userRatings[_user];
    }

    /**
     * @dev Get all skill badges for a user
     */
    function getUserSkillBadges(address _user) external view returns (SkillBadge[] memory) {
        return userSkillBadges[_user];
    }

    /**
     * @dev Get user reputation summary
     */
    function getUserReputation(address _user) external view returns (
        UserReputation memory reputation,
        uint256 averageRating,
        uint256 completionRate,
        uint256 disputeRate
    ) {
        reputation = userReputations[_user];
        averageRating = getAverageRating(_user);
        completionRate = getCompletionRate(_user);
        disputeRate = getDisputeRate(_user);
    }

    /**
     * @dev Check if user is in good standing
     */
    function isUserInGoodStanding(address _user) external view returns (bool) {
        UserReputation memory reputation = userReputations[_user];
        
        if (reputation.isBanned) {
            return false;
        }

        // Must have completion rate > 80% (8000 in basis points)
        if (reputation.totalJobs >= 5 && getCompletionRate(_user) < 8000) {
            return false;
        }

        // Must have dispute rate < 20% (2000 in basis points)
        if (reputation.totalJobs >= 5 && getDisputeRate(_user) > 2000) {
            return false;
        }

        // Must have average rating >= 3.5 (350)
        if (reputation.ratingCount >= 5 && getAverageRating(_user) < 350) {
            return false;
        }

        return true;
    }
}

