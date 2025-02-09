import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = await fetch(`${process.env.API_BASE_URL}/api/start-session`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to start browser session');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to start browser session' },
      { status: 500 }
    );
  }
}