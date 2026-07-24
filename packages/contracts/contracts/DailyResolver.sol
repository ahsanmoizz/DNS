// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {DailyRegistry} from "./DailyRegistry.sol";

interface IAddressResolver { function addr(bytes32 node, uint256 coinType) external view returns (bytes memory); }
interface ITextResolver { function text(bytes32 node, string calldata key) external view returns (string memory); }
interface IContentHashResolver { function contenthash(bytes32 node) external view returns (bytes memory); }
interface IMailKeyResolver { function mailKeyHash(bytes32 node) external view returns (bytes32); function mailKeyVersion(bytes32 node) external view returns (uint32); }

contract DailyResolver is IERC165, AccessControl {
    error OffchainLookup(address sender, string[] urls, bytes callData, bytes4 callbackFunction, bytes extraData);
    bytes32 public constant GATEWAY_MANAGER_ROLE = keccak256("GATEWAY_MANAGER_ROLE");
    DailyRegistry public immutable registry;
    mapping(bytes32 => mapping(uint256 => bytes)) private addresses;
    mapping(bytes32 => mapping(string => string)) private texts;
    mapping(bytes32 => bytes) private contents;
    mapping(bytes32 => bytes32) public mailKeyHash;
    mapping(bytes32 => uint32) public mailKeyVersion;
    address public gatewaySigner;
    string[] private gatewayUrls;
    event AddressChanged(bytes32 indexed node, uint256 coinType, bytes value);
    event TextChanged(bytes32 indexed node, string indexed key, string value);
    event ContenthashChanged(bytes32 indexed node, bytes value);
    event MailKeyChanged(bytes32 indexed node, bytes32 hash, uint32 version); event GatewaySignerChanged(address indexed signer); event GatewayUrlChanged(string url, bool enabled);
    constructor(DailyRegistry registry_, address admin) { registry = registry_; _grantRole(DEFAULT_ADMIN_ROLE, admin); _grantRole(GATEWAY_MANAGER_ROLE, admin); }
    modifier ownerOf(bytes32 node) { require(registry.owner(node) == msg.sender, "not name owner"); _; }
    function setAddr(bytes32 node, uint256 coinType, bytes calldata value) external ownerOf(node) { addresses[node][coinType] = value; emit AddressChanged(node, coinType, value); }
    function addr(bytes32 node, uint256 coinType) external view returns (bytes memory) { return addresses[node][coinType]; }
    function setText(bytes32 node, string calldata key, string calldata value) external ownerOf(node) { texts[node][key] = value; emit TextChanged(node, key, value); }
    function text(bytes32 node, string calldata key) external view returns (string memory) { return texts[node][key]; }
    function setContenthash(bytes32 node, bytes calldata value) external ownerOf(node) { contents[node] = value; emit ContenthashChanged(node, value); }
    function contenthash(bytes32 node) external view returns (bytes memory) { return contents[node]; }
    function setMailKey(bytes32 node, bytes32 hash, uint32 version) external ownerOf(node) { mailKeyHash[node] = hash; mailKeyVersion[node] = version; emit MailKeyChanged(node, hash, version); }
    function setGatewaySigner(address signer) external onlyRole(GATEWAY_MANAGER_ROLE) { require(signer != address(0), "zero signer"); gatewaySigner = signer; emit GatewaySignerChanged(signer); }
    function addGatewayUrl(string calldata url) external onlyRole(GATEWAY_MANAGER_ROLE) { require(bytes(url).length > 0 && bytes(url).length <= 512, "bad url"); gatewayUrls.push(url); emit GatewayUrlChanged(url, true); }
    function removeGatewayUrl(uint256 index) external onlyRole(GATEWAY_MANAGER_ROLE) { require(index < gatewayUrls.length, "bad index"); string memory url = gatewayUrls[index]; gatewayUrls[index] = gatewayUrls[gatewayUrls.length - 1]; gatewayUrls.pop(); emit GatewayUrlChanged(url, false); }
    function gatewayUrlCount() external view returns (uint256) { return gatewayUrls.length; }
    function gatewayUrl(uint256 index) external view returns (string memory) { return gatewayUrls[index]; }
    /// @notice ERC-3668 entry point for records intentionally held off-chain. The
    /// gateway receives only calldata; its response must be signed by gatewaySigner.
    function resolve(bytes calldata name, bytes calldata data) external view returns (bytes memory) {
        require(gatewayUrls.length != 0 && gatewaySigner != address(0), "gateway unavailable");
        string[] memory urls = new string[](gatewayUrls.length); for (uint256 i; i < gatewayUrls.length; ++i) urls[i] = gatewayUrls[i];
        revert OffchainLookup(address(this), urls, abi.encode(name, data), this.resolveWithProof.selector, abi.encode(name, data));
    }
    /// @notice CCIP callback. `response` is abi.encode(result, signerSignature).
    function resolveWithProof(bytes calldata response, bytes calldata extraData) external view returns (bytes memory) {
        (bytes memory result, bytes memory signature) = abi.decode(response, (bytes, bytes));
        bytes32 digest = keccak256(abi.encodePacked(address(this), block.chainid, extraData, result));
        require(ECDSA.recover(MessageHashUtils.toEthSignedMessageHash(digest), signature) == gatewaySigner, "bad gateway signature");
        return result;
    }
    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControl, IERC165) returns (bool) { return interfaceId == type(IAddressResolver).interfaceId || interfaceId == type(ITextResolver).interfaceId || interfaceId == type(IContentHashResolver).interfaceId || interfaceId == type(IMailKeyResolver).interfaceId || super.supportsInterface(interfaceId); }
}
