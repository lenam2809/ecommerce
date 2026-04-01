# 📊 BÁO CÁO PHÂN TÍCH HỆ THỐNG XÁC THỰC VÀ BẢO MẬT

**Dự án:** E-commerce Platform  
**Stack:** .NET 8 + Next.js 15 + PostgreSQL  
**Ngày phân tích:** 2024  

---

## 1. ĐÁNH GIÁ HIỆN TRẠNG

### 🔹 Backend (.NET 8)

| Thành phần | Hiện trạng | Chi tiết |
|------------|------------|----------|
| **Cơ chế xác thực** | ✅ JWT + httpOnly Cookies | Token lưu trong cookie `access_token` và `refresh_token` với flags: `HttpOnly=true`, `Secure=true` (production), `SameSite=None` |
| **Authorization** | ✅ Policy-based | ASP.NET Core Identity với policy "AdminOnly" và các policy theo permission (EPermissions) |
| **Xử lý mật khẩu** | ✅ ASP.NET Core Identity | Yêu cầu: ≥12 ký tự, có chữ hoa, thường, số, ký tự đặc biệt, 6 ký tự duy nhất |
| **Refresh Token** | ✅ Lưu trữ DB + Rotation | Expiry 7 ngày, revoked khi sử dụng lại |
| **Access Token** | ✅ JWT | Expiry 60 phút (configurable trong `AuthConfig`) |
| **CSRF Protection** | ✅ Custom Middleware | Double Submit Cookie pattern |
| **Rate Limiting** | ✅ Global + Auth endpoints | 100 req/phút (global), 10 req/phút (auth endpoints) |
| **Account Lockout** | ✅ Custom implementation | Khóa sau 5 lần đăng nhập sai, thời gian khóa 30 phút |
| **CORS** | ✅ Cấu hình đúng | `AllowCredentials`, validation production vs development |
| **Security Headers** | ✅ Full set | X-Frame-Options, X-Content-Type-Options, CSP, Referrer-Policy, HSTS |
| **Logging** | ✅ UserActivity + AuditLog | Track IP, UserAgent, Location, Action |
| **Đăng xuất** | ✅ Revoke token + Clear cookies | Refresh token bị revoke, cookies được xóa |

**File quan trọng:**
- `apps/backend/Ecommerce/Ecommerce.WebAPI/Program.cs` - Cấu hình auth, CORS, rate limiting
- `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/AuthController.cs` - Login, Register, RefreshToken
- `apps/backend/Ecommerce/Ecommerce.Application/Common/Configs/AuthConfig.cs` - JWT settings
- `apps/backend/Ecommerce/Ecommerce.Infrastructure/Identity/AddIdentityExtensions.cs` - Identity config
- `apps/backend/Ecommerce/Ecommerce.Domain/Entities/RefreshToken.cs` - Refresh token entity

---

### 🔹 Frontend Client (Next.js 15)

| Thành phần | Hiện trạng | Chi tiết |
|------------|------------|----------|
| **Lưu trữ token** | ✅ httpOnly cookies | Không thể access qua JavaScript, chống XSS stealing |
| **User data** | ⚠️ localStorage | Lưu email, roles, permissions (không lưu token) |
| **Middleware** | ✅ Bảo vệ routes | `/dashboard`, `/profile`, `/settings` yêu cầu auth |
| **Đăng nhập/đăng xuất** | ✅ API integration | Gọi backend, cookies tự động set/clear |
| **Session sync** | ✅ BroadcastChannel | Đồng bộ state giữa các tab |
| **Token refresh** | ✅ Automatic | Tự động gọi `/auth/refresh` khi access token hết hạn |

**File quan trọng:**
- `apps/frontend/ecommerce-client/middleware.ts` - Route protection
- `apps/frontend/ecommerce-client/src/lib/auth-service.ts` - Auth logic
- `apps/frontend/ecommerce-client/src/hooks/use-auth.ts` - Auth state management

---

### 🔹 Frontend Dashboard (Next.js 15)

| Thành phần | Hiện trạng | Chi tiết |
|------------|------------|----------|
| **Phân quyền admin** | ✅ Client-side check | Validate role "Admin" trong `auth-service.ts` |
| **Bảo vệ route** | ✅ Middleware | Tương tự client, redirect về `/dashboard` |
| **Security form** | ✅ Zod validation | Đổi mật khẩu với validation chặt chẽ |
| **UI Admin** | ✅ Role-based UI | Ẩn/hiện tính năng theo permission |

**File quan trọng:**
- `apps/frontend/ecommerce-dashboard/middleware.ts` - Admin route protection
- `apps/frontend/ecommerce-dashboard/src/lib/auth-service.ts` - Admin auth logic
- `apps/frontend/ecommerce-dashboard/app/(auth)/login/page.tsx` - Login page

---

### 🔹 Database (PostgreSQL)

| Thành phần | Hiện trạng | Chi tiết |
|------------|------------|----------|
| **Mật khẩu** | ✅ Hashed | ASP.NET Core Identity sử dụng PBKDF2 |
| **Refresh tokens** | ⚠️ Plaintext | Lưu trong bảng `RefreshTokens` không encrypt |
| **Kết nối** | ⚠️ Connection string | Từ configuration (cần đảm bảo SSL) |
| **Data encryption** | ❌ Chưa implement | Không có encryption at-rest cho dữ liệu nhạy cảm |
| **Audit tables** | ✅ Có | `UserActivities`, `AuditLogs` |

**File quan trọng:**
- `apps/backend/Ecommerce/Ecommerce.Domain/Entities/ApplicationUser.cs`
- `apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/Configurations/`

