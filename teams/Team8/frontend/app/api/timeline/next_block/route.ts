import { NextRequest, NextResponse } from "next/server";
 
export async function POST(req: NextRequest) {
  const { cancerType, requestedInfoType } = await req.json();
 
  const res = await fetch("http://localhost:8080", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cancerType, requestedInfoType }),
  });
 
  const data = await res.json();
  return NextResponse.json(data);
}
 