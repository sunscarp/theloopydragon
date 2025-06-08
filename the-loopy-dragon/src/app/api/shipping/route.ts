import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cgm = searchParams.get('cgm') || '500';
    const d_pin = searchParams.get('d_pin');
    const token = process.env.DELHIVERY_TOKEN;

    if (!d_pin || !token) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const apiUrl = 'https://track.delhivery.com/api/kinko/v1/invoice/charges/.json';
    const params = new URLSearchParams({
      md: 'E',  // Express delivery
      cgm: cgm, // Weight in grams
      o_pin: '411033', // Origin pincode
      d_pin: d_pin,
      ss: 'Delivered'
    });

    const response = await fetch(`${apiUrl}?${params.toString()}`, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      const charges = data[0];
      return NextResponse.json({
        total: charges.total_amount || charges.charge_total || 50,
        breakup: {
          base: charges.charge_weight || 0,
          fuel: charges.charge_FSC || 0,
          cod: charges.charge_COD || 0,
          other: charges.charge_other || 0
        }
      });
    }

    return NextResponse.json({ error: 'Failed to calculate shipping' }, { status: 500 });
  } catch (error) {
    console.error('Shipping calculation error:', error);
    return NextResponse.json({ error: 'Failed to calculate shipping' }, { status: 500 });
  }
}
