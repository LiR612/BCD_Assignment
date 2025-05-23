// app/api/verify-product/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  const awaitedParams = await params;
  const id = awaitedParams.id;

  try {
    const res = await fetch(`http://localhost:3001/verify-product/${id}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message || "Failed to verify product" },
      { status: 500 }
    );
  }
}
