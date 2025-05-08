"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WalletConnect from "../components/WalletConnect";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load login info from localStorage on component mount
  useEffect(() => {
    const savedAddress = localStorage.getItem("walletAddress");
    if (savedAddress) {
      setWalletAddress(savedAddress);
      checkAdminStatus(savedAddress);
    }
  }, []);

  const router = useRouter();

  const checkAdminStatus = async (address: string) => {
    setIsLoading(true);
    try {
      console.log(`Checking admin status for address: ${address}`);
      const response = await fetch(`/api/check-admin/${address}`);
      const data = await response.json();
      console.log("Admin check response:", data);

      if (data.status === "success") {
        setIsAdmin(data.isAdmin);
        // Store admin status in localStorage
        localStorage.setItem("isAdmin", data.isAdmin.toString());
        console.log(`Admin status set to: ${data.isAdmin}`);
      } else {
        setIsAdmin(false);
        localStorage.removeItem("isAdmin");
        console.log("Admin check failed, setting isAdmin to false");
      }
    } catch (error) {
      console.error("Failed to check admin status:", error);
      setIsAdmin(false);
      localStorage.removeItem("isAdmin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletAddressChange = (address: string | null) => {
    setWalletAddress(address);
    if (address) {
      localStorage.setItem("walletAddress", address);
      checkAdminStatus(address);
    } else {
      localStorage.removeItem("walletAddress");
      localStorage.removeItem("isAdmin");
      setIsAdmin(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-200 relative">
      {/* Top-right Home button */}
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

      {/* Wallet Connect */}
      <div className="mb-6">
        <WalletConnect onAddressChange={handleWalletAddressChange} />
      </div>

      {/* Admin Status */}
      {walletAddress && !isLoading && (
        <div className="mb-4">
          <p
            className={
              isAdmin
                ? "text-green-600 font-semibold"
                : "text-red-600 font-semibold"
            }
          >
            {isAdmin
              ? "✅ Admin access granted"
              : "❌ This wallet does not have admin privileges"}
          </p>
        </div>
      )}

      {isLoading && <p className="mb-4">Checking admin status...</p>}

      {/* Action Buttons */}
      <div className="space-y-4 w-64">
        <button
          onClick={() => router.push("/admin/add-product")}
          disabled={!walletAddress || !isAdmin || isLoading}
          className={`w-full py-3 rounded text-white font-semibold ${
            walletAddress && isAdmin && !isLoading
              ? "bg-green-500 hover:bg-green-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          ➕ Add Product
        </button>

        <button
          onClick={() => router.push("/admin/add-stage")}
          disabled={!walletAddress || !isAdmin || isLoading}
          className={`w-full py-3 rounded text-white font-semibold ${
            walletAddress && isAdmin && !isLoading
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          🏷️ Add Stage
        </button>

        <button
          onClick={() => router.push("/admin/all-products")}
          disabled={!walletAddress || !isAdmin || isLoading}
          className={`w-full py-3 rounded text-white font-semibold ${
            walletAddress && isAdmin && !isLoading
              ? "bg-purple-500 hover:bg-purple-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          📦 View All Products
        </button>
      </div>

      {!walletAddress && (
        <p className="mt-4 text-sm text-orange-600">
          Please connect your wallet to proceed
        </p>
      )}

      {walletAddress && !isAdmin && !isLoading && (
        <p className="mt-4 text-sm text-red-600">
          Your wallet does not have admin privileges
        </p>
      )}
    </main>
  );
}
