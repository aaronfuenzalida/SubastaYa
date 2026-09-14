using System.Security.Claims;
using System.Text.Json;
using SubastaYa.Application.Common.Interfaces;
using SubastaYa.Domain;
using SubastaYa.Domain.Entities;
using SubastaYa.Domain.Exceptions;

namespace SubastaYa.API.Middleware;

public class ErrorHandlingMiddleware(
    RequestDelegate next,
    ILogger<ErrorHandlingMiddleware> logger,
    IServiceScopeFactory scopeFactory)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            var statusCode = exception switch
            {
                EmailAlreadyRegisteredException => StatusCodes.Status409Conflict,
                InvalidCredentialsException => StatusCodes.Status401Unauthorized,
                WalletNotFoundException => StatusCodes.Status404NotFound,
                AuctionNotFoundException => StatusCodes.Status404NotFound,
                CategoryNotFoundException => StatusCodes.Status404NotFound,
                InvalidAuctionDatesException => StatusCodes.Status400BadRequest,
                InsufficientFundsException => StatusCodes.Status422UnprocessableEntity,
                ConcurrencyConflictException => StatusCodes.Status409Conflict,
                DomainException => StatusCodes.Status400BadRequest,
                _ => StatusCodes.Status500InternalServerError
            };

            if (exception is ConcurrencyConflictException)
                await AuditConcurrencyRejectionAsync(context);

            if (statusCode == StatusCodes.Status500InternalServerError)
                logger.LogError(exception, "Unhandled exception");

            context.Response.StatusCode = statusCode;
            await context.Response.WriteAsJsonAsync(new
            {
                error = statusCode == StatusCodes.Status500InternalServerError
                    ? "An unexpected error occurred."
                    : exception.Message
            });
        }
    }

    // El audit del rechazo no puede viajar en la transaccion que fallo (se revirtio
    // entera y el DbContext del request quedo con los cambios que fallaron trackeados),
    // asi que se escribe en un scope nuevo con un context limpio.
    private async Task AuditConcurrencyRejectionAsync(HttpContext context)
    {
        try
        {
            using var scope = scopeFactory.CreateScope();
            var auditLogs = scope.ServiceProvider.GetRequiredService<IAuditLogRepository>();
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

            var auctionId = int.TryParse(
                context.Request.RouteValues["auctionId"]?.ToString(), out var parsedAuctionId)
                ? parsedAuctionId
                : 0;

            int? userId = int.TryParse(
                context.User.FindFirstValue(ClaimTypes.NameIdentifier), out var parsedUserId)
                ? parsedUserId
                : null;

            auditLogs.Add(new AuditLog
            {
                Entity = "Auction",
                EntityId = auctionId,
                Action = AuditActions.BidRejectedByConcurrency,
                UserId = userId,
                DetailsJson = JsonSerializer.Serialize(new
                {
                    path = context.Request.Path.Value,
                    method = context.Request.Method
                }),
                CreatedAt = DateTime.UtcNow
            });

            await unitOfWork.SaveChangesAsync();
        }
        catch (Exception auditException)
        {
            // La auditoria del rechazo nunca debe tapar el 409 original
            logger.LogError(auditException, "Failed to audit concurrency rejection");
        }
    }
}
