"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type ProductMetadata = {
  product_type: string;
  batch_number: string;
  manufacturing_date: string;
  expiry_date: string;
};

type VerificationResult = {
  productID: string;
  isAuthentic: boolean;
  metadata: ProductMetadata;
};

export default function ProductPage() {
  const { id } = useParams<{ id: string }>(); // use React Hook instead of params prop
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/verify-product/${id}`);
        const data = await res.json();

        if (data.status === "success") {
          setResult(data.result);
        } else {
          setError(data.message || "Unable to verify product.");
        }
      } catch (err: any) {
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-200 px-4 text-center">
      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
          PharmaSafe
        </h1>
      </div>

      <div className="bg-white shadow-lg p-8 rounded-lg w-full max-w-md text-gray-800">
        <h2 className="text-xl font-semibold mb-4">Product ID: {id}</h2>

        {loading ? (
          <p className="text-gray-600">🔄 Verifying product authenticity...</p>
        ) : error ? (
          <div className="bg-red-100 border border-red-500 text-red-700 p-4 rounded mb-4">
            ❌ {error}
          </div>
        ) : result?.isAuthentic ? (
          <div className="bg-green-100 border border-green-500 text-green-700 p-4 rounded mb-4">
            ✅ Verified Product
            <ul className="mt-2 text-left list-disc list-inside">
              <li><strong>Type:</strong> {result.metadata.product_type}</li>
              <li><strong>Batch:</strong> {result.metadata.batch_number}</li>
              <li><strong>Manufactured:</strong> {new Date(result.metadata.manufacturing_date).toLocaleDateString()}</li>
              <li><strong>Expires:</strong> {new Date(result.metadata.expiry_date).toLocaleDateString()}</li>
            </ul>
          </div>
        ) : (
          <div className="bg-red-100 border border-red-500 text-red-700 p-4 rounded mb-4">
            ❌ This product is <strong>not verified</strong>. It may be counterfeit or the product ID was entered incorrectly.
          </div>
        )}

        <Link href="/">
          <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600">
            Check Another Product
          </button>
        </Link>
      </div>
    </main>
  );
}
