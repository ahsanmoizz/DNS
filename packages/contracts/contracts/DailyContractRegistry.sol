// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControlDefaultAdminRules} from "@openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol";

/// @notice Environment-scoped address book for Daily protocol components.
contract DailyContractRegistry is AccessControlDefaultAdminRules {
    bytes32 public constant ADDRESS_MANAGER_ROLE = keccak256("ADDRESS_MANAGER_ROLE");
    mapping(bytes32 => address) private addresses;
    event ContractAddressChanged(bytes32 indexed key, address indexed value);

    constructor(address admin) AccessControlDefaultAdminRules(2 days, admin) { _grantRole(ADDRESS_MANAGER_ROLE, admin); }
    function setAddress(bytes32 key, address value) external onlyRole(ADDRESS_MANAGER_ROLE) { require(value != address(0), "zero address"); addresses[key] = value; emit ContractAddressChanged(key, value); }
    function getAddress(bytes32 key) external view returns (address) { return addresses[key]; }
}
