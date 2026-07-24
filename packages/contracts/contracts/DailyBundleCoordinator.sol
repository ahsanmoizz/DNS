// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IDailyBundleRegistrar {
    function registerWithBundleDiscount(string calldata label, address owner, uint64 duration, bytes32 secret) external payable;
}

/// @notice Executes a user-confirmed multi-TLD reveal in one transaction after each registrar commitment matures.
contract DailyBundleCoordinator is AccessControl, ReentrancyGuard {
    bytes32 public constant REGISTRAR_MANAGER_ROLE = keccak256("REGISTRAR_MANAGER_ROLE");
    mapping(uint8 => address) public registrars;
    event RegistrarConfigured(uint8 indexed tld, address indexed registrar);
    event BundleRegistered(address indexed owner, uint8[] tlds, uint256 totalPaid);

    constructor(address admin, address dly, address day, address daily) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin); _grantRole(REGISTRAR_MANAGER_ROLE, admin);
        registrars[0] = dly; registrars[1] = day; registrars[2] = daily;
        emit RegistrarConfigured(0, dly); emit RegistrarConfigured(1, day); emit RegistrarConfigured(2, daily);
    }
    function setRegistrar(uint8 tld, address registrar) external onlyRole(REGISTRAR_MANAGER_ROLE) { require(tld < 3 && registrar != address(0), "bad registrar"); registrars[tld] = registrar; emit RegistrarConfigured(tld, registrar); }
    function registerBundle(uint8[] calldata tlds, string[] calldata labels, address owner, uint64 duration, bytes32[] calldata secrets, uint256[] calldata values) external payable nonReentrant {
        uint256 count = tlds.length; require(count >= 2 && count <= 3 && labels.length == count && secrets.length == count && values.length == count, "bad bundle"); uint256 total;
        for (uint256 i; i < count; ++i) { require(tlds[i] < 3 && registrars[tlds[i]] != address(0), "unknown tld"); for (uint256 j; j < i; ++j) require(tlds[j] != tlds[i], "duplicate tld"); total += values[i]; }
        require(msg.value == total, "incorrect bundle value");
        for (uint256 i; i < count; ++i) IDailyBundleRegistrar(registrars[tlds[i]]).registerWithBundleDiscount{value: values[i]}(labels[i], owner, duration, secrets[i]);
        emit BundleRegistered(owner, tlds, total);
    }
}
