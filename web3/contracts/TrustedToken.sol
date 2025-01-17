// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CredToken
 * @dev A custom ERC20 token for credential verification with daily reward caps and a top 10 leaderboard.
 */
contract TrustedToken is ERC20, Ownable, ReentrancyGuard {
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10 ** 18; // Max total supply: 1 million tokens
    uint256 public constant DAILY_REWARD_CAP = 50 * 10 ** 18; // Max tokens a user can earn per day

    mapping(address => uint256) public lastRewardTimestamp;
    mapping(address => uint256) public dailyRewards;

    // For leaderboard
    address[] public holders;
    mapping(address => bool) public isHolder;

    uint256 public rewardPerVerification = 10 * 10 ** 18;

    event CredentialVerified(address indexed user, uint256 rewardAmount);
    event TokensBurned(
        address indexed user,
        uint256 amount,
        address indexed burner
    );
    event RewardPerVerificationUpdated(uint256 oldAmount, uint256 newAmount);

    error DailyRewardCapExceeded();
    error MaxSupplyExceeded();
    error InsufficientBalance();

    constructor(
        address initialOwner
    ) ERC20("Credential Token", "CRED") Ownable(initialOwner) {}

    /**
     * @dev Override _update to track holders for leaderboard
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override {
        super._update(from, to, value);

        // Update holders tracking
        if (to != address(0) && !isHolder[to] && balanceOf(to) > 0) {
            holders.push(to);
            isHolder[to] = true;
        }

        // Remove from holders if balance becomes 0
        if (from != address(0) && balanceOf(from) == 0) {
            isHolder[from] = false;
        }
    }

    /**
     * @dev Allows any user to claim rewards for verification.
     * Always mints rewardPerVerification amount of tokens.
     */
    function claimReward() external nonReentrant {
        if (totalSupply() + rewardPerVerification > MAX_SUPPLY) {
            revert MaxSupplyExceeded();
        }

        // Update daily rewards and check the cap
        uint256 currentDay = block.timestamp / 1 days;
        uint256 userLastRewardDay = lastRewardTimestamp[msg.sender] / 1 days;

        if (userLastRewardDay < currentDay) {
            dailyRewards[msg.sender] = 0;
        }

        if (
            dailyRewards[msg.sender] + rewardPerVerification > DAILY_REWARD_CAP
        ) {
            revert DailyRewardCapExceeded();
        }

        dailyRewards[msg.sender] += rewardPerVerification;
        lastRewardTimestamp[msg.sender] = block.timestamp;

        _mint(msg.sender, rewardPerVerification);

        emit CredentialVerified(msg.sender, rewardPerVerification);
    }

    /**
     * @dev Burns tokens from the sender's account.
     * @param amount The amount of tokens to burn.
     */
    function burn(uint256 amount) external nonReentrant {
        if (amount > balanceOf(msg.sender)) {
            revert InsufficientBalance();
        }

        _burn(msg.sender, amount);

        emit TokensBurned(msg.sender, amount, msg.sender);
    }

    /**
     * @dev Allows the owner to burn tokens from a user's account (e.g., for fraudulent activity).
     * @param from The address of the user.
     * @param amount The amount of tokens to burn.
     */
    function penalizeUser(
        address from,
        uint256 amount
    ) external onlyOwner nonReentrant {
        if (amount > balanceOf(from)) {
            revert InsufficientBalance();
        }

        _burn(from, amount);

        emit TokensBurned(from, amount, msg.sender);
    }

    /**
     * @dev Allows the owner to modify the reward amount for each verification.
     * @param newRewardAmount The new reward amount per verification.
     */
    function setRewardPerVerification(
        uint256 newRewardAmount
    ) external onlyOwner {
        require(newRewardAmount > 0, "Reward must be greater than 0");
        uint256 oldAmount = rewardPerVerification;
        rewardPerVerification = newRewardAmount;

        emit RewardPerVerificationUpdated(oldAmount, newRewardAmount);
    }

    /**
     * @dev Get total number of holders
     */
    function getHolderCount() public view returns (uint256) {
        return holders.length;
    }

    /**
     * @dev Retrieves the leaderboard, showing the top 10 token holders.
     * @return topAddresses The list of top 10 addresses.
     * @return topBalances The corresponding balances of the top 10 addresses.
     */
    function getTop10Leaderboard()
        external
        view
        returns (
            address[10] memory topAddresses,
            uint256[10] memory topBalances
        )
    {
        uint256 count = holders.length;

        // Initialize arrays
        for (uint256 i = 0; i < 10; i++) {
            topAddresses[i] = address(0);
            topBalances[i] = 0;
        }

        // Iterate through all holders
        for (uint256 i = 0; i < count && i < 1000; i++) {
            // Cap at 1000 for gas limits
            address holder = holders[i];
            if (!isHolder[holder]) continue; // Skip if no longer a holder

            uint256 balance = balanceOf(holder);
            if (balance == 0) continue; // Double check balance

            // Find insertion point
            for (uint256 j = 0; j < 10; j++) {
                if (balance > topBalances[j]) {
                    // Shift existing entries down
                    for (uint256 k = 9; k > j; k--) {
                        topAddresses[k] = topAddresses[k - 1];
                        topBalances[k] = topBalances[k - 1];
                    }
                    // Insert new entry
                    topAddresses[j] = holder;
                    topBalances[j] = balance;
                    break;
                }
            }
        }

        return (topAddresses, topBalances);
    }
}