---

## 2. 🔴 PHÁT HIỆN LỖ HỔNG / ĐIỂM YẾU

### **Mức độ CAO** 🔴

#### 2.1. Không có 2FA cho tài khoản Admin

- **Vị trí:** `AddIdentityExtensions.cs`, `ApplicationUser.cs`
- **Mô tả:** ASP.NET Core Identity hỗ trợ property `TwoFactorEnabled` nhưng không được kích hoạt hoặc ép buộc cho admin.
- **Nguy cơ:** 
  - Nếu admin bị lộ mật khẩu → attacker có toàn quyền hệ thống
  - Không có lớp bảo vệ thứ 2 cho tài khoản quan trọng
  - Vi phạm nguyên tắc Defense in Depth
- **CVE liên quan:** CWE-308 (Use of Single-factor Authentication)
- **Impact:** Toàn bộ hệ thống có thể bị xâm nhập
- **Likelihood:** Trung bình (phụ thuộc vào việc admin có bị phishing không)

---

#### 2.2. Refresh Token không được binding với thiết bị/IP

- **Vị trí:** `RefreshToken.cs`, `LoginUserCommandHandler.cs`
- **Mô tả:** Refresh token không lưu thông tin fingerprint (UserAgent, IP address). Nếu bị đánh cắp, có thể dùng từ bất kỳ đâu.
- **Nguy cơ:**
  - Token theft attack: Nếu cookie bị đánh cắp (qua malware, MITM), attacker có thể dùng từ máy khác
  - Session hijacking: Không phát hiện được khi token được dùng từ location lạ
  - Không có mechanism để revoke token của thiết bị cụ thể
- **CVE liên quan:** CWE-384 (Session Fixation)
- **Impact:** Cao (mất kiểm soát session)
- **Likelihood:** Cao (dễ thực hiện nếu có XSS hoặc malware)

---

#### 2.3. JWT Secret Key có thể yếu

- **Vị trí:** `appsettings.example.json` line 17
- **Mô tả:** Giá trị mẫu `"CHANGE_ME_MINIMUM_32_CHARACTERS"` - developer có thể đặt key yếu, ngắn, hoặc dễ đoán.
- **Nguy cơ:**
  - Brute-force attack nếu secret < 32 bytes
  - Nếu secret bị leak, attacker có thể forge token
  - Không có rotation mechanism cho JWT secret
- **CVE liên quan:** CWE-326 (Inadequate Encryption Strength)
- **Impact:** Rất cao (toàn bộ auth system bị compromise)
- **Likelihood:** Thấp (nhưng impact cực lớn)

---

### **Mức độ TRUNG BÌNH** 🟠

#### 2.4. CSP quá rộng (unsafe-inline, unsafe-eval)

- **Vị trí:** `SecurityHeadersMiddleware.cs` line 28-29
- **Mô tả:** `script-src 'self' 'unsafe-inline' 'unsafe-eval'` cho phép inline script và eval().
- **Nguy cơ:**
  - Giảm hiệu quả chống XSS nếu có lỗ hổng injection
  - Attacker có thể inject malicious script nếu tìm được cách
  - Không tuân thủ best practice CSP level 3
- **CVE liên quan:** CWE-79 (Cross-site Scripting)
- **Impact:** Trung bình (chỉ nguy hiểm nếu có XSS vulnerability khác)
- **Likelihood:** Trung bình

---

#### 2.5. Password reset token không có expiry rõ ràng

- **Vị trí:** `PasswordResetToken.cs` (tồn tại trong migration)
- **Mô tả:** Forgot password flow có thể không validate thời gian hết hạn token đúng cách.
- **Nguy cơ:**
  - Token reuse attack: Dùng lại token cũ
  - Token không bị revoke sau khi sử dụng
  - Không có giới hạn số lần thử
- **CVE liên quan:** CWE-640 (Weak Password Recovery Mechanism)
- **Impact:** Cao (account takeover)
- **Likelihood:** Trung bình

---

#### 2.6. Không có logging cảnh báo đăng nhập bất thường

- **Vị trí:** `LoginUserCommandHandler.cs`
- **Mô tả:** Có log activity nhưng không có alert khi detect login từ IP/location lạ.
- **Nguy cơ:**
  - Không phát hiện kịp thời credential stuffing attacks
  - Admin không biết tài khoản bị xâm nhập
  - Không có data để phân tích security incident
- **CVE liên quan:** CWE-778 (Insufficient Logging)
- **Impact:** Trung bình (khó phát hiện attack)
- **Likelihood:** Cao (attack sẽ không bị phát hiện)

---

### **Mức độ THẤP** 🟡

#### 2.7. User data lưu localStorage có thể bị XSS khai thác

- **Vị trí:** `auth-service.ts` line 56, `AuthService.storeUser()`
- **Mô tả:** Thông tin user (email, roles, permissions) lưu localStorage.
- **Nguy cơ:**
  - Nếu có XSS, attacker có thể đọc thông tin này
  - Social engineering: Biết role của user để tấn công targeted
  - Privacy concern: Data không được encrypt
- **CVE liên quan:** CWE-79 (XSS)
- **Impact:** Thấp (chỉ là information disclosure)
- **Likelihood:** Thấp (cần có XSS trước)

---

#### 2.8. Không có Account Takeover Protection

- **Vị trí:** Toàn bộ flow auth
- **Mô tả:** Không gửi email notification khi đăng nhập thành công/thất bại.
- **Nguy cơ:**
  - User không biết tài khoản bị xâm nhập
  - Không có opportunity để user report suspicious activity
  - Vi phạm best practice (OWASP, NIST)
