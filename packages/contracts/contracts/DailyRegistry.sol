// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControlDefaultAdminRules} from "@openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol";

contract DailyRegistry is AccessControlDefaultAdminRules {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    struct Record { address owner; address resolver; uint64 ttl; }
    mapping(bytes32 => Record) private records;
    event OwnerChanged(bytes32 indexed node, address indexed owner);
    event ResolverChanged(bytes32 indexed node, address indexed resolver);
    event TTLChanged(bytes32 indexed node, uint64 ttl);
    constructor(address initialAdmin) AccessControlDefaultAdminRules(2 days, initialAdmin) {}
    modifier authorised(bytes32 node) { require(records[node].owner == msg.sender || hasRole(REGISTRAR_ROLE, msg.sender), "not authorised"); _; }
    function owner(bytes32 node) external view returns (address) { return records[node].owner; }
    function resolver(bytes32 node) external view returns (address) { return records[node].resolver; }
    function ttl(bytes32 node) external view returns (uint64) { return records[node].ttl; }
    function setOwner(bytes32 node, address nextOwner) external authorised(node) { records[node].owner = nextOwner; emit OwnerChanged(node, nextOwner); }
    function setResolver(bytes32 node, address nextResolver) external authorised(node) { records[node].resolver = nextResolver; emit ResolverChanged(node, nextResolver); }
    function setTTL(bytes32 node, uint64 nextTtl) external authorised(node) { records[node].ttl = nextTtl; emit TTLChanged(node, nextTtl); }
    function setSubnodeOwner(bytes32 parent, bytes32 labelhash, address nextOwner) external authorised(parent) returns (bytes32 node) { node = keccak256(abi.encodePacked(parent, labelhash)); records[node].owner = nextOwner; emit OwnerChanged(node, nextOwner); }
    /// @notice Atomically removes a delegated subname and every resolver/TTL pointer it carried.
    function revokeSubnode(bytes32 parent, bytes32 labelhash) external authorised(parent) returns (bytes32 node) {
        node = keccak256(abi.encodePacked(parent, labelhash));
        delete records[node];
        emit OwnerChanged(node, address(0));
        emit ResolverChanged(node, address(0));
    }
}
