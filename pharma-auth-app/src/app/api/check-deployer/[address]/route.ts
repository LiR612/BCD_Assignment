import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: { address: string } }
) {
  const { params } = context;
  const awaitedParams = await params;
  const address = awaitedParams.address;

  try {
    const res = await fetch(`http://localhost:3001/check-deployer/${address}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "error",
        message: err.message || "Failed to check deployer status",
      },
      { status: 500 }
    );
  }
}
