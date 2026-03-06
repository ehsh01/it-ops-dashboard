import { storage } from "./storage";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/calendar.readonly",
];

function getRedirectUri(req: any): string {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host = req.headers.host || "localhost:5000";
  return `${protocol}://${host}/api/google/callback`;
}

export function isConfigured(): boolean {
  return !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
}

export function getAuthorizationUrl(req: any, state: string): string {
  const redirectUri = getRedirectUri(req);
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID || "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  req: any,
  code: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  scope: string;
}> {
  const redirectUri = getRedirectUri(req);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID || "",
      client_secret: GOOGLE_CLIENT_SECRET || "",
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google token exchange failed: ${error}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    scope: data.scope,
  };
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  scope: string;
}> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID || "",
      client_secret: GOOGLE_CLIENT_SECRET || "",
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google token refresh failed: ${error}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresIn: data.expires_in,
    scope: data.scope,
  };
}

export async function getValidAccessToken(userId: string): Promise<string | null> {
  const token = await storage.getGoogleToken(userId);
  if (!token) return null;

  const now = new Date();
  const expiresAt = new Date(token.expiresAt);
  const bufferTime = 5 * 60 * 1000;

  if (expiresAt.getTime() - now.getTime() > bufferTime) {
    return token.accessToken;
  }

  try {
    const refreshed = await refreshAccessToken(token.refreshToken);
    const newExpiresAt = new Date(Date.now() + refreshed.expiresIn * 1000);

    await storage.updateGoogleToken(userId, {
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      expiresAt: newExpiresAt,
      scope: refreshed.scope,
    });

    return refreshed.accessToken;
  } catch (error) {
    console.error("Failed to refresh Google token:", error);
    return null;
  }
}

// Gmail API

interface GmailMessage {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  isUnread: boolean;
  labels: string[];
}

function decodeHeader(headers: any[], name: string): string {
  const header = headers.find(
    (h: any) => h.name.toLowerCase() === name.toLowerCase()
  );
  return header?.value || "";
}

export async function fetchGmailEmails(
  accessToken: string,
  count: number = 20
): Promise<GmailMessage[]> {
  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${count}&q=in:inbox`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!listRes.ok) {
    const error = await listRes.text();
    throw new Error(`Failed to list Gmail messages: ${error}`);
  }

  const listData = await listRes.json();
  const messageIds: string[] = (listData.messages || []).map((m: any) => m.id);

  if (messageIds.length === 0) return [];

  const messages = await Promise.all(
    messageIds.map(async (id) => {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!msgRes.ok) return null;

      const msg = await msgRes.json();
      const headers = msg.payload?.headers || [];

      return {
        id: msg.id,
        subject: decodeHeader(headers, "Subject") || "(no subject)",
        from: decodeHeader(headers, "From"),
        date: decodeHeader(headers, "Date"),
        snippet: msg.snippet || "",
        isUnread: (msg.labelIds || []).includes("UNREAD"),
        labels: msg.labelIds || [],
      } as GmailMessage;
    })
  );

  return messages.filter((m): m is GmailMessage => m !== null);
}

// Google Calendar API

interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  location: string | null;
  hangoutLink: string | null;
  status: string;
  isAllDay: boolean;
}

export async function fetchCalendarEvents(
  accessToken: string,
  days: number = 1
): Promise<CalendarEvent[]> {
  const now = new Date();
  const timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const timeMax = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + days,
    23, 59, 59
  ).toISOString();

  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "50",
  });

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch calendar events: ${error}`);
  }

  const data = await response.json();

  return (data.items || []).map((event: any) => ({
    id: event.id,
    summary: event.summary || "(no title)",
    start: event.start?.dateTime || event.start?.date || "",
    end: event.end?.dateTime || event.end?.date || "",
    location: event.location || null,
    hangoutLink: event.hangoutLink || null,
    status: event.status || "confirmed",
    isAllDay: !event.start?.dateTime,
  }));
}
