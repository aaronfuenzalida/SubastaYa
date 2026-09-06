using Microsoft.Extensions.DependencyInjection;
using SubastaYa.Application.Auth.Interfaces;
using SubastaYa.Application.Auth.Services;
using SubastaYa.Application.Wallets.Interfaces;
using SubastaYa.Application.Wallets.Services;

namespace SubastaYa.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IWalletService, WalletService>();
        return services;
    }
}
