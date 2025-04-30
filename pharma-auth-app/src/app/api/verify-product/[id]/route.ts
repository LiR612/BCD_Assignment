// app/api/verify-product/[id]/route.ts
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const res = await fetch(`http://localhost:3001/verify-product/${params.id}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message || "Failed to verify product" },
      { status: 500 }
    );
  }
}
