"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

type Product = {
  product_id: string;
  product_type: string;
  batch_number: string;
  manufacturing_date: string;
  expiry_date: string;
  latest_stage: string;
};

export default function AllProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3001/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setProducts(data.products);
        } else {
          setError(data.message || "Failed to load products");
        }
      })
      .catch(() => setError("Error fetching products"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-6 text-gray-800">
      {/* Return to Admin */}
      <div className="flex justify-end mb-4">
        <Link href="/admin">
          <button className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-600">
            Back to Admin
          </button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-center mb-6">📦 All Products</h1>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : products.length === 0 ? (
        <p className="text-center">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[80vh] overflow-y-auto">
          {products.map((product) => (
            <div
              key={product.product_id}
              className="bg-white p-4 rounded shadow flex justify-between items-start"
            >
              {/* Product Info */}
              <div className="flex-1 pr-4">
                <h2 className="text-lg font-semibold text-blue-600 mb-1">
                  {product.product_id}
                </h2>
                <p>
                  <strong>Type:</strong> {product.product_type}
                </p>
                <p>
                  <strong>Batch:</strong> {product.batch_number}
                </p>
                <p>
                  <strong>Manufactured:</strong>{" "}
                  {new Date(product.manufacturing_date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Expires:</strong>{" "}
                  {new Date(product.expiry_date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Status:</strong> {product.latest_stage}
                </p>
              </div>

              {/* QR Code */}
              <div>
                <QRCodeSVG value={product.product_id} size={80} />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