- **CVE liên quan:** CWE-273 (Improper Check for Attempted Access)
- **Impact:** Trung bình
- **Likelihood:** Cao (user sẽ không biết bị attack)

---

## 3. 💡 ĐỀ XUẤT CẢI TIẾN CỤ THỂ

### **3.1. Triển khai 2FA cho Admin** ⭐ Ưu tiên P0

**Mức độ:** Cao  
**Thời gian ước tính:** 2-3 ngày  
**Độ phức tạp:** Trung bình

#### File cần sửa:
- `apps/backend/Ecommerce/Ecommerce.Application/Common/Configs/AuthConfig.cs`
- `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/AuthController.cs`
- `apps/backend/Ecommerce/Ecommerce.Application/Features/Auth/Commands/Enable2FA/`
- `apps/frontend/ecommerce-dashboard/app/(auth)/login/page.tsx`
- `apps/frontend/ecommerce-dashboard/src/lib/auth-service.ts`

#### Implementation:

```csharp
// File: AuthConfig.cs
public class AuthConfig 
{
    // ... existing properties ...
    
    /// <summary>
    /// Require 2FA for Admin role
    /// </summary>
    public bool Require2FAForAdmin { get; set; } = true;
    
    /// <summary>
    /// 2FA issuer name (displayed in authenticator app)
    /// </summary>
    public string TwoFactorIssuer { get; set; } = "ECommerce Platform";
}
```

```csharp
// File: ApplicationUser.cs
public class ApplicationUser : IdentityUser<Guid>
{
    // ... existing properties ...
    
    /// <summary>
    /// 2FA secret key (encrypted at rest)
    /// </summary>
    public string? TwoFactorSecretKey { get; set; }
    
    /// <summary>
    /// Is 2FA enabled for this user
    /// </summary>
    public bool TwoFactorEnabled { get; set; }
    
    /// <summary>
    /// Backup codes for 2FA recovery (encrypted)
    /// </summary>
    public string? TwoFactorRecoveryCodes { get; set; }
}
```

```csharp
// File: AuthController.cs
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    
    /// <summary>
    /// Enable 2FA for current user (Admin only)
    /// </summary>
    [HttpPost("enable-2fa")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Enable2FA()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return NotFound();
        
        // Generate 2FA secret key
        var secretKey = KeyGeneration.GenerateRandomKey(20);
        var base32Secret = Base32Encoding.ToString(secretKey);
        
        // Save to user profile (encrypt before saving!)
        user.TwoFactorSecretKey = EncryptSecret(base32Secret);
        await _userManager.UpdateAsync(user);
        
        // Generate QR code URI
        var issuer = _config["Auth:TwoFactorIssuer"];
        var uri = $"otpauth://totp/{issuer}:{user.Email}?secret={base32Secret}&issuer={issuer}";
        
        // Generate backup codes
        var recoveryCodes = Enumerable.Range(0, 10)
            .Select(_ => Guid.NewGuid().ToString("N")[..8].ToUpper())
            .ToList();
        
        return Ok(new 
        { 
            secret = base32Secret, 
            qrCodeUri = uri,
            recoveryCodes = recoveryCodes
        });
    }
    
    /// <summary>
    /// Verify 2FA code during login
    /// </summary>
    [HttpPost("verify-2fa")]
    [AllowAnonymous]
    public async Task<IActionResult> Verify2FA([FromBody] Verify2FACommand command)
    {
        var user = await _userManager.FindByEmailAsync(command.Email);
        if (user == null || !user.TwoFactorEnabled)
        {
            return BadRequest("2FA không được kích hoạt");
        }
        
        var secretKey = DecryptSecret(user.TwoFactorSecretKey);
        var totp = new Totp(Base32Encoding.ToBytes(secretKey));
        
        if (totp.VerifyTotp(command.Code, out _, new VerificationWindow(2, 0)))
        {
            // Set temporary 2FA verification cookie
            Response.Cookies.Append("2fa_verified", user.Id.ToString(), new CookieOptions 
            { 
                HttpOnly = true, 
                Secure = true, 
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddMinutes(5) 
            });
            
            return Ok(new { success = true });
        }
        
        // Log failed 2FA attempt
        await _auditService.LogFailed2FA(user.Id, command.IpAddress);
        
        return BadRequest("Mã 2FA không hợp lệ");
    }
}
```

```typescript
// File: ecommerce-dashboard/src/lib/auth-service.ts
export const AuthService = {
  // ... existing methods ...
  
  async loginWith2FA(email: string, password: string, code: string) {
    // Step 1: Login with credentials
    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (loginResponse.status === 428) {
      // 2FA required
      return { requires2FA: true };
    }
    
    // Step 2: Verify 2FA code
    const verifyResponse = await fetch('/api/auth/verify-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    
    if (!verifyResponse.ok) {
      throw new Error('Mã 2FA không hợp lệ');
    }
    
    return { success: true };
  },
  
  async enable2FA() {
    const response = await fetch('/api/auth/enable-2fa', {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Không thể kích hoạt 2FA');
    }
    
    return await response.json();
  }
};
```

