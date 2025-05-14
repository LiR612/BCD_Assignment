"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AiOutlineQrcode } from "react-icons/ai";

const QRScanner = dynamic(() => import("./components/QRScanner"), {
  ssr: false,
});

export default function Home() {
  const router = useRouter();
  const [productId, setProductId] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const handleCheck = () => {
      if (productId.trim() !== "") {
        const formattedProductId = productId.toUpperCase();
        router.push(`/product/${formattedProductId}`);
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
      <div className="bg-white shadow-lg p-8 rounded-lg w-96 text-center text-gray-800 relative">
        <h2 className="text-xl font-semibold mb-4">
          Check Product Authenticity
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter or scan Product ID"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="border rounded p-2 w-full"
          />
          <button
            onClick={() => setShowScanner((prev) => !prev)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold px-4 rounded"
            title="Scan QR"
          >
            <AiOutlineQrcode size={24} />
          </button>
        </div>
        <button
          onClick={handleCheck}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
        >
          Check
        </button>

        {/* QR Scanner Component */}
        {showScanner && (
          <QRScanner
            onScanSuccess={(data: string) => {
              setProductId(data);
              setShowScanner(false);
            }}
            onClose={() => setShowScanner(false)}
          />
        )}
      </div>
    </main>
  );
}
