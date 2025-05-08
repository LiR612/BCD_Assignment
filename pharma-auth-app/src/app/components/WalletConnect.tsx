"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

interface WalletConnectProps {
  onAddressChange?: (address: string | null) => void;
}

export default function WalletConnect({ onAddressChange }: WalletConnectProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error(
          "MetaMask is not installed! Please install MetaMask to connect your wallet."
        );
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const address = accounts[0];

      setAddress(address);
      if (onAddressChange) {
        onAddressChange(address);
      }
    } catch (err: any) {
      console.error("Error connecting wallet:", err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    localStorage.removeItem("walletAddress"); // make sure to clear localStorage here
    if (onAddressChange) {
      onAddressChange(null);
    }
  };

  // Restore saved wallet address from localStorage
  useEffect(() => {
    const savedAddress = localStorage.getItem("walletAddress");
    if (savedAddress) {
      setAddress(savedAddress);
      onAddressChange?.(savedAddress);
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAddress(accounts[0]);
        onAddressChange?.(accounts[0]);
        localStorage.setItem("walletAddress", accounts[0]);
      }
    };
  
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }
  
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, [onAddressChange]);
  
  
  

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="wallet-connect">
      {!address ? (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isConnecting ? "Connecting..." : "Connect MetaMask"}
        </button>
      ) : (
        <div className="flex items-center space-x-2">
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {formatAddress(address)}
          </span>
          <button
            onClick={disconnectWallet}
            className="text-red-600 text-sm hover:text-red-800"
          >
            Disconnect
          </button>
        </div>
      )}

      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
    </div>
  );
}

// Add TypeScript types for ethereum window object
declare global {
  interface Window {
    ethereum: any;
  }
}
