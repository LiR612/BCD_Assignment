const { ethers } = require("ethers");
require("dotenv").config();
const db = require("./db");

// Load contract ABI
const MedicineAuthenticityABI =
  require("./artifacts/contracts/MedicineAuthenticity.sol/MedicineAuthenticity.json").abi;

// Constants and configuration
const PROVIDER_URL = process.env.PROVIDER_URL || "http://localhost:8545";
const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const CONTRACT_ADDRESS =
  process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Setup provider and wallet
const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  MedicineAuthenticityABI,
  wallet
);

/**
 * Add a product to the database
 * @param {string} productID - Unique product identifier
 * @param {string} productType - Product Type
 * @param {string} batchNumber - Product batch number
 */
async function addProduct(productID, productType, batchNumber) {
  try {
    if (!productID || !productType || !batchNumber) {
      throw new Error("Product ID, Type, and batch number are required");
    }

    const manufacturingDate = new Date();
    const expiryDate = new Date(manufacturingDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 2);

    const mfgDateStr = manufacturingDate.toISOString();
    const expiryDateStr = expiryDate.toISOString();

    // Add product to the database only
    await db.query(
      `INSERT INTO products (product_id, product_type, batch_number, manufacturing_date, expiry_date, latest_stage) 
      VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        productID,
        productType,
        batchNumber,
        mfgDateStr,
        expiryDateStr,
        "Created",
      ]
    );
    console.log(`✅ Added product ${productID} to the database`);

    return { productID };
  } catch (error) {
    console.error(`❌ Failed to add product: ${error.message}`);
    throw error;
  }
}

/**
 * Add a stage to a product's lifecycle
 * @param {string} productID - The product ID
 * @param {string} stageName - The name of the stage
 */
async function addStage(productID, stageName) {
  try {
    if (!productID || !stageName) {
      throw new Error("Product ID and stage name are required");
    }

    // Check if the product exists
    const productResult = await db.query(
      "SELECT * FROM products WHERE product_id = $1",
      [productID]
    );
    if (productResult.rows.length === 0) {
      throw new Error(`Product ${productID} not found in database`);
    }

    const product = productResult.rows[0];

    // Convert manufacturing_date and expiry_date to Date objects
    const manufacturingDate = new Date(product.manufacturing_date);
    const expiryDate = new Date(product.expiry_date);

    // Log the stage in the database
    const authenticator = wallet.address;
    await db.query(
      `INSERT INTO stages (product_id, stage_name, authenticator) 
       VALUES ($1, $2, $3)`,
      [productID, stageName, authenticator]
    );

    // Update the latest stage in the products table
    await db.query(
      `UPDATE products SET latest_stage = $1 WHERE product_id = $2`,
      [stageName, productID]
    );

    console.log(`✅ Added stage "${stageName}" to product ${productID}`);

    // If the stage is "Complete", finalize the product and add it to the blockchain
    if (stageName === "Complete") {
      console.log(`🔒 Finalizing product ${productID}...`);

      // Fetch all stages for the product
      const stagesResult = await db.query(
        "SELECT * FROM stages WHERE product_id = $1 ORDER BY timestamp ASC",
        [productID]
      );

      // Combine product and stage data for hashing
      const stages = stagesResult.rows;

      const abiCoder = ethers.AbiCoder.defaultAbiCoder();
      const combinedData = abiCoder.encode(
        ["string", "string", "string", "string", "string", "string"],
        [
          product.product_id,
          product.product_type,
          product.batch_number,
          manufacturingDate.toISOString(),
          expiryDate.toISOString(),
          JSON.stringify(stages),
        ]
      );
      const productHash = ethers.keccak256(combinedData);

      // Add the hash to the blockchain
      const tx = await contract.finalizeProduct(productID, productHash);
      await tx.wait();

      console.log(`✅ Product ${productID} finalized and added to blockchain`);
    }

    return { productID, stageName };
  } catch (error) {
    console.error(`❌ Failed to add stage: ${error.message}`);
    throw error;
  }
}

/**
 * Verify product authenticity by comparing blockchain and database hashes
 * @param {string} productID - The product ID to verify
 * @returns {Object} - Verification result with status and details
 */
async function verifyProduct(productID) {
  try {
    if (!productID) throw new Error("Product ID is required");

    const productResult = await db.query(
      "SELECT * FROM products WHERE product_id = $1",
      [productID]
    );
    if (productResult.rows.length === 0) {
      throw new Error(`Product ${productID} not found in database`);
    }

    const product = productResult.rows[0];
    const manufacturingDate = new Date(product.manufacturing_date);
    const expiryDate = new Date(product.expiry_date);

    if (product.latest_stage !== "Complete") {
      console.log(`⚠️ Product ${productID} is incomplete`);
      return { productID, isAuthentic: false, reason: "Incomplete product" };
    }

    // ✅ Use full stage data for hashing
    const stagesResult = await db.query(
      "SELECT * FROM stages WHERE product_id = $1 ORDER BY timestamp ASC",
      [productID]
    );
    const fullStages = stagesResult.rows;

    // ✅ Encode full data structure for hashing
    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    const combinedData = abiCoder.encode(
      ["string", "string", "string", "string", "string", "string"],
      [
        product.product_id,
        product.product_type,
        product.batch_number,
        manufacturingDate.toISOString(),
        expiryDate.toISOString(),
        JSON.stringify(fullStages),
      ]
    );
    const calculatedHash = ethers.keccak256(combinedData);
    const blockchainHash = await contract.getProductHash(productID);
    const isAuthentic = calculatedHash === blockchainHash;

    const responseStages = fullStages.map(({ stage_name, timestamp }) => ({
      stage_name,
      timestamp,
    }));

    return {
      productID,
      isAuthentic,
      calculatedHash,
      blockchainHash,
      metadata: {
        product_type: product.product_type,
        batch_number: product.batch_number,
        manufacturing_date: product.manufacturing_date,
        expiry_date: product.expiry_date,
      },
      ...(isAuthentic && { stages: responseStages }),
    };
  } catch (error) {
    console.error(`❌ Verification failed: ${error.message}`);
    throw error;
  }
}

/**
 * Get all products (for selection in UI)
 * @returns {Array} List of product_id and product_type
 */
async function getAllProducts() {
  try {
    const result = await db.query(
      "SELECT product_id, product_type, batch_number, manufacturing_date, expiry_date, latest_stage FROM products ORDER BY manufacturing_date DESC"
    );
    return result.rows;
  } catch (error) {
    console.error(`❌ Failed to fetch products: ${error.message}`);
    throw error;
  }
}

/**
 * Check if an address has admin role
 * @param {string} address - The address to check
 * @returns {Promise<boolean>} - True if the address has admin role
 */
async function isAdmin(address) {
  try {
    return await contract.isAdmin(address);
  } catch (error) {
    console.error(`❌ Failed to check admin status: ${error.message}`);
    throw error;
  }
}

/**
 * Check if an address is the deployer (Account 0)
 * @param {string} address - The address to check
 * @returns {Promise<boolean>} - True if the address is the deployer
 */
async function isDeployer(address) {
  try {
    return await contract.isDeployer(address);
  } catch (error) {
    console.error(`❌ Failed to check deployer status: ${error.message}`);
    throw error;
  }
}

/**
 * Get all admin addresses from the contract
 * @returns {Promise<string[]>} - Array of admin addresses
 */
async function getAdminAddresses() {
  try {
    return await contract.getAdminAddresses();
  } catch (error) {
    console.error(`❌ Failed to get admin addresses: ${error.message}`);
    throw error;
  }
}

/**
 * Main function to handle CLI commands
 */
async function main() {
  try {
    const [command, ...args] = process.argv.slice(2);

    switch (command) {
      case "addProduct":
        await addProduct(args[0], args[1], args[2]);
        break;

      case "verify":
        await verifyProduct(args[0]);
        break;

      case "addStage":
        await addStage(args[0], args[1]);
        break;

      default:
        console.log(`
📋 Available commands:
  addProduct <id> <type> <batch>     - Add a new product
  verify <id>                        - Verify product authenticity
  addStage <id> <stageName>          - Add a stage to product lifecycle
        `);
    }
  } catch (error) {
    console.error(`❌ Error in main: ${error.message}`);
    process.exit(1);
  }
}

// Execute main function
if (require.main === module) {
  main().catch(console.error);
}

// Export functions for testing or external use
module.exports = {
  addProduct,
  verifyProduct,
  addStage,
  getAllProducts,
  isAdmin,
  isDeployer,
  getAdminAddresses,
};
