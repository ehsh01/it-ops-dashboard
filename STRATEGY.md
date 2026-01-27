# Authentication & Integration Strategy: UM IT Ops Console

## 1. Authentication Strategy: Microsoft Entra ID (OIDC + OAuth 2.0)
**Selected Approach:** **Single Sign-On (SSO) via Microsoft Entra ID (formerly Azure AD)** using the **Authorization Code Flow with PKCE**.

### Why this fits:
*   **Security & Compliance:** It offloads all authentication to Microsoft. We never touch passwords. It inherently enforces the University's existing MFA policies (Authenticator app, hardware keys, etc.).
*   **HIPAA/Enterprise Alignment:** This is the standard for accessing protected organizational data (Outlook, Teams). It supports Conditional Access Policies (e.g., "Must be on compliant device").
*   **User Experience:** "Silent" SSO. If the user is logged into their corporate laptop, they are likely logged into this app automatically (or with a single click).

## 2. Integration Tiers (The "Hybrid" Approach)
We will design the application to handle three distinct permission states to ensure the app is useful even without full admin blessing.

*   **Tier 1: Gold Standard (Admin-Consented Enterprise App)**
    *   **Method:** Graph API application permissions (or high-privilege delegated).
    *   **Capabilities:** Background sync of all tickets, full mailbox access, proactive Teams alerts.
    *   **Pros:** Most reliable, no user maintenance.
*   **Tier 2: Silver Standard (User-Delegated Access)**
    *   **Method:** User explicitly grants `Mail.Read`, `Calendars.Read` scopes via OAuth consent screen.
    *   **Capabilities:** App works while user is active. Token refresh handles session continuity (up to 90 days usually).
    *   **Pros:** Doesn't require IT Admin approval (if user consent is enabled in tenant).
*   **Tier 3: Bronze Fallback (Email Ingestion)**
    *   **Method:** User creates an Outlook Rule to forward specific alert emails to an ingestion address (e.g., `inbox@ops-console.internal`).
    *   **Capabilities:** Read-only viewing of "tickets" derived from emails. No Teams integration.
    *   **Pros:** Works in highly restrictive environments where API access is blocked.

## 3. High-Level Architecture
```mermaid
graph TD
    User[IT Admin User] -->|HTTPS| Frontend[React SPA Dashboard]
    Frontend -->|MFA Auth| MS[Microsoft Entra ID]
    
    subgraph "Integration Layer"
        Frontend -->|API Calls| BFF[Secure Backend Proxy]
        BFF -->|Graph API (Tier 1/2)| O365[Office 365 / Teams]
        BFF -->|IMAP/SMTP (Tier 3)| Email[Exchange Online]
        BFF -->|REST (Optional)| Ticketing[ITSM System]
    end
```

## 4. Assumptions for Deployment
1.  **Azure Tenant Access:** Ability to register an App Registration in the University Azure AD (even if just for development initially).
2.  **Network Visibility:** The hosting environment must be able to reach `graph.microsoft.com`.
3.  **Data Policy:** University policy allows "read" access to mail/calendar by internal tools.
