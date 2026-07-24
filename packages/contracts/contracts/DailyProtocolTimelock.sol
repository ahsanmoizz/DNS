// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";

/// @notice Delayed executor for protocol-wide high-risk operations.
/// Relevant registrar, resolver, and escrow roles are transferred here after deployment.
contract DailyProtocolTimelock is TimelockController {
    constructor(uint256 minimumDelay, address[] memory proposers, address[] memory executors, address initialAdmin)
        TimelockController(minimumDelay, proposers, executors, initialAdmin) {}
}
