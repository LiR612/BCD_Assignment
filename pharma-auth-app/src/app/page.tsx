"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [productId, setProductId] = useState("");

  const handleCheck = () => {
    if (productId.trim() !== "") {
      router.push(`/product/${productId}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-200 relative">
      {/* Admin Button */}
      <div className="absolute top-4 right-4">
        <Link href="/admin">
          <button className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-600">
            Admin
          </button>
        </Link>
      </div>

      {/* Logo */}
      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
          PharmaSafe
        </h1>
      </div>

      {/* Input Box */}
      <div className="bg-white shadow-lg p-8 rounded-lg w-96 text-center text-gray-800">
        <h2 className="text-xl font-semibold mb-4">Check Product Authenticity</h2>
        <input
          type="text"
          placeholder="Enter or scan Product ID"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="border rounded p-2 mb-4 w-full"
        />
        <button
          onClick={handleCheck}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
        >
          Check
        </button>
      </div>
    </main>
  );
}
