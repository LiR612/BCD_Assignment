"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STAGE_OPTIONS = ["Manufacturing", "Packaging", "Complete"];

export default function AddStagePage() {
  const [products, setProducts] = useState<
    { product_id: string; product_type: string }[]
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
    alert(data.status === "success" ? "✅ Stage added" : `❌ ${data.message}`);
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
                {p.product_id} - {p.product_type}
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
          {STAGE_OPTIONS.map((s) => (
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
              {s}
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
