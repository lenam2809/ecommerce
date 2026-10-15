namespace Ecommerce.Application.Common.Interfaces;

/// <summary>
/// Marker interface for MediatR requests that should not be wrapped by TransactionBehavior's
/// ambient transaction management and automatic failure rollback.
/// Use for requests that manage their own transaction boundaries or must persist security-critical
/// mutations (e.g. account lockouts on failed attempts, refresh token replay revocation)
/// even when returning failure results.
/// </summary>
public interface INonTransactionalRequest
{
}
