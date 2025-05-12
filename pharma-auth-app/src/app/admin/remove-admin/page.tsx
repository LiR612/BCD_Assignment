"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function RemoveAdminPage() {
  const [admins, setAdmins] = useState<string[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch the list of admins
    fetch("/api/get-admins")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setAdmins(data.admins);
        } else {
          setMessage(`❌ Error: ${data.message}`);
        }
      })
      .catch(() => setMessage("❌ Error: Failed to fetch admin list"));
  }, []);

  const handleRemoveAdmin = async () => {
    if (!selectedAdmin) {
      setMessage("❌ Error: Please select an admin to remove");
      return;
    }

    try {
      const walletAddress = localStorage.getItem("walletAddress"); // Caller wallet address
      const response = await fetch("/api/remove-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminAddress: selectedAdmin, walletAddress }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setMessage(`✅ Admin ${selectedAdmin} removed successfully!`);
        setAdmins((prev) => prev.filter((admin) => admin !== selectedAdmin)); // Update dropdown
        setSelectedAdmin(""); // Reset selection
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
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
          Remove Admin
        </h2>

        {/* Dropdown for Admins */}
        <select
          value={selectedAdmin}
          onChange={(e) => setSelectedAdmin(e.target.value)}
          className="w-full p-2 border rounded bg-white text-gray-800"
        >
          <option value="">Select Admin</option>
          {admins.map((admin) => (
            <option key={admin} value={admin}>
              {admin}
            </option>
          ))}
        </select>

        {/* Remove Admin Button */}
        <button
          onClick={handleRemoveAdmin}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full"
        >
          Remove Admin
        </button>

        {message && <p className="mt-4 text-center text-gray-600">{message}</p>}
      </div>
    </main>
  );
}