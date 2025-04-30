const express = require("express");
const cors = require("cors");
require("dotenv").config();

const {
  addProduct,
  verifyProduct,
  addStage,
} = require("./cli"); // Reusing the CLI logic

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
    const { productId, name, batchNumber } = req.body;
    const result = await addProduct(productId, name, batchNumber);
    res.json({ status: "success", result });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Add stage (POST /add-stage)
app.post("/add-stage", async (req, res) => {
  try {
    const { productId, stageName } = req.body;
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PharmaSafe Express server running at http://localhost:${PORT}`);
});