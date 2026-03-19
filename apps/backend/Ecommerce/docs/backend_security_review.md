# Backend Security & Architecture Review Report

**Date:** Friday, January 9, 2026
**Role:** Backend Architect & Security Engineer

## 1. Authentication & Authorization

### 🔴 High: Insecure Direct Object Reference (IDOR) in Order Retrieval
- **Issue:** The `GetOrderByIdQueryHandler.cs` retrieves orders strictly by ID without verifying if the order belongs to the requesting user.
- **Impact:** Any authenticated user with `ViewOrders` permission can potentially view any order in the system by guessing or obtaining its GUID.
- **Recommendation:** Modify the query to filter by `ApplicationUserId` for non-admin users. Ensure similar checks exist for user profiles, addresses, and carts.

### 🟠 Medium: Sensitive Configuration Leakage
- **Issue:** The JWT Secret Key and connection strings are stored in `appsettings.Development.json`.
- **Impact:** High risk of secret exposure if the file is committed or leaked.
- **Recommendation:** Use environment variables, Azure Key Vault, or AWS Secrets Manager for production environments.

### ✅ Positive Observations
- **Token Rotation:** `RefreshTokenCommandHandler.cs` correctly implements token revocation and rotation.
- **Brute-force Protection:** `LoginUserCommandHandler.cs` implements account lockout (30 mins) after 5 failed attempts.
- **Policy-based Auth:** Well-structured policy definitions in `AuthorizationPolicies.cs` using granular permissions.

---

## 2. Security Vulnerabilities

### 🟠 Medium: HTTPS Redirection
- **Issue:** `app.UseHttpsRedirection()` is often commented out or disabled in the pipeline during development.
- **Impact:** Data transmitted over HTTP is vulnerable to interception (MITM).
- **Recommendation:** Ensure HTTPS is enforced and HSTS is configured for the Production environment.

### 🟠 Medium: CORS Policy
- **Issue:** Current CORS setup is permissive (allowing `localhost:3000` or wide origins).
- **Impact:** Cross-site resource sharing risks if not properly restricted.
- **Recommendation:** Implement a strict whitelist of frontend domains for the Production environment.

### 🟡 Low: Error Information Leakage
- **Issue:** Global exception handling is present but needs verification that stack traces are suppressed in Production.
- **Recommendation:** Ensure `UseGlobalExceptionHandling` returns a generic error message and unique reference ID to the client, while logging full details internally.

---

## 3. Architecture & Maintainability

### ✅ Clean Architecture Adherence
- The project follows Clean Architecture principles with clear separation between WebAPI, Application, Infrastructure, and Domain layers.
- Logic is effectively encapsulated within MediatR Handlers.

### ✅ Input Validation
- Utilizes `ValidationBehavior` with FluentValidation, keeping the business logic clean of validation boilerplate.

### ✅ Audit & Logging
- `LoggingBehavior` and `UserActivityService` provide good traceability of user actions and system behavior.

---

## 4. Prioritized Action Plan

1.  **High Priority:** Audit and fix IDOR vulnerabilities in `Orders`, `Addresses`, and `User` modules.
2.  **Medium Priority:** Securely move secrets from JSON files to Environment Variables/Secrets Manager.
3.  **Medium Priority:** Configure strict CORS and HSTS for production deployment.
4.  **Low Priority:** Verify sensitive data (passwords, tokens) is not being logged in `LoggingBehavior`.
