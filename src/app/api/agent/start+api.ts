// ─────────────────────────────────────────────────────────────────────────────
// app/api/agent/start+api.ts
// POST /api/agent/start
//
// Starts a Vision Agent session for the given call.
// 1. Grants the agent user (lingua-teacher) admin role on the call via the
//    Stream Node SDK so it can publish audio in the audio_room call type.
// 2. Proxies a start-session request to the Vision Agent HTTP server.
//
// Secrets (STREAM_API_SECRET, VISION_AGENT_URL) never reach the mobile app.
// ─────────────────────────────────────────────────────────────────────────────

import { StreamClient } from '@stream-io/node-sdk';

// Stream server-side client — instantiated once at module scope.
const streamClient = new StreamClient(
  process.env.STREAM_API_KEY || '',
  process.env.STREAM_API_SECRET || ''
);

const AGENT_USER_ID = 'lingua-teacher';
const VISION_AGENT_URL = process.env.VISION_AGENT_URL || 'http://localhost:8080';

export async function POST(request: Request) {
  try {
    const { callType, callId } = await request.json();

    if (!callType || !callId) {
      return Response.json(
        { error: 'callType and callId are required' },
        { status: 400 }
      );
    }

    if (!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
      console.error('[agent/start] Missing Stream credentials');
      return Response.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // ── 1. Ensure the agent user exists and grant it admin role on the call ──
    //       This allows the agent to publish audio in the audio_room call type.
    try {
      await streamClient.upsertUsers([
        {
          id: AGENT_USER_ID,
          name: 'Lingua',
          role: 'admin',
        },
      ]);

      const call = streamClient.video.call(callType, callId);
      await call.updateCallMembers({
        update_members: [{ user_id: AGENT_USER_ID, role: 'admin' }],
      });
    } catch (err) {
      // Non-fatal: log and continue — the agent may still be able to join.
      console.warn('[agent/start] Could not grant admin role:', err);
    }

    // ── 2. Spawn a Vision Agent session ──────────────────────────────────────
    const agentRes = await fetch(
      `${VISION_AGENT_URL}/calls/${encodeURIComponent(callId)}/sessions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ call_type: callType }),
      }
    );

    if (!agentRes.ok) {
      const body = await agentRes.text();
      console.error('[agent/start] Vision Agent error:', agentRes.status, body);
      return Response.json(
        { error: 'Failed to start agent session', detail: body },
        { status: 502 }
      );
    }

    const session = await agentRes.json() as {
      session_id: string;
      call_id: string;
      session_started_at: string;
    };

    return Response.json({ ok: true, sessionId: session.session_id });
  } catch (error) {
    console.error('[agent/start] Unexpected error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
