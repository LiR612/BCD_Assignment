"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STAGE_OPTIONS = [
  "Manufacturing",
  "Regulatory Approval",
  "Packaging and Labeling",
  "Storage",
  "Distribution",
  "Complete",
];

export default function AddStagePage() {
  const [products, setProducts] = useState<
    { product_id: string; product_type: string; latest_stage: string }[]
  >([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [stage, setStage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/get-products")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setProducts(data.products);
        } else {
          setError(data.message || "Failed to load products");
        }
      })
      .catch(() => setError("Failed to fetch product list"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!selectedProduct || !stage) return alert("Please fill in all fields");

    const product = products.find((p) => p.product_id === selectedProduct);
    if (!product) return alert("Invalid product selected");

    // Validate stage order
    const validStages = [
      "Manufacturing",
      "Regulatory Approval",
      "Packaging and Labeling",
      "Storage",
      "Distribution",
      "Complete",
    ];
    const currentStageIndex = validStages.indexOf(product.latest_stage);
    const newStageIndex = validStages.indexOf(stage);

    if (newStageIndex === -1) {
      return alert(`Invalid stage: ${stage}`);
    }

    // Prevent skipping stages or going backward
    if (currentStageIndex == 5) {
      return alert(
        `❗The product has successfully completed the supply chain process. No more stages to add`
      );
    }
    if (newStageIndex !== currentStageIndex + 1) {
      return alert(
        `❗Invalid stage transition: You must move sequentially from "${product.latest_stage}" to "${validStages[currentStageIndex + 1]}".`
      );
    }

    // Get wallet address from localStorage for authentication
    const walletAddress = localStorage.getItem("walletAddress");

    const res = await fetch("/api/add-stage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: selectedProduct,
        stageName: stage,
        walletAddress, // Include wallet address for admin verification
      }),
    });

    const data = await res.json();
    if (data.status === "success") {
      alert("✅ Stage added");

      // Re-fetch the product list to update the current stage
      fetch("/api/get-products")
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            setProducts(data.products); // Update the products state
          } else {
            setError(data.message || "Failed to load products");
          }
        })
        .catch(() => setError("Failed to fetch product list"));
    } else {
      alert(`❌ ${data.message}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800 px-4">
      {/* Top-right Back button */}
      <div className="absolute top-4 right-4">
        <Link href="/admin">
          <button className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-600">
            Return
          </button>
        </Link>
      </div>

      {/* Logo */}
      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
          PharmaSafe
        </h1>
      </div>

      <div className="bg-white p-6 rounded shadow w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
          Add Stage to Product
        </h2>
        {/* Product Selector */}
        {loading ? (
          <p className="text-sm text-gray-600">Loading products...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full p-2 border rounded bg-white text-gray-800"
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.product_id} value={p.product_id}>
                {p.product_id} - {p.product_type} (Current Stage: {p.latest_stage})
              </option>
            ))}
          </select>
        )}

        {/* Stage Input */}
        <input
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          placeholder="Enter or select stage"
          className="w-full p-2 border rounded bg-white text-gray-800"
        />

        {/* Quick Options */}
        <div className="flex flex-wrap gap-2">
          {STAGE_OPTIONS.map((s, index) => (
            <button
              key={s}
              onClick={() => setStage(s)}
              className={`px-3 py-1 rounded text-sm font-medium ${
                loading || error
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
              disabled={loading || error !== null}
            >
              {`0${index + 1} - ${s}`} {/* Add stage number before the stage name */}
            </button>
          ))}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Submit Stage
        </button>
      </div>
    </main>
  );
}