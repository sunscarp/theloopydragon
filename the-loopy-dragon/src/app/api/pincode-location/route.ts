import { NextRequest, NextResponse } from "next/server";

function estimateCoordinates(pincode: string): { latitude: number; longitude: number } {
  const zone = parseInt(pincode[0], 10);
  const prefix3 = parseInt(pincode.slice(0, 3), 10);
  const suffix3 = parseInt(pincode.slice(3, 6), 10);

  // Zone centers approximate major cities in each postal zone
  const zoneMap: Record<number, [number, number]> = {
    1: [28.6, 77.2],   // Delhi — North
    2: [27.0, 80.5],   // Lucknow — UP
    3: [23.5, 72.5],   // Ahmedabad — Rajasthan/Gujarat
    4: [19.0, 74.0],   // Pune — Maharashtra/Goa/MP
    5: [15.5, 78.5],   // Hyderabad — Telangana/AP/Karnataka
    6: [10.5, 77.0],   // Coimbatore — TN/Kerala
    7: [22.5, 88.3],   // Kolkata — WB/Odisha/NE
    8: [25.5, 85.5],   // Patna — Bihar/Jharkhand
  };

  const [baseLat, baseLon] = zoneMap[zone] || [20.5, 78.5];

  // Spread within zone using the last 2 digits of prefix3 (sorting district)
  // Gives ±3 degrees spread across districts in the same zone
  const spread = ((prefix3 % 100) / 100) - 0.5;

  // Micro-offset from last 3 digits to differentiate same-district pincodes
  const micro = (suffix3 % 1000) / 1000;

  const lat = baseLat + spread * 6 + micro * 0.1;
  const lon = baseLon + spread * 6 + micro * 0.1;

  return { latitude: lat, longitude: lon };
}

export async function GET(req: NextRequest) {
  const pincode = req.nextUrl.searchParams.get("pincode");

  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return NextResponse.json({ error: "Valid 6-digit pincode is required" }, { status: 400 });
  }

  const { latitude, longitude } = estimateCoordinates(pincode);

  return NextResponse.json({ pincode, latitude, longitude });
}
