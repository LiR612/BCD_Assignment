"use client";

import { useState } from "react";
import Link from "next/link";
import WalletConnect from "../components/WalletConnect";

export default function AdminPage() {
  const [formData, setFormData] = useState({
    productId: "",
    name: "",
    batchNumber: "",
  });
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWalletAddressChange = (address: string | null) => {
    setWalletAddress(address);
    console.log("Wallet connected:", address);
  };

  const handleSubmit = async () => {
    try {
      if (!walletAddress) {
        alert("Please connect your wallet first");
        return;
      }

      const requestData = {
        ...formData,
        walletAddress,
      };

      const res = await fetch("/api/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
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
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-200 relative">
      {/* Home Button */}
      <div className="absolute top-4 right-4">
        <Link href="/">
          <button className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-600">
            Home
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
        <h2 className="text-2xl font-bold mb-6 text-center">
          Admin: Add Product
        </h2>

        {/* Wallet Connect Section */}
        <div className="mb-6 flex justify-center">
          <WalletConnect onAddressChange={handleWalletAddressChange} />
        </div>

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
            className={`px-4 py-2 rounded w-full ${
              walletAddress
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
            disabled={!walletAddress}
          >
            Submit
          </button>

          {!walletAddress && (
            <p className="text-sm text-orange-600 text-center mt-2">
              Please connect your wallet to submit
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
