// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {DailyRegistry} from "./DailyRegistry.sol";

contract DailyNameRegistrar is ERC721, AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant PRICING_MANAGER_ROLE = keccak256("PRICING_MANAGER_ROLE");
    bytes32 public constant CATALOG_MANAGER_ROLE = keccak256("CATALOG_MANAGER_ROLE");
    bytes32 public constant TREASURY_MANAGER_ROLE = keccak256("TREASURY_MANAGER_ROLE");
    bytes32 public constant QUOTE_MANAGER_ROLE = keccak256("QUOTE_MANAGER_ROLE");
    bytes32 public constant BUNDLE_OPERATOR_ROLE = keccak256("BUNDLE_OPERATOR_ROLE");
    DailyRegistry public immutable registry; bytes32 public immutable tldNode; address payable public treasury; string public tld;
    uint64 public minCommitmentAge = 60; uint64 public maxCommitmentAge = 1 days; uint64 public gracePeriod = 90 days; uint16 public bundleDiscountBps; bool public registrationsEnabled = true;
    struct ScheduledPrice { uint256 value; uint64 effectiveAt; }
    struct CatalogRule { string keyword; uint8 category; uint8 matchType; bool active; }
    struct PremiumQuote { uint256 registrationAnnualPrice; uint256 renewalAnnualPrice; uint64 expiresAt; bool active; }
    mapping(bytes32 => uint64) public commitments; mapping(bytes32 => uint64) public expiries; mapping(bytes32 => bytes32) public nodeLabelhash; mapping(uint8 => uint256) public annualPrice; mapping(uint8 => ScheduledPrice) public scheduledAnnualPrice; mapping(bytes32 => uint8) public catalog;
    mapping(bytes32 => PremiumQuote) public premiumQuotes;
    CatalogRule[] private catalogRules;
    event NameRegistered(string name, bytes32 indexed node, address indexed owner, uint64 expiry, uint256 price);
    event NameRenewed(bytes32 indexed node, uint64 expiry, uint256 price); event CommitmentMade(bytes32 indexed commitment);
    event CatalogUpdated(bytes32 indexed labelhash, uint8 category); event CatalogRuleUpdated(uint256 indexed ruleId, string keyword, uint8 category, uint8 matchType, bool active); event RegistrationStatusChanged(bool enabled); event TreasuryChanged(address indexed treasury); event AnnualPriceScheduled(uint8 indexed tier, uint256 value, uint64 effectiveAt); event BundleDiscountChanged(uint16 discountBps); event GracePeriodChanged(uint64 gracePeriod); event CommitmentAgesChanged(uint64 minimumAge, uint64 maximumAge); event PremiumQuoteUpdated(bytes32 indexed labelhash, uint256 registrationAnnualPrice, uint256 renewalAnnualPrice, uint64 expiresAt, bool active); event PremiumQuoteAccepted(bytes32 indexed labelhash, address indexed owner, uint256 price);
    constructor(string memory tokenName, string memory tokenSymbol, string memory tld_, DailyRegistry registry_, bytes32 tldNode_, address admin, address payable treasury_) ERC721(tokenName, tokenSymbol) { registry = registry_; tldNode = tldNode_; tld = tld_; treasury = treasury_; _grantRole(DEFAULT_ADMIN_ROLE, admin); _grantRole(PRICING_MANAGER_ROLE, admin); _grantRole(CATALOG_MANAGER_ROLE, admin); _grantRole(TREASURY_MANAGER_ROLE, admin); _grantRole(QUOTE_MANAGER_ROLE, admin); }
    function commit(bytes32 commitment) external whenNotPaused { commitments[commitment] = uint64(block.timestamp); emit CommitmentMade(commitment); }
    function register(string calldata label, address owner, uint64 duration, bytes32 secret) external payable nonReentrant whenNotPaused { _register(label, owner, duration, secret, 0); }
    function registerWithBundleDiscount(string calldata label, address owner, uint64 duration, bytes32 secret) external payable nonReentrant whenNotPaused onlyRole(BUNDLE_OPERATOR_ROLE) { _register(label, owner, duration, secret, bundleDiscountBps); }
    function renew(bytes32 node, uint64 duration) external payable nonReentrant whenNotPaused { require(expiries[node] + gracePeriod >= block.timestamp, "outside grace"); uint256 cost = annualPrice[8] * duration / 365 days; PremiumQuote memory quote = premiumQuotes[nodeLabelhash[node]]; if (quote.active && quote.renewalAnnualPrice != 0) cost = quote.renewalAnnualPrice * duration / 365 days; require(msg.value >= cost, "insufficient DLY"); expiries[node] += duration; _forwardAndRefund(cost); emit NameRenewed(node, expiries[node], cost); }
    function price(uint256 length, uint64 duration) public view returns (uint256) { uint8 tier = length < 4 ? 3 : length < 8 ? 4 : 8; ScheduledPrice memory scheduled = scheduledAnnualPrice[tier]; uint256 base = scheduled.effectiveAt != 0 && block.timestamp >= scheduled.effectiveAt ? scheduled.value : annualPrice[tier]; return base * duration / 365 days; }
    function setAnnualPrice(uint8 tier, uint256 value) external onlyRole(PRICING_MANAGER_ROLE) { annualPrice[tier] = value; delete scheduledAnnualPrice[tier]; }
    function setBundleDiscountBps(uint16 discountBps) external onlyRole(PRICING_MANAGER_ROLE) { require(discountBps <= 5_000, "discount too high"); bundleDiscountBps = discountBps; emit BundleDiscountChanged(discountBps); }
    function scheduleAnnualPrice(uint8 tier, uint256 value, uint64 effectiveAt) external onlyRole(PRICING_MANAGER_ROLE) { require(effectiveAt > block.timestamp, "effective time required"); scheduledAnnualPrice[tier] = ScheduledPrice(value, effectiveAt); emit AnnualPriceScheduled(tier, value, effectiveAt); }
    function setRegistrationsEnabled(bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) { registrationsEnabled = enabled; emit RegistrationStatusChanged(enabled); }
    function setTreasury(address payable nextTreasury) external onlyRole(TREASURY_MANAGER_ROLE) { require(nextTreasury != address(0), "zero treasury"); treasury = nextTreasury; emit TreasuryChanged(nextTreasury); }
    function setCatalog(bytes32 labelhash, uint8 category) external onlyRole(CATALOG_MANAGER_ROLE) { require(category <= 4, "bad category"); catalog[labelhash] = category; emit CatalogUpdated(labelhash, category); }
    function setPremiumQuote(bytes32 labelhash, uint256 registrationAnnualPrice, uint256 renewalAnnualPrice, uint64 expiresAt, bool active) external onlyRole(QUOTE_MANAGER_ROLE) { require(!active || (registrationAnnualPrice > 0 && renewalAnnualPrice > 0 && expiresAt > block.timestamp), "bad premium quote"); premiumQuotes[labelhash] = PremiumQuote(registrationAnnualPrice, renewalAnnualPrice, expiresAt, active); emit PremiumQuoteUpdated(labelhash, registrationAnnualPrice, renewalAnnualPrice, expiresAt, active); }
    function setCatalogRule(uint256 ruleId, string calldata keyword, uint8 category, uint8 matchType, bool active) external onlyRole(CATALOG_MANAGER_ROLE) {
        require(bytes(keyword).length > 0 && bytes(keyword).length <= 63, "bad keyword"); require(category <= 4 && matchType <= 3, "bad rule");
        if (ruleId == catalogRules.length) catalogRules.push(CatalogRule(keyword, category, matchType, active));
        else { require(ruleId < catalogRules.length, "bad rule id"); catalogRules[ruleId] = CatalogRule(keyword, category, matchType, active); }
        emit CatalogRuleUpdated(ruleId, keyword, category, matchType, active);
    }
    function catalogRuleCount() external view returns (uint256) { return catalogRules.length; }
    function catalogRule(uint256 ruleId) external view returns (string memory keyword, uint8 category, uint8 matchType, bool active) { CatalogRule storage rule = catalogRules[ruleId]; return (rule.keyword, rule.category, rule.matchType, rule.active); }
    function categoryFor(string memory label) public view returns (uint8) {
        uint8 exact = catalog[keccak256(bytes(label))]; if (exact != 0) return exact;
        bytes memory value = bytes(label); for (uint256 i; i < catalogRules.length; ++i) { CatalogRule storage rule = catalogRules[i]; if (rule.active && _matches(value, bytes(rule.keyword), rule.matchType)) return rule.category; }
        return 0;
    }
    function _matches(bytes memory value, bytes memory keyword, uint8 matchType) private pure returns (bool) {
        if (matchType == 0) return keccak256(value) == keccak256(keyword); if (keyword.length > value.length) return false;
        uint256 offset = matchType == 2 ? value.length - keyword.length : 0;
        if (matchType == 3) { for (uint256 start; start <= value.length - keyword.length; ++start) { bool found = true; for (uint256 j; j < keyword.length; ++j) if (value[start + j] != keyword[j]) { found = false; break; } if (found) return true; } return false; }
        for (uint256 j; j < keyword.length; ++j) if (value[offset + j] != keyword[j]) return false; return true;
    }
    function _forwardAndRefund(uint256 cost) private { (bool sent,) = treasury.call{value: cost}(""); require(sent, "treasury transfer failed"); if (msg.value > cost) { (sent,) = payable(msg.sender).call{value: msg.value - cost}(""); require(sent, "refund failed"); } }
    function _register(string calldata label, address owner, uint64 duration, bytes32 secret, uint16 discountBps) private { require(registrationsEnabled, "tld disabled"); bytes32 labelhash = keccak256(bytes(label)); bytes32 commitment = keccak256(abi.encodePacked(labelhash, owner, duration, secret)); uint64 made = commitments[commitment]; require(made != 0 && block.timestamp >= made + minCommitmentAge && block.timestamp <= made + maxCommitmentAge, "invalid commitment"); delete commitments[commitment]; uint8 category = categoryFor(label); require(category == 0 || category == 1, "restricted name"); uint256 cost = price(bytes(label).length, duration); if (category == 1) { PremiumQuote memory quote = premiumQuotes[labelhash]; require(quote.active && quote.expiresAt >= block.timestamp, "premium quote expired"); cost = quote.registrationAnnualPrice * duration / 365 days; emit PremiumQuoteAccepted(labelhash, owner, cost); } if (discountBps != 0) cost = cost * (10_000 - discountBps) / 10_000; require(msg.value >= cost, "insufficient DLY"); bytes32 node = keccak256(abi.encodePacked(tldNode, labelhash)); require(expiries[node] + gracePeriod < block.timestamp, "name unavailable"); uint64 expiry = uint64(block.timestamp + duration); expiries[node] = expiry; nodeLabelhash[node] = labelhash; uint256 tokenId = uint256(node); if (_ownerOf(tokenId) != address(0)) _burn(tokenId); _safeMint(owner, tokenId); registry.setSubnodeOwner(tldNode, labelhash, owner); _forwardAndRefund(cost); emit NameRegistered(string.concat(label, ".", tld), node, owner, expiry, cost); }
    function setCommitmentAges(uint64 minAge, uint64 maxAge) external onlyRole(DEFAULT_ADMIN_ROLE) { require(minAge > 0 && maxAge > minAge, "bad commitment ages"); minCommitmentAge = minAge; maxCommitmentAge = maxAge; emit CommitmentAgesChanged(minAge, maxAge); }
    function setGracePeriod(uint64 nextGracePeriod) external onlyRole(DEFAULT_ADMIN_ROLE) { require(nextGracePeriod >= 1 days && nextGracePeriod <= 365 days, "bad grace period"); gracePeriod = nextGracePeriod; emit GracePeriodChanged(nextGracePeriod); }
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); } function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) { return super.supportsInterface(interfaceId); }
}
