// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract DailyCampaignEscrow is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant POLICY_MANAGER_ROLE = keccak256("POLICY_MANAGER_ROLE");
    bytes32 public constant REWARD_MANAGER_ROLE = keccak256("REWARD_MANAGER_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    struct Campaign { address payable marketer; uint128 rewardBudget; uint128 platformFee; uint64 deadline; bool blocked; bool settled; }
    address payable public treasury; uint16 public platformFeeBps = 1000; uint256 public minimumBudget = 1 ether;
    struct MerkleClaim { uint256 index; address payable recipient; uint128 amount; bytes32[] proof; }
    mapping(bytes32 => Campaign) public campaigns; mapping(bytes32 => mapping(address => bool)) public paid; mapping(bytes32 => bytes32) public rewardRoots; mapping(bytes32 => mapping(uint256 => uint256)) private claimedBitMap;
    event CampaignFunded(bytes32 indexed campaignId, address indexed marketer, uint256 rewardBudget, uint256 platformFee, uint64 deadline);
    event RewardPaid(bytes32 indexed campaignId, address indexed recipient, uint256 amount); event CampaignBlocked(bytes32 indexed campaignId); event RefundClaimed(bytes32 indexed campaignId, uint256 amount); event RewardRootSet(bytes32 indexed campaignId, bytes32 indexed root); event RewardClaimed(bytes32 indexed campaignId, uint256 indexed index, address indexed recipient, uint256 amount);
    constructor(address admin, address payable treasury_) { treasury = treasury_; _grantRole(DEFAULT_ADMIN_ROLE, admin); _grantRole(POLICY_MANAGER_ROLE, admin); _grantRole(REWARD_MANAGER_ROLE, admin); _grantRole(MODERATOR_ROLE, admin); }
    function fund(bytes32 campaignId, uint128 rewardBudget, uint64 deadline) external payable whenNotPaused nonReentrant { require(campaigns[campaignId].marketer == address(0), "exists"); require(rewardBudget >= minimumBudget && deadline > block.timestamp, "invalid campaign"); uint128 fee = uint128(uint256(rewardBudget) * platformFeeBps / 10_000); require(msg.value == uint256(rewardBudget) + fee, "incorrect DLY"); campaigns[campaignId] = Campaign(payable(msg.sender), rewardBudget, fee, deadline, false, false); (bool sent,) = treasury.call{value: fee}(""); require(sent, "fee transfer failed"); emit CampaignFunded(campaignId, msg.sender, rewardBudget, fee, deadline); }
    function payReward(bytes32 campaignId, address payable recipient, uint128 amount) external onlyRole(REWARD_MANAGER_ROLE) whenNotPaused nonReentrant { Campaign storage c = campaigns[campaignId]; require(!c.blocked && !c.settled && !paid[campaignId][recipient] && amount <= c.rewardBudget, "reward unavailable"); paid[campaignId][recipient] = true; c.rewardBudget -= amount; (bool sent,) = recipient.call{value: amount}(""); require(sent, "reward transfer failed"); emit RewardPaid(campaignId, recipient, amount); }
    function setRewardRoot(bytes32 campaignId, bytes32 root) external onlyRole(REWARD_MANAGER_ROLE) { Campaign storage c = campaigns[campaignId]; require(c.marketer != address(0) && !c.settled && !c.blocked, "campaign unavailable"); require(root != bytes32(0) && rewardRoots[campaignId] == bytes32(0), "reward root immutable"); rewardRoots[campaignId] = root; emit RewardRootSet(campaignId, root); }
    function isClaimed(bytes32 campaignId, uint256 index) public view returns (bool) { uint256 wordIndex = index / 256; uint256 bitIndex = index % 256; return claimedBitMap[campaignId][wordIndex] & (1 << bitIndex) != 0; }
    function claimReward(bytes32 campaignId, uint256 index, address payable recipient, uint128 amount, bytes32[] calldata proof) public whenNotPaused nonReentrant {
        Campaign storage c = campaigns[campaignId]; require(!c.blocked && !c.settled && block.timestamp < c.deadline && !isClaimed(campaignId, index) && amount <= c.rewardBudget, "claim unavailable"); bytes32 root = rewardRoots[campaignId]; require(root != bytes32(0), "reward root missing"); bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(index, recipient, amount)))); require(MerkleProof.verify(proof, root, leaf), "bad proof"); uint256 wordIndex = index / 256; uint256 bitIndex = index % 256; claimedBitMap[campaignId][wordIndex] |= 1 << bitIndex; paid[campaignId][recipient] = true; c.rewardBudget -= amount; (bool sent,) = recipient.call{value: amount}(""); require(sent, "reward transfer failed"); emit RewardClaimed(campaignId, index, recipient, amount);
    }
    function claimRewards(bytes32 campaignId, MerkleClaim[] calldata claims) external { require(claims.length > 0 && claims.length <= 100, "bad batch"); for (uint256 i; i < claims.length; ++i) { MerkleClaim calldata claim = claims[i]; claimReward(campaignId, claim.index, claim.recipient, claim.amount, claim.proof); } }
    function blockCampaign(bytes32 campaignId) external onlyRole(MODERATOR_ROLE) { campaigns[campaignId].blocked = true; emit CampaignBlocked(campaignId); }
    function refundUnused(bytes32 campaignId) external nonReentrant { Campaign storage c = campaigns[campaignId]; require(msg.sender == c.marketer && block.timestamp >= c.deadline && !c.settled, "refund unavailable"); _refund(campaignId, c); }
    function refundBlocked(bytes32 campaignId) external nonReentrant { Campaign storage c = campaigns[campaignId]; require(msg.sender == c.marketer && c.blocked && !c.settled, "blocked refund unavailable"); _refund(campaignId, c); }
    function _refund(bytes32 campaignId, Campaign storage c) private { c.settled = true; uint256 amount = c.rewardBudget; c.rewardBudget = 0; (bool sent,) = c.marketer.call{value: amount}(""); require(sent, "refund failed"); emit RefundClaimed(campaignId, amount); }
    function setPolicy(uint16 feeBps, uint256 minBudget) external onlyRole(POLICY_MANAGER_ROLE) { require(feeBps <= 2_000, "fee cap"); platformFeeBps = feeBps; minimumBudget = minBudget; }
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); } function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }
}