```tsx
// File: ecommerce-dashboard/app/(auth)/login/page.tsx
'use client';

export default function LoginPage() {
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await AuthService.login(email, password);
    
    if (result.requires2FA) {
      setStep('2fa');
      return;
    }
    
    // Continue with normal login flow
  };
  
  const handle2FAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await AuthService.loginWith2FA(email, password, twoFACode);
    // Redirect to dashboard
  };
  
  return (
    <div className="login-container">
      {step === 'credentials' ? (
        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            placeholder="Mật khẩu"
          />
          <button type="submit">Đăng nhập</button>
        </form>
      ) : (
        <form onSubmit={handle2FAVerify}>
          <p>Nhập mã từ Google Authenticator</p>
          <input 
            type="text" 
            value={twoFACode} 
            onChange={e => setTwoFACode(e.target.value)}
            placeholder="Mã 6 số"
            maxLength={6}
          />
          <button type="submit">Xác minh</button>
        </form>
      )}
    </div>
  );
}
```

---

### **3.2. Binding Refresh Token với Device Fingerprint** ⭐ Ưu tiên P0

**Mức độ:** Cao  
**Thời gian ước tính:** 1-2 ngày  
**Độ phức tạp:** Thấp

#### File cần sửa:
- `apps/backend/Ecommerce/Ecommerce.Domain/Entities/RefreshToken.cs`
- `apps/backend/Ecommerce/Ecommerce.Application/Features/Auth/Commands/Login/LoginUserCommandHandler.cs`
- `apps/backend/Ecommerce/Ecommerce.Application/Features/Auth/Commands/RefreshToken/RefreshTokenCommandHandler.cs`

#### Implementation:

```csharp
// File: RefreshToken.cs
public class RefreshToken : BaseEntity
{
    public required string Token { get; set; }
    public DateTime ExpiryDate { get; set; }
    public bool IsRevoked { get; set; }
    public Guid ApplicationUserId { get; set; }
    
    // NEW: Device binding fields
    public string? DeviceFingerprint { get; set; }  // SHA256 hash của IP + UserAgent
    public string? CreatedIpAddress { get; set; }
    public string? CreatedUserAgent { get; set; }
    public string? LastUsedIpAddress { get; set; }
    public DateTime? LastUsedDate { get; set; }
    
    public virtual ApplicationUser ApplicationUser { get; set; } = null!;
}
```

```csharp
// File: LoginUserCommandHandler.cs
public class LoginUserCommandHandler : IRequestHandler<LoginUserCommand, Result<AuthResponseDto>>
{
    public async Task<Result<AuthResponseDto>> Handle(LoginUserCommand request, CancellationToken ct)
    {
        // ... existing login logic ...
        
        var refreshToken = _tokenService.GenerateRefreshToken();
        
        // Generate device fingerprint
        var deviceFingerprint = GenerateDeviceFingerprint(request.IpAddress, request.UserAgent);
        
        user.RefreshTokens.Add(new Domain.Entities.RefreshToken
        {
            Token = refreshToken,
            ExpiryDate = DateTime.UtcNow.AddDays(7),
            IsRevoked = false,
            DeviceFingerprint = deviceFingerprint,
            CreatedIpAddress = request.IpAddress,
            CreatedUserAgent = request.UserAgent,
            LastUsedIpAddress = request.IpAddress,
            LastUsedDate = DateTime.UtcNow
        });
        
        await _unitOfWork.CompleteAsync();
        
        // Set cookies with device info
        SetAuthCookies(response.AccessToken, refreshToken);
        
        return Result<AuthResponseDto>.Success(response);
    }
    
    private string GenerateDeviceFingerprint(string ipAddress, string userAgent)
    {
        using var sha256 = SHA256.Create();
        var combined = $"{ipAddress}|{userAgent}|{Environment.MachineName}";
        var hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(combined));
        return Convert.ToBase64String(hash);
    }
}
```

```csharp
// File: RefreshTokenCommandHandler.cs
public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<AuthResponseDto>>
{
    public async Task<Result<AuthResponseDto>> Handle(RefreshTokenCommand request, CancellationToken ct)
    {
        var storedToken = await _dbContext.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken, ct);
        
        if (storedToken == null || storedToken.IsRevoked || storedToken.ExpiryDate < DateTime.UtcNow)
        {
            return Result<AuthResponseDto>.BadRequest("Refresh token không hợp lệ");
        }
        
        // VALIDATE DEVICE FINGERPRINT
        if (!string.IsNullOrEmpty(storedToken.DeviceFingerprint))
        {
            var currentFingerprint = GenerateDeviceFingerprint(
                request.IpAddress, 
                request.UserAgent
            );
            
            if (storedToken.DeviceFingerprint != currentFingerprint)
            {
                // POTENTIAL TOKEN THEFT!
                storedToken.IsRevoked = true;
                await _unitOfWork.CompleteAsync();
                
                // Log security incident
                await _auditService.LogSecurityIncident(
                    storedToken.ApplicationUserId,
                    SecurityIncidentType.SuspiciousTokenUsage,
                    new { 
                        OriginalIP = storedToken.CreatedIpAddress,
                        CurrentIP = request.IpAddress,
                        OriginalFingerprint = storedToken.DeviceFingerprint,
                        CurrentFingerprint = currentFingerprint
                    }
                );
                
                // Optionally: Send alert email to user
                await _emailService.SendSecurityAlert(
                    storedToken.ApplicationUser.Email,
                    "Phát hiện truy cập đáng ngờ",
                    "Chúng tôi phát hiện refresh token của bạn được sử dụng từ thiết bị/location lạ."
                );
                
                return Result<AuthResponseDto>.BadRequest(
                    "Refresh token không khớp thiết bị. Vui lòng đăng nhập lại."
                );
            }
        }
        
        // Update last used info
        storedToken.LastUsedIpAddress = request.IpAddress;
        storedToken.LastUsedDate = DateTime.UtcNow;
        
        // Rotate token (optional but recommended)
        storedToken.IsRevoked = true;
        var newRefreshToken = _tokenService.GenerateRefreshToken();
        
        user.RefreshTokens.Add(new Domain.Entities.RefreshToken
        {
            Token = newRefreshToken,
            ExpiryDate = DateTime.UtcNow.AddDays(7),
            IsRevoked = false,
            DeviceFingerprint = storedToken.DeviceFingerprint,
            CreatedIpAddress = storedToken.CreatedIpAddress,
            CreatedUserAgent = storedToken.CreatedUserAgent
        });
        
        await _unitOfWork.CompleteAsync();
        
        // Generate new access token
        var accessToken = _tokenService.GenerateAccessToken(user);
        
        SetAuthCookies(accessToken, newRefreshToken);
        
        return Result<AuthResponseDto>.Success(new AuthResponseDto 
        { 
            AccessToken = accessToken 
        });
    }
}
```

