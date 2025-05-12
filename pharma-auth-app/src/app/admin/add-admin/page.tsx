"use client";

import { useState } from "react";
import Link from "next/link";

export default function AddAdminPage() {
  const [adminAddress, setAdminAddress] = useState("");
  const [message, setMessage] = useState("");

  const handleAddAdmin = async () => {
    const trimmedAddress = adminAddress.trim();

    if (!trimmedAddress) {
      setMessage("❌ Error: Admin address is required");
      return;
    }

    const walletAddress = localStorage.getItem("walletAddress");
    if (!walletAddress) {
      setMessage("❌ Error: Wallet address is required");
      return;
    }

    try {
      const response = await fetch("/api/add-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminAddress: trimmedAddress, walletAddress }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setMessage(`✅ Admin ${trimmedAddress} added successfully!`);
        setAdminAddress(""); // Clear input
      } else {
        setMessage(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      setMessage(`❌ Error: ${errorMessage}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
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

      {/* Card */}
      <div className="bg-white p-6 rounded shadow w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Add Admin</h2>
        <input
          type="text"
          placeholder="Enter admin address"
          value={adminAddress}
          onChange={(e) => setAdminAddress(e.target.value)}
          className="w-full p-2 border rounded bg-white text-gray-800"
        />
        <button
          onClick={handleAddAdmin}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
        >
          Add Admin
        </button>
        {message && <p className="mt-4 text-center text-gray-600">{message}</p>}
      </div>
    </main>
  );
}
