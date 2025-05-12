import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Call the backend to get the list of admins
    const response = await fetch("http://localhost:3001/admins");
    const data = await response.json();

    if (data.status === "success") {
      return NextResponse.json({ status: "success", admins: data.admins });
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