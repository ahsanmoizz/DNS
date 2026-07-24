// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/// @notice Optional immutable anchors for encrypted Daily Mail envelope hashes.
contract DailyMailAnchor is AccessControl, Pausable {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    mapping(bytes32 => address) public anchoredBy;
    mapping(bytes32 => uint64) public anchoredAt;
    event MailHashAnchored(bytes32 indexed messageHash, address indexed sender, uint64 timestamp);

    constructor(address admin) { _grantRole(DEFAULT_ADMIN_ROLE, admin); _grantRole(PAUSER_ROLE, admin); }
    function anchor(bytes32 messageHash) external whenNotPaused { require(messageHash != bytes32(0) && anchoredAt[messageHash] == 0, "already anchored"); anchoredBy[messageHash] = msg.sender; anchoredAt[messageHash] = uint64(block.timestamp); emit MailHashAnchored(messageHash, msg.sender, uint64(block.timestamp)); }
    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }
}
