// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {DailyRegistry} from "./DailyRegistry.sol";

interface IReverseNameResolver { function name(address account) external view returns (string memory); }

/// @notice Wallet-to-Daily-name reverse records. A wallet can set a reverse
/// record only for a name it currently owns in the Daily registry.
contract DailyReverseResolver is IERC165, IReverseNameResolver {
    DailyRegistry public immutable registry;
    mapping(address => string) private names;
    mapping(address => bytes32) public nodes;

    event ReverseNameChanged(address indexed account, bytes32 indexed node, string name);

    constructor(DailyRegistry registry_) { registry = registry_; }

    function setName(bytes32 node, string calldata name_) external {
        require(registry.owner(node) == msg.sender, "not name owner");
        require(bytes(name_).length > 0 && bytes(name_).length <= 255, "bad name");
        names[msg.sender] = name_; nodes[msg.sender] = node; emit ReverseNameChanged(msg.sender, node, name_);
    }

    function clearName() external { delete names[msg.sender]; delete nodes[msg.sender]; emit ReverseNameChanged(msg.sender, bytes32(0), ""); }

    function name(address account) external view returns (string memory) { return nodes[account] != bytes32(0) && registry.owner(nodes[account]) == account ? names[account] : ""; }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) { return interfaceId == type(IERC165).interfaceId || interfaceId == type(IReverseNameResolver).interfaceId; }
}
