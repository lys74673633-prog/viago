import { NextResponse } from "next/server";
import { getQuotaStatus } from "@/lib/usage/quota";

export async function GET() {
  const status = await getQuotaStatus();
  return NextResponse.json(status);
}
