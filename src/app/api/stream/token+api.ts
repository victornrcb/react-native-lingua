import { StreamClient } from '@stream-io/node-sdk';

// Initialize Stream Client server-side
const client = new StreamClient(
  process.env.STREAM_API_KEY || '',
  process.env.STREAM_API_SECRET || ''
);

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 });
    }

    if (!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
      console.error('Missing Stream API Key or Secret');
      return Response.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Generate token for the user
    const token = client.generateUserToken({ user_id: userId });

    return Response.json({ token });
  } catch (error) {
    console.error('Error generating stream token:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
