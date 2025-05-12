// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title MedicineAuthenticity
 * @dev Contract for storing finalized product hashes on the blockchain
 */
contract MedicineAuthenticity is AccessControl {
    // Role identifier for admin capabilities
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Product {
        string productID;
        string productHash;
    }

    // Mapping to store finalized product hashes
    mapping(string => Product) private finalizedProducts;

    // Track all admin addresses for easy access
    address[] private adminAddresses;

    // Events
    event ProductFinalized(string indexed productID, string productHash);
    event AdminAdded(address indexed adminAddress);
    event AdminRemoved(address indexed adminAddress);
    event DebugAddress(address sender, string action);

    /**
     * @dev Constructor that grants admin role to the contract deployer
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
        adminAddresses.push(msg.sender);
    }

    /**
     * @dev Finalize a product by storing its hash on the blockchain
     * @param _productID The unique ID of the product
     * @param _productHash The hash of the product details and stages
     */
    function finalizeProduct(
        string memory _productID,
        string memory _productHash
    ) public onlyRole(ADMIN_ROLE) {
        require(bytes(_productID).length > 0, "Product ID cannot be empty");
        require(bytes(_productHash).length > 0, "Product hash cannot be empty");
        require(
            bytes(finalizedProducts[_productID].productID).length == 0,
            "Product already finalized"
        );

        finalizedProducts[_productID] = Product({
            productID: _productID,
            productHash: _productHash
        });

        emit ProductFinalized(_productID, _productHash);
    }

    /**
     * @dev Get the hash of a finalized product
     * @param _productID The ID of the product to query
     * @return The hash of the product
     */
    function getProductHash(
        string memory _productID
    ) public view returns (string memory) {
        require(
            bytes(finalizedProducts[_productID].productID).length > 0,
            "Product not finalized"
        );
        return finalizedProducts[_productID].productHash;
    }

    /**
     * @dev Add a new admin to the system
     * @param _adminAddress Address to be granted admin role
     */
    function addAdmin(
        address _adminAddress
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_adminAddress != address(0), "Invalid address");
        require(!hasRole(ADMIN_ROLE, _adminAddress), "Already an admin");

        _grantRole(ADMIN_ROLE, _adminAddress);
        adminAddresses.push(_adminAddress);

        emit AdminAdded(_adminAddress);
    }

    /**
     * @dev Remove an admin from the system
     * @param _adminAddress Address to be revoked admin role
     */
    function removeAdmin(
        address _adminAddress
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        emit DebugAddress(msg.sender, "removeAdmin called");
        require(_adminAddress != address(0), "Invalid address");
        require(
            _adminAddress != getDeployerAddress(),
            "Cannot remove the deployer"
        );
        require(_adminAddress != msg.sender, "Cannot remove yourself");
        require(hasRole(ADMIN_ROLE, _adminAddress), "Not an admin");

        _revokeRole(ADMIN_ROLE, _adminAddress);

        // Remove from adminAddresses array
        for (uint i = 0; i < adminAddresses.length; i++) {
            if (adminAddresses[i] == _adminAddress) {
                adminAddresses[i] = adminAddresses[adminAddresses.length - 1];
                adminAddresses.pop();
                break;
            }
        }

        emit AdminRemoved(_adminAddress);
    }

    /**
     * @dev Get all addresses with admin role
     * @return Array of admin addresses
     */
    function getAdminAddresses() public view returns (address[] memory) {
        return adminAddresses;
    }

    /**
     * @dev Get the deployer address (Account 0)
     * @return The address of the contract deployer
     */
    function getDeployerAddress() public view returns (address) {
        return adminAddresses[0]; // First admin is always the deployer
    }

    /**
     * @dev Check if an address has admin role
     * @param _address Address to check
     * @return Boolean indicating whether the address has admin role
     */
    function isAdmin(address _address) public view returns (bool) {
        return hasRole(ADMIN_ROLE, _address);
    }

    /**
     * @dev Check if an address is the original deployer (Account 0)
     * @param _address Address to check
     * @return Boolean indicating whether the address is the deployer
     */
    function isDeployer(address _address) public view returns (bool) {
        return _address == getDeployerAddress();
    }

    /**
     * @dev Returns the address of the caller
     * @return The address of the caller
     */
    function whoSender() public view returns (address) {
        return msg.sender;
    }
}