```typescript
// File: frontend lib - send device info with requests
export const apiClient = {
  async post(url: string, data: any) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Fingerprint': await getDeviceFingerprint()
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    
    return response;
  }
};

async function getDeviceFingerprint(): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx?.fillText('fingerprint', 0, 0);
  const canvasData = canvas.toDataURL();
  
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvasHash: await hashCanvas(canvasData)
  };
  
  return btoa(JSON.stringify(fingerprint));
}
```

---

### **3.3. Cải thiện CSP Headers** ⭐ Ưu tiên P1

**Mức độ:** Trung bình  
**Thời gian ước tính:** 0.5 ngày  
**Độ phức tạp:** Thấp

#### File cần sửa:
- `apps/backend/Ecommerce/Ecommerce.WebAPI/Middleware/SecurityHeadersMiddleware.cs`
- `apps/frontend/ecommerce-client/next.config.js`
- `apps/frontend/ecommerce-dashboard/next.config.js`

#### Implementation:

```csharp
// File: SecurityHeadersMiddleware.cs
public class SecurityHeadersMiddleware
{
    public async Task InvokeAsync(HttpContext context)
    {
        var headers = context.Response.Headers;
        
        // Generate nonce for this request
        var nonce = Convert.ToBase64String(RandomNumberGenerator.GetBytes(16));
        context.Items["CspNonce"] = nonce;
        
        // Content-Security-Policy - Tightened
        headers["Content-Security-Policy"] = 
            "default-src 'self'; " +
            $"script-src 'self' 'nonce-{nonce}'; " +  // Removed unsafe-inline and unsafe-eval
            "style-src 'self' https://fonts.googleapis.com; " +
            "img-src 'self' blob: data: https://images.unsplash.com https://*.supabase.co; " +
            "font-src 'self' https://fonts.gstatic.com; " +
            "connect-src 'self' https://api.yourdomain.com; " +
            "frame-ancestors 'none'; " +
            "base-uri 'self'; " +
            "form-action 'self'; " +
            "upgrade-insecure-requests;";
        
        // Other security headers
        headers["X-Frame-Options"] = "DENY";
        headers["X-Content-Type-Options"] = "nosniff";
        headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
        headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
        
        await _next(context);
    }
}
```

```javascript
// File: next.config.js (both frontend apps)
/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Temporarily keep for Next.js
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' blob: data: https://images.unsplash.com https://*.supabase.co",
            "font-src 'self' https://fonts.gstatic.com",
            "connect-src 'self' https://api.yourdomain.com",
            "frame-ancestors 'none'",
          ].join('; ')
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        }
      ]
    }
  ]
};

module.exports = nextConfig;
```

---

### **3.4. Email Notification cho Security Events** ⭐ Ưu tiên P1

**Mức độ:** Trung bình  
**Thời gian ước tính:** 1 ngày  
**Độ phức tạp:** Thấp

#### File cần tạo/sửa:
- `apps/backend/Ecommerce/Ecommerce.Application/Features/Auth/Events/UserLoggedInEvent.cs`
- `apps/backend/Ecommerce/Ecommerce.Application/Features/Auth/EventHandlers/UserLoggedInEventHandler.cs`
- `apps/backend/Ecommerce/Ecommerce.Application/Services/IEmailService.cs`

#### Implementation:

```csharp
// File: UserLoggedInEvent.cs
public class UserLoggedInEvent : INotification
{
    public Guid UserId { get; set; }
    public string UserEmail { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    public string? Location { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public bool IsFirstTimeFromThisDevice { get; set; }
}
```

```csharp
// File: UserLoggedInEventHandler.cs
public class UserLoggedInEventHandler : INotificationHandler<UserLoggedInEvent>
{
    private readonly IEmailService _emailService;
    private readonly ILogger<UserLoggedInEventHandler> _logger;
    private readonly IUserActivityService _activityService;
    
    public async Task Handle(UserLoggedInEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            // Log activity
            await _activityService.LogActivity(new UserActivityDto
            {
                UserId = notification.UserId,
                Action = "LOGIN",
                IpAddress = notification.IpAddress,
                UserAgent = notification.UserAgent,
                Location = notification.Location,
                Timestamp = notification.Timestamp
            });
            
            // Send login notification email
            await _emailService.SendAsync(
                to: notification.UserEmail,
                subject: "✅ Đăng nhập thành công",
                body: $@"
                    <h2>Đăng nhập thành công</h2>
                    <p>Tài khoản của bạn vừa đăng nhập thành công.</p>
                    
                    <table style='border-collapse: collapse; width: 100%;'>
                        <tr>
                            <td style='padding: 8px; border: 1px solid #ddd;'><strong>Thời gian:</strong></td>
                            <td style='padding: 8px; border: 1px solid #ddd;'>{notification.Timestamp:dd/MM/yyyy HH:mm:ss}</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px; border: 1px solid #ddd;'><strong>IP Address:</strong></td>
                            <td style='padding: 8px; border: 1px solid #ddd;'>{notification.IpAddress}</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px; border: 1px solid #ddd;'><strong>Thiết bị:</strong></td>
                            <td style='padding: 8px; border: 1px solid #ddd;'>{ExtractDeviceName(notification.UserAgent)}</td>
                        </tr>
                        {(notification.Location != null ? $@"
                        <tr>
                            <td style='padding: 8px; border: 1px solid #ddd;'><strong>Vị trí:</strong></td>
                            <td style='padding: 8px; border: 1px solid #ddd;'>{notification.Location}</td>
                        </tr>" : "")}
                    </table>
                    
                    <p style='margin-top: 20px;'>
                        Nếu không phải bạn đăng nhập, vui lòng:
                        <ol>
                            <li>Đổi mật khẩu ngay lập tức</li>
                            <li>Liên hệ support: support@example.com</li>
                        </ol>
                    </p>
                    
                    <hr/>
                    <p style='color: #666; font-size: 12px;'>
                        Đây là email tự động, vui lòng không reply.
                    </p>
                ",
                isHtml: true
            );
            
            // Check for suspicious activity
            if (await IsSuspiciousLogin(notification))
            {
                await HandleSuspiciousLogin(notification);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending login notification email");
            // Don't fail the login process if email fails
        }
    }
    
    private async Task<bool> IsSuspiciousLogin(UserLoggedInEvent evt)
    {
        // Get user's recent login history
        var recentLogins = await _activityService.GetRecentLogins(evt.UserId, days: 30);
        
        // Check 1: New country
        var countries = recentLogins.Select(l => l.Country).Distinct().ToList();
        if (!string.IsNullOrEmpty(evt.Location) && !countries.Contains(ExtractCountry(evt.Location)))
        {
            return true;
        }
        
        // Check 2: Unusual time (e.g., 2 AM - 5 AM local time)
        var localHour = TimeZoneInfo.ConvertTimeFromUtc(
            evt.Timestamp, 
            TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time")
        ).Hour;
        
        if (localHour >= 2 && localHour <= 5)
        {
            return true;
        }
        
        // Check 3: Multiple failed attempts before success
        var failedAttempts = await _activityService.GetFailedLoginAttempts(evt.UserId, hours: 1);
        if (failedAttempts >= 3)
        {
            return true;
        }
        
        return false;
    }
    
    private async Task HandleSuspiciousLogin(UserLoggedInEvent evt)
    {
        _logger.LogWarning(
            "Suspicious login detected for user {UserId} from {IP}",
            evt.UserId, 
            evt.IpAddress
        );
        
        // Send urgent alert
        await _emailService.SendAsync(
            evt.UserEmail,
            "⚠️ CẢNH BÁO: Đăng nhập đáng ngờ",
            $@"
                <h2 style='color: red;'>⚠️ Cảnh báo bảo mật</h2>
                <p>Chúng tôi phát hiện hoạt động đăng nhập đáng ngờ:</p>
                <ul>
                    <li>IP: {evt.IpAddress}</li>
                    <li>Thời gian: {evt.Timestamp:dd/MM/yyyy HH:mm:ss}</li>
                    <li>Lý do: {GetSuspicionReason(evt)}</li>
                </ul>
                <p><strong>Hành động khuyến nghị:</strong></p>
                <ol>
                    <li>Đổi mật khẩu ngay</li>
                    <li>Kiểm tra các phiên đăng nhập đang hoạt động</li>
                    <li>Bật 2FA nếu chưa bật</li>
                </ol>
                <a href='/security/check' style='background: red; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>
                    Kiểm tra ngay
                </a>
            ",
            isHtml: true
        );
        
        // Optionally: Force logout all other sessions
        // await _tokenService.RevokeAllUserTokensExceptCurrent(evt.UserId);
    }
    
    private string ExtractDeviceName(string userAgent)
    {
        // Simple UA parsing
        if (userAgent.Contains("Mobile")) return "Mobile Device";
        if (userAgent.Contains("Tablet")) return "Tablet";
        if (userAgent.Contains("Windows")) return "Windows PC";
        if (userAgent.Contains("Mac")) return "Mac";
        return "Unknown Device";
    }
    
    private string ExtractCountry(string location)
    {
        // Parse location string to extract country
        var parts = location.Split(',');
        return parts.Length > 0 ? parts[parts.Length - 1].Trim() : "";
    }
    
    private string GetSuspicionReason(UserLoggedInEvent evt)
    {
        // Implement logic to determine suspicion reason
        return "Đăng nhập từ vị trí mới";
    }
}
```

---

### **3.5. Rate Limiting theo User** ⭐ Ưu tiên P1

**Mức độ:** Trung bình  
**Thời gian ước tính:** 0.5 ngày  
**Độ phức tạp:** Thấp

#### File cần sửa:
- `apps/backend/Ecommerce/Ecommerce.WebAPI/Program.cs`

#### Implementation:

