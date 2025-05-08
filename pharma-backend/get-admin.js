const { ethers } = require("ethers");
require("dotenv").config();

// Same private key used in cli.js
const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// Get wallet from private key
const wallet = new ethers.Wallet(PRIVATE_KEY);
console.log("Admin Wallet Address (Account 0):", wallet.address);

// Load contract ABI
const MedicineAuthenticityABI =
  require("./artifacts/contracts/MedicineAuthenticity.sol/MedicineAuthenticity.json").abi;

// Constants and configuration
const PROVIDER_URL = process.env.PROVIDER_URL || "http://localhost:8545";
const CONTRACT_ADDRESS =
  process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Setup provider and connected wallet
const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  MedicineAuthenticityABI,
  signer
);

// Function to get admin info
async function getAdminInfo() {
  try {
    // Get all admin addresses
    const admins = await contract.getAdminAddresses();
    console.log("All Admin Addresses:", admins);

    // Check if our wallet is an admin
    const isAdmin = await contract.isAdmin(wallet.address);
    console.log(`Is ${wallet.address} an admin?`, isAdmin);

    // Check if our wallet is the deployer
    const isDeployer = await contract.isDeployer(wallet.address);
    console.log(`Is ${wallet.address} the deployer?`, isDeployer);

    console.log(
      "\nUse this address to test admin functionality:",
      wallet.address
    );
  } catch (error) {
    console.error("Error getting admin information:", error.message);
  }
}

// Run the function
getAdminInfo();
