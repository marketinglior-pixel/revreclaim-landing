import { createLogger } from "./logger";

const log = createLogger("STRIPE_OAUTH");

/**
 * Stripe Connect OAuth helper functions.
 *
 * Flow:
 * 1. User clicks "Connect with Stripe" → we redirect to Stripe's OAuth page
 * 2. User authorizes read-only access on Stripe's site
 * 3. Stripe redirects back with ?code=XXX
 * 4. We exchange the code for an access_token (acts like an API key)
 * 5. We use the token to run the scan
 *
 * The access_token from OAuth has the same capabilities as a restricted key
 * when scope=read_only is used.
 */

const STRIPE_OAUTH_AUTHORIZE_URL = "https://connect.stripe.com/oauth/authorize";
const STRIPE_OAUTH_TOKEN_URL = "https://connect.stripe.com/oauth/token";
const STRIPE_OAUTH_DEAUTHORIZE_URL = "https://connect.stripe.com/oauth/deauthorize";

export interface StripeOAuthConfig {
  clientId: string;
  redirectUri: string;
}

export interface StripeTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  stripe_publishable_key?: string;
  stripe_user_id: string;
  scope: string;
  livemode: boolean;
}

/**
 * Build the Stripe Connect OAuth authorization URL.
 * Uses scope=read_only so we never get write access.
 */
export function buildStripeOAuthUrl(state: string): string {
  const clientId = process.env.NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID;
  if (!clientId) {
    throw new Error("NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID is not set");
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://revreclaim.com";
  const redirectUri = `${baseUrl}/api/auth/stripe/callback`;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: "read_only",
    redirect_uri: redirectUri,
    state, // CSRF protection — verified on callback
  });

  return `${STRIPE_OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

/**
 * Exchange an authorization code for an access token.
 * Called from the callback route after Stripe redirects back.
 */
export async function exchangeCodeForToken(code: string): Promise<StripeTokenResponse> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }

  const response = await fetch(STRIPE_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_secret: secretKey,
    }).toString(),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    log.error("Token exchange failed:", data.error_description || data.error);
    throw new Error(data.error_description || data.error || "Token exchange failed");
  }

  log.info(`OAuth token obtained for account ${data.stripe_user_id} (scope: ${data.scope}, livemode: ${data.livemode})`);

  return data as StripeTokenResponse;
}

/**
 * Revoke an OAuth connection (deauthorize).
 * Called when user disconnects their Stripe account.
 */
export async function revokeStripeOAuth(stripeUserId: string): Promise<void> {
  const clientId = process.env.NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID;
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!clientId || !secretKey) {
    throw new Error("Stripe OAuth env vars not configured");
  }

  const response = await fetch(STRIPE_OAUTH_DEAUTHORIZE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      stripe_user_id: stripeUserId,
      client_secret: secretKey,
    }).toString(),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    log.error("Deauthorize failed:", data.error_description || data.error);
    throw new Error(data.error_description || data.error || "Deauthorize failed");
  }

  log.info(`Revoked OAuth for account ${stripeUserId}`);
}
