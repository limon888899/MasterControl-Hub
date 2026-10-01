import { NextResponse } from 'next/server';

const demoApplications = [
  { id: 'GMH-24091', name: 'Amara Okafor', country: 'Canada', type: 'Work permit', stage: 'Verification', updated: '12 min ago' },
  { id: 'GMH-24088', name: 'Mateo Silva', country: 'Portugal', type: 'Skilled worker', stage: 'Biometric', updated: '48 min ago' },
  { id: 'GMH-24083', name: 'Priya Nair', country: 'Australia', type: 'Student visa', stage: 'Submission', updated: '2 hours ago' },
  { id: 'GMH-24079', name: 'Hassan Rahman', country: 'United Kingdom', type: 'Family visa', stage: 'Visa Grant', updated: '4 hours ago' },
];

export async function GET() {
  return NextResponse.json({ applications: demoApplications, mode: 'demo' });
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 }); }
  if (!body || typeof body !== 'object' || typeof (body as { name?: unknown }).name !== 'string' || !(body as { name: string }).name.trim()) {
    return NextResponse.json({ error: 'A client name is required.' }, { status: 422 });
  }
  return NextResponse.json({
    application: {
      id: `GMH-${Math.floor(24100 + Math.random() * 800)}`,
      name: (body as { name: string }).name.trim(),
      country: typeof (body as { country?: unknown }).country === 'string' ? (body as { country: string }).country : 'Canada',
      stage: 'Submission',
      createdAt: new Date().toISOString(),
    },
    mode: 'demo',
  }, { status: 201 });
}