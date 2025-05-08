"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminProtection from "../../components/AdminProtection";

export default function AddProductPage() {
  const [formData, setFormData] = useState({
    productId: "",
    name: "",
    batchNumber: "",
  });
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Load wallet address from localStorage on component mount
  useEffect(() => {
    const savedAddress = localStorage.getItem("walletAddress");
    if (savedAddress) {
      setWalletAddress(savedAddress);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          walletAddress,
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        alert("Product added successfully!");
        setFormData({ productId: "", name: "", batchNumber: "" });
      } else {
        alert("Failed: " + data.message);
      }
    } catch (err) {
      console.error("API error:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <AdminProtection>
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-200 relative">
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

        {/* Form Card */}
        <div className="bg-white shadow-lg p-8 rounded-lg w-96 text-gray-800">
          <h2 className="text-2xl font-bold mb-6 text-center">Add Product</h2>
          <form className="space-y-4">
            <input
              name="productId"
              placeholder="Product ID"
              value={formData.productId}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
            <input
              name="name"
              placeholder="Product Name"
              value={formData.name}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
            <input
              name="batchNumber"
              placeholder="Batch Number"
              value={formData.batchNumber}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-green-500 text-white px-4 py-2 rounded w-full hover:bg-green-600"
            >
              Submit
            </button>
          </form>
        </div>
      </main>
    </AdminProtection>
  );
}