```csharp
// File: Program.cs
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 4,
                AutoReplenishment = true
            }));
    
    // Auth endpoints - stricter limit
    options.AddPolicy("AuthEndpoints", context =>
        RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 2
            }));
    
    // NEW: User-based rate limiting for authenticated users
    options.AddPolicy("UserBasedPolicy", context =>
    {
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var ip = context.Connection.RemoteIpAddress?.ToString();
        
        // Use user ID if available, fallback to IP
        var key = !string.IsNullOrEmpty(userId) ? $"user:{userId}" : $"ip:{ip}";
        
        return RateLimitPartition.GetSlidingWindowLimiter(
            key,
            _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 200,  // Higher limit for authenticated users
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 4
            });
    });
    
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// Apply policies
app.UseRateLimiter();

// In controllers or minimal APIs
app.MapPost("/api/orders", CreateOrder)
    .RequireRateLimiting("UserBasedPolicy")
    .RequireAuthorization();
```

---

### **3.6. Secure Password Reset Flow** ⭐ Ưu tiên P2

**Mức độ:** Thấp  
**Thời gian ước tính:** 1 ngày  
**Độ phức tạp:** Trung bình

#### File cần sửa:
- `apps/backend/Ecommerce/Ecommerce.Domain/Entities/PasswordResetToken.cs`
- `apps/backend/Ecommerce/Ecommerce.Application/Features/Auth/Commands/ForgotPassword/ForgotPasswordCommandHandler.cs`
- `apps/backend/Ecommerce/Ecommerce.Application/Features/Auth/Commands/ResetPassword/ResetPasswordCommandHandler.cs`

#### Implementation:

```csharp
// File: PasswordResetToken.cs
public class PasswordResetToken : BaseEntity
{
    public Guid UserId { get; set; }
    public required string HashedToken { get; set; }  // Store hashed token, not plaintext
    public DateTime ExpiresAt { get; set; }
    public bool Used { get; set; }
    public DateTime? UsedAt { get; set; }
    public string? RequestedIpAddress { get; set; }
    
    public virtual ApplicationUser User { get; set; } = null!;
}
```

```csharp
// File: ForgotPasswordCommandHandler.cs
public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, Result>
{
    public async Task<Result> Handle(ForgotPasswordCommand request, CancellationToken ct)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        
        // Don't reveal if email exists (prevent enumeration)
        if (user == null)
        {
            _logger.LogInformation("Password reset requested for non-existent email: {Email}", request.Email);
            return Result.Success("Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.");
        }
        
        // Check if user has too many recent requests
        var recentRequests = await _dbContext.PasswordResetTokens
            .CountAsync(t => t.UserId == user.Id && t.RequestedAt > DateTime.UtcNow.AddHours(-1));
        
        if (recentRequests >= 3)
        {
            return Result.BadRequest("Quá nhiều yêu cầu. Vui lòng thử lại sau 1 giờ.");
        }
        
        // Generate token
        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        
        // Hash token before storing
        var hashedToken = HashToken(token);
        
        // Store in database
        var resetTokenEntity = new PasswordResetToken
        {
            UserId = user.Id,
            HashedToken = hashedToken,
            ExpiresAt = DateTime.UtcNow.AddHours(1),  // 1 hour expiry
            Used = false,
            RequestedIpAddress = request.IpAddress
        };
        
        _dbContext.PasswordResetTokens.Add(resetTokenEntity);
        await _unitOfWork.CompleteAsync(ct);
        
        // Generate reset link
        var resetLink = $"{_appUrl}/reset-password?token={Uri.EscapeDataString(token)}&email={Uri.EscapeDataString(user.Email)}";
        
        // Send email
        await _emailService.SendAsync(
            user.Email,
            "🔑 Đặt lại mật khẩu",
            $@"
                <h2>Đặt lại mật khẩu</h2>
                <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào link bên dưới:</p>
                <a href='{resetLink}' style='background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;'>
                    Đặt lại mật khẩu
                </a>
                <p>Hoặc copy link này:</p>
                <code>{resetLink}</code>
                <p><strong>Lưu ý:</strong></p>
                <ul>
                    <li>Link này sẽ hết hạn sau 1 giờ</li>
                    <li>Chỉ sử dụng được 1 lần</li>
                    <li>Nếu không yêu cầu, vui lòng bỏ qua email này</li>
                </ul>
            ",
            isHtml: true
        );
        
        return Result.Success("Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.");
    }
    
    private string HashToken(string token)
    {
        using var sha256 = SHA256.Create();
        var hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(hash);
    }
}
```

```csharp
// File: ResetPasswordCommandHandler.cs
public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Result>
{
    public async Task<Result> Handle(ResetPasswordCommand request, CancellationToken ct)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return Result.BadRequest("Token không hợp lệ");
        }
        
        // Find unexpired, unused token
        var resetToken = await _dbContext.PasswordResetTokens
            .FirstOrDefaultAsync(t => 
                t.UserId == user.Id && 
                !t.Used && 
                t.ExpiresAt > DateTime.UtcNow, ct);
        
        if (resetToken == null)
        {
            return Result.BadRequest("Token đã hết hạn hoặc không hợp lệ");
        }
        
        // Verify token matches hash
        var hashedRequestToken = HashToken(request.Token);
        if (resetToken.HashedToken != hashedRequestToken)
        {
            return Result.BadRequest("Token không hợp lệ");
        }
        
        // Reset password
        var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
        
        if (!result.Succeeded)
        {
            return Result.BadRequest(result.Errors.Select(e => e.Description).ToArray());
        }
        
        // Mark token as used
        resetToken.Used = true;
        resetToken.UsedAt = DateTime.UtcNow;
        
        // Revoke ALL refresh tokens (force re-login everywhere)
        var allUserTokens = await _dbContext.RefreshTokens
            .Where(rt => rt.ApplicationUserId == user.Id && !rt.IsRevoked)
            .ToListAsync(ct);
        
        foreach (var token in allUserTokens)
        {
            token.IsRevoked = true;
        }
        
        await _unitOfWork.CompleteAsync(ct);
        
        // Send confirmation email
        await _emailService.SendAsync(
            user.Email,
            "✅ Mật khẩu đã được đổi",
            @"
                <h2>Mật khẩu đã được đổi thành công</h2>
                <p>Mật khẩu của bạn đã được cập nhật.</p>
                <p>Nếu không phải bạn thực hiện, vui lòng liên hệ support ngay.</p>
            ",
            isHtml: true
        );
        
        return Result.Success("Mật khẩu đã được đổi thành công.");
    }
}
```

