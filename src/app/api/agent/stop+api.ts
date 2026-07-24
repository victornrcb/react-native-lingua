// ─────────────────────────────────────────────────────────────────────────────
// app/api/agent/stop+api.ts
// POST /api/agent/stop
//
// Stops a running Vision Agent session for the given call.
// Proxies a DELETE request to the Vision Agent HTTP server.
//
// Secrets (VISION_AGENT_URL) never reach the mobile app.
// ─────────────────────────────────────────────────────────────────────────────

const VISION_AGENT_URL = process.env.VISION_AGENT_URL || 'http://localhost:8080';

export async function POST(request: Request) {
  try {
    const { callId, sessionId } = await request.json();

    if (!callId || !sessionId) {
      return Response.json(
        { error: 'callId and sessionId are required' },
        { status: 400 }
      );
    }

    // The Vision Agent server accepts DELETE to close a session, or POST /close
    // for environments that can't send DELETE (e.g. sendBeacon).
    // We use DELETE here since this is a server-to-server call.
    const agentRes = await fetch(
      `${VISION_AGENT_URL}/calls/${encodeURIComponent(callId)}/sessions/${encodeURIComponent(sessionId)}`,
      { method: 'DELETE' }
    );

    // 202 Accepted is the expected success response from the Vision Agent server.
    if (!agentRes.ok && agentRes.status !== 202) {
      const body = await agentRes.text();
      console.error('[agent/stop] Vision Agent error:', agentRes.status, body);
      // Return ok:true anyway — the call is ending regardless.
      return Response.json({ ok: true, warning: 'Agent may already be stopped' });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('[agent/stop] Unexpected error:', error);
    // Don't block the client — the call is ending regardless.
    return Response.json({ ok: true, warning: 'Stop request failed silently' });
  }
}
