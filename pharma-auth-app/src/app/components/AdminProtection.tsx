"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AdminProtectionProps {
  children: ReactNode;
}

export default function AdminProtection({ children }: AdminProtectionProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsLoading(true);

      // Get wallet address from localStorage
      const walletAddress = localStorage.getItem("walletAddress");

      if (!walletAddress) {
        // No wallet connected
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        // Check admin status from API
        const response = await fetch(`/api/check-admin/${walletAddress}`);
        const data = await response.json();

        if (data.status === "success") {
          setIsAdmin(data.isAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Failed to check admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p>Checking admin access...</p>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-200">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">
            Access Denied
          </h2>
          <p className="mb-6">
            You do not have admin privileges to access this page.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/admin">
              <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                Return to Admin Page
              </button>
            </Link>
            <Link href="/">
              <button className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">
                Go to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