---

## 4. 📋 DANH SÁCH ƯU TIÊN TRIỂN KHAI

### Bảng Priority Matrix

| STT | Cải tiến | Mức độ rủi ro | Thời gian | Impact | Effort | Priority | Score |
|-----|----------|---------------|-----------|--------|--------|----------|-------|
| 1 | **Triển khai 2FA cho Admin** | 🔴 Cao | 2-3 ngày | 🔴 Rất cao | 🟡 Trung bình | **P0** | 95/100 |
| 2 | **Binding Refresh Token với Device** | 🔴 Cao | 1-2 ngày | 🔴 Cao | 🟢 Thấp | **P0** | 90/100 |
| 3 | **Email notification security events** | 🟠 Trung bình | 1 ngày | 🟠 Trung bình | 🟢 Thấp | **P1** | 75/100 |
| 4 | **Cải thiện CSP headers** | 🟠 Trung bình | 0.5 ngày | 🟠 Trung bình | 🟢 Thấp | **P1** | 70/100 |
| 5 | **Rate limiting theo User** | 🟠 Trung bình | 0.5 ngày | 🟠 Trung bình | 🟢 Thấp | **P1** | 70/100 |
| 6 | **Secure password reset với token hashing** | 🟡 Thấp | 1 ngày | 🟠 Cao | 🟡 Trung bình | **P2** | 60/100 |
| 7 | **Alert đăng nhập bất thường** | 🟡 Thấp | 1-2 ngày | 🟠 Trung bình | 🟡 Trung bình | **P2** | 55/100 |
| 8 | **Encryption at-rest cho sensitive data** | 🟡 Thấp | 2-3 ngày | 🟠 Cao | 🔴 Cao | **P2** | 50/100 |

### Roadmap đề xuất

#### **Phase 1: Critical Security (Tuần 1)**
- [ ] Implement 2FA cho Admin
- [ ] Device fingerprinting cho refresh token
- [ ] Setup email service cho security notifications

#### **Phase 2: Hardening (Tuần 2)**
- [ ] Tighten CSP headers
- [ ] User-based rate limiting
- [ ] Secure password reset flow

#### **Phase 3: Monitoring & Alerting (Tuần 3)**
- [ ] Suspicious login detection
- [ ] Security dashboard cho admin
- [ ] Automated alerts setup

#### **Phase 4: Advanced Security (Tuần 4+)**
- [ ] Encryption at-rest
- [ ] Regular security audit automation
- [ ] Penetration testing

---

## 5. ✅ CHECKLIST TỔNG KẾT

### ✅ Đã làm tốt (Keep it up!)

- [x] **httpOnly cookies** cho token storage
- [x] **CSRF protection** với Double Submit Cookie pattern
- [x] **Rate limiting** cho auth endpoints (10 req/min)
- [x] **Account lockout** sau 5 lần đăng nhập sai
- [x] **Strong password policy** (12+ chars, complexity requirements)
- [x] **Refresh token rotation** mechanism
- [x] **Security headers** đầy đủ (X-Frame-Options, CSP, etc.)
- [x] **CORS** cấu hình đúng với credentials
- [x] **Audit logging** cho user activities
- [x] **JWT expiry** hợp lý (60 phút)

### ⚠️ Cần cải thiện gấp (Action Required)

- [ ] **2FA bắt buộc cho Admin** - P0
- [ ] **Device fingerprinting cho refresh token** - P0
- [ ] **Email alert cho security events** - P1
- [ ] **CSP tighten** (loại bỏ unsafe-inline) - P1
- [ ] **Suspicious activity detection** - P1
- [ ] **Password reset token hashing** - P2

### 💡 Khuyến nghị bổ sung (Nice to have)

- [ ] Tích hợp **OWASP ZAP** vào CI/CD pipeline
- [ ] **Regular penetration testing** (quarterly)
- [ ] Implement **CSP reporting** endpoint
- [ ] Thêm **security.txt** file
- [ ] Consider **OAuth2/OIDC** cho SSO integration
- [ ] **Database encryption at-rest** cho columns nhạy cảm
- [ ] **Session management dashboard** cho admin
- [ ] **Automated security scanning** trong PR checks

---

## 📚 TÀI LIỆU THAM KHẢO

1. **OWASP Authentication Cheat Sheet**: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
2. **OWASP Session Management**: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
3. **Microsoft Identity Best Practices**: https://learn.microsoft.com/en-us/aspnet/core/security/
4. **NIST Password Guidelines**: https://pages.nist.gov/800-63-3/sp800-63b.html
5. **CSP Documentation**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP

---

**Generated by:** Security Analysis Tool  
**Last updated:** 2024  
**Version:** 1.0
