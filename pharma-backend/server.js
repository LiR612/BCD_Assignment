const express = require("express");
const cors = require("cors");
require("dotenv").config();

const {
  addProduct,
  verifyProduct,
  addStage,
  getAllProducts,
  isAdmin,
  isDeployer,
  getAdminAddresses,
} = require("./cli"); // Updated import to include new functions

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ROUTES

// Health check
app.get("/", (req, res) => {
  res.send("PharmaSafe Backend is running!");
});

// Add product (POST /add-product)
app.post("/add-product", async (req, res) => {
  try {
    const { productId, name, batchNumber, walletAddress } = req.body;

    // If wallet address is provided, verify admin status using smart contract
    if (walletAddress) {
      const adminStatus = await isAdmin(walletAddress);

      if (!adminStatus) {
        return res.status(403).json({
          status: "error",
          message: "Unauthorized: Your wallet does not have admin privileges",
        });
      }
    }

    const result = await addProduct(productId, name, batchNumber);
    res.json({ status: "success", result });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Add stage (POST /add-stage)
app.post("/add-stage", async (req, res) => {
  try {
    const { productId, stageName, walletAddress } = req.body;

    // If wallet address is provided, verify admin status
    if (walletAddress) {
      // Use the isAdmin function from cli.js
      const adminStatus = await isAdmin(walletAddress);

      if (!adminStatus) {
        return res.status(403).json({
          status: "error",
          message: "Unauthorized: Your wallet does not have admin privileges",
        });
      }
    }

    const result = await addStage(productId, stageName);
    res.json({ status: "success", result });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Verify product (GET /verify-product/:id)
app.get("/verify-product/:id", async (req, res) => {
  try {
    const result = await verifyProduct(req.params.id);

    // Check if the product is incomplete
    if (result.reason === "Incomplete product") {
      return res.status(400).json({
        status: "error",
        message: `Product ${req.params.id} exists but hasn't reached the end of the supply chain. Cannot verify authenticity yet.`,
      });
    }

    res.json({ status: "success", result });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Get list of products
app.get("/products", async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json({ status: "success", products });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Check if an address has admin privileges
app.get("/check-admin/:address", async (req, res) => {
  try {
    const { address } = req.params;
    console.log(`Checking admin status for address: ${address}`);

    // Check if the address has admin role using the smart contract
    const adminStatus = await isAdmin(address);

    // Only return the original structure the frontend expects
    res.json({
      status: "success",
      isAdmin: adminStatus,
    });
  } catch (err) {
    console.error(`Error checking admin status: ${err.message}`);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(
    `🚀 PharmaSafe Express server running at http://localhost:${PORT}`
  );
});
