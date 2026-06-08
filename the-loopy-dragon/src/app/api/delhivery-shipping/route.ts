import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cgm = searchParams.get('cgm');
    const d_pin = searchParams.get('d_pin');
    const token = process.env.DELHIVERY_TOKEN;

    if (!cgm || !d_pin || !token) {
      console.error('Missing parameters:', { cgm, d_pin, hasToken: !!token });
      throw new Error('Missing required parameters');
    }

    const baseUrl = 'https://track.delhivery.com';
    const endpoint = '/api/kinko/v1/invoice/charges/.json';
    const params = new URLSearchParams({
      md: 'E', // Express mode
      cgm: cgm,
      o_pin: '411033',
      d_pin: d_pin,
      ss: 'Delivered',
      pt: 'PREPAID', // Add prepaid flag
      cod: 'N',       // No Cash on Delivery
      dims: searchParams.get('dimensions') || '10x10x10' // Add dimensions
    });

    console.log('Fetching from:', `${baseUrl}${endpoint}?${params.toString()}`);

    const response = await fetch(`${baseUrl}${endpoint}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });

    const data = await response.json();
    console.log('Delhivery API Response:', data);

    // Handle array response
    if (Array.isArray(data) && data.length > 0) {
      const firstRate = data[0];
      const totalCharge = firstRate.total_amount || 
                         firstRate.charge_total || 
                         firstRate.charge_weight || 
                         50; // Fallback
      
      return NextResponse.json({ total_amount: totalCharge });
    }

    return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
  } catch (error) {
    console.error('Delhivery API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
