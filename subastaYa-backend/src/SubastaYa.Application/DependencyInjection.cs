using Microsoft.Extensions.DependencyInjection;
using SubastaYa.Application.Auth.Interfaces;
using SubastaYa.Application.Auth.Services;

namespace SubastaYa.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        return services;
    }
}
