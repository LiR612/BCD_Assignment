import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { adminAddress, walletAddress } = await req.json();

    console.log("Admin Address to Remove:", adminAddress);
    console.log("Caller Wallet Address:", walletAddress);

    if (!adminAddress || !walletAddress) {
      return NextResponse.json(
        { status: "error", message: "Admin address and wallet address are required" },
        { status: 400 }
      );
    }

    // Call the backend to remove the admin
    const response = await fetch("http://localhost:3001/remove-admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ adminAddress, walletAddress }),
    });

    const data = await response.json();

    if (data.status === "success") {
      return NextResponse.json({ status: "success", message: data.message });
    } else {
      return NextResponse.json(
        { status: "error", message: data.message },
        { status: 400 }
      );
    }
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error("Error in API Route:", errorMessage);
    return NextResponse.json(
      { status: "error", message: errorMessage },
      { status: 500 }
    );
  }
}