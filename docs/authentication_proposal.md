> **TÀI LIỆU LƯU TRỮ** — Nội dung phản ánh trạng thái dự án tại thời điểm 07/05/2026, không còn là hiện trạng. Xem tài liệu hiện hành: [`docs/architecture-backend.md`](architecture-backend.md) và [`AGENTS.md`](../AGENTS.md).

# Authentication Proposal

## Google Sign-In

Customer Google sign-in uses server-side OAuth through the Web API so access and refresh tokens remain in httpOnly cookies.

Flow:
1. The customer clicks `Sign in with Google` on `ecommerce-client`.
2. The browser posts to `/api/auth/external-login?provider=Google&returnUrl=/...`.
3. The API validates the local return URL, stores it in OAuth state, and challenges Google.
4. Google redirects to `/api/auth/google-oauth-callback`, where ASP.NET Core validates OAuth state/correlation and stores the external identity.
5. The middleware redirects to `/api/auth/google-response`; the API reads the external identity, sends `ExternalLoginCommand`, creates or links the customer account, issues JWT and refresh tokens, sets auth and CSRF cookies, then redirects to `{AppUrl:Frontend}/auth/google-callback`.
6. The client callback page verifies the cookie-backed session and redirects to the original local path.

Security notes:
- Only the `Google` provider is accepted.
- `returnUrl` must be a local path and cannot start with `//` or contain backslashes.
- OAuth correlation/state is handled by ASP.NET Core external authentication cookies.
- The guest cart id is sent as form data and carried in protected OAuth properties so the Application handler can reuse the existing guest cart merge service.

Configuration:
```json
{
  "Authentication": {
    "Google": {
      "ClientId": "<google-client-id>",
      "ClientSecret": "<google-client-secret>",
      "CallbackUrl": "http://localhost:3000/api/auth/google-oauth-callback"
    }
  },
  "AppUrl": {
    "Frontend": "http://localhost:3000"
  }
}
```

For local development, prefer user-secrets:
```bash
dotnet user-secrets set "Authentication:Google:ClientId" "<client-id>" --project apps/backend/Ecommerce/Ecommerce.WebAPI
dotnet user-secrets set "Authentication:Google:ClientSecret" "<client-secret>" --project apps/backend/Ecommerce/Ecommerce.WebAPI
```

Google OAuth redirect URI:
```text
http://localhost:3000/api/auth/google-oauth-callback
```

Use the frontend origin when requests go through the Next.js `/api` rewrite. Use the backend origin instead if calling the API directly.
