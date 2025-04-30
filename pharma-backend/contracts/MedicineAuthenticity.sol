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

    // Events
    event ProductFinalized(string indexed productID, string productHash);

    /**
     * @dev Constructor that grants admin role to the contract deployer
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
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
}
