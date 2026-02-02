import { storage } from "./storage";

const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
const MICROSOFT_TENANT_ID = process.env.MICROSOFT_TENANT_ID || "common";

const SCOPES = [
  "openid", 
  "profile", 
  "email", 
  "offline_access", 
  "Mail.Read", 
  "User.Read",
  "Chat.Read",           // Read user's chats
  "ChatMessage.Read",    // Read chat messages
  "Team.ReadBasic.All",  // List user's teams
  "ChannelMessage.Read.All", // Read channel messages (requires admin consent)
];

function getRedirectUri(req: any): string {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host = req.headers.host || "localhost:5000";
  return `${protocol}://${host}/api/microsoft/callback`;
}

export function getAuthorizationUrl(req: any, state: string): string {
  const redirectUri = getRedirectUri(req);
  const params = new URLSearchParams({
    client_id: MICROSOFT_CLIENT_ID || "",
    response_type: "code",
    redirect_uri: redirectUri,
    scope: SCOPES.join(" "),
    response_mode: "query",
    state: state,
    prompt: "consent",
  });
  
  return `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize?${params.toString()}`;
}

export async function exchangeCodeForTokens(req: any, code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  scope: string;
}> {
  const redirectUri = getRedirectUri(req);
  
  const response = await fetch(
    `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: MICROSOFT_CLIENT_ID || "",
        client_secret: MICROSOFT_CLIENT_SECRET || "",
        code: code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        scope: SCOPES.join(" "),
      }),
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }
  
  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    scope: data.scope,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  scope: string;
}> {
  const response = await fetch(
    `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: MICROSOFT_CLIENT_ID || "",
        client_secret: MICROSOFT_CLIENT_SECRET || "",
        refresh_token: refreshToken,
        grant_type: "refresh_token",
        scope: SCOPES.join(" "),
      }),
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${error}`);
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
  const token = await storage.getMicrosoftToken(userId);
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
    
    await storage.updateMicrosoftToken(userId, {
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      expiresAt: newExpiresAt,
      scope: refreshed.scope,
    });
    
    return refreshed.accessToken;
  } catch (error) {
    console.error("Failed to refresh Microsoft token:", error);
    return null;
  }
}

export async function fetchOutlookEmails(accessToken: string, count: number = 20): Promise<any[]> {
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages?$top=${count}&$orderby=receivedDateTime desc&$select=id,subject,bodyPreview,from,receivedDateTime,isRead,importance`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch emails: ${error}`);
  }
  
  const data = await response.json();
  return data.value || [];
}

export function isConfigured(): boolean {
  return !!(MICROSOFT_CLIENT_ID && MICROSOFT_CLIENT_SECRET);
}

// Teams API functions

export async function fetchTeamsChats(accessToken: string): Promise<any[]> {
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/chats?$top=50&$orderby=lastMessagePreview/createdDateTime desc`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch chats: ${error}`);
  }
  
  const data = await response.json();
  return data.value || [];
}

export async function fetchChatMessages(accessToken: string, chatId: string, count: number = 20): Promise<any[]> {
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/chats/${chatId}/messages?$top=${count}&$orderby=createdDateTime desc`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch chat messages: ${error}`);
  }
  
  const data = await response.json();
  return data.value || [];
}

export async function fetchUserTeams(accessToken: string): Promise<any[]> {
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/joinedTeams`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch teams: ${error}`);
  }
  
  const data = await response.json();
  return data.value || [];
}

export async function fetchTeamChannels(accessToken: string, teamId: string): Promise<any[]> {
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/teams/${teamId}/channels`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch channels: ${error}`);
  }
  
  const data = await response.json();
  return data.value || [];
}

export async function fetchChannelMessages(accessToken: string, teamId: string, channelId: string, count: number = 20): Promise<any[]> {
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/messages?$top=${count}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch channel messages: ${error}`);
  }
  
  const data = await response.json();
  return data.value || [];
}

// Fetch messages where user is mentioned
export async function fetchTeamsMentions(accessToken: string): Promise<any[]> {
  const mentions: any[] = [];
  
  try {
    // Get recent chats and check for mentions
    const chats = await fetchTeamsChats(accessToken);
    
    for (const chat of chats.slice(0, 10)) {
      try {
        const messages = await fetchChatMessages(accessToken, chat.id, 10);
        for (const msg of messages) {
          if (msg.mentions && msg.mentions.length > 0) {
            mentions.push({
              ...msg,
              chatId: chat.id,
              chatTopic: chat.topic || "Direct Chat",
            });
          }
        }
      } catch (e) {
        // Skip chats we can't access
      }
    }
  } catch (e) {
    console.error("Error fetching Teams mentions:", e);
  }
  
  return mentions;
}
