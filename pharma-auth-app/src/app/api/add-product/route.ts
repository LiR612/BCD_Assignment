// app/api/add-product/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate wallet address
    if (!body.walletAddress) {
      return NextResponse.json(
        { status: "error", message: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Validate Ethereum address format
    const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(body.walletAddress);
    if (!isValidAddress) {
      return NextResponse.json(
        { status: "error", message: "Invalid Ethereum wallet address format" },
        { status: 400 }
      );
    }

    const res = await fetch("http://localhost:3001/add-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
