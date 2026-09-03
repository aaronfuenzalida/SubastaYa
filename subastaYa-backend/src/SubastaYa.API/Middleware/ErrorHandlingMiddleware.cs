using SubastaYa.Domain.Exceptions;

namespace SubastaYa.API.Middleware;

public class ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
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
                DomainException => StatusCodes.Status400BadRequest,
                _ => StatusCodes.Status500InternalServerError
            };

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
}
