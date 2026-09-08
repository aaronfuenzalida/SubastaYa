using Microsoft.Extensions.DependencyInjection;
using SubastaYa.Application.Auth.Interfaces;
using SubastaYa.Application.Auth.Services;
using SubastaYa.Application.Wallets.Interfaces;
using SubastaYa.Application.Wallets.Services;
using SubastaYa.Application.Categories.Interfaces;
using SubastaYa.Application.Categories.Services;
using SubastaYa.Application.Auctions.Interfaces;
using SubastaYa.Application.Auctions.Services;

namespace SubastaYa.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IWalletService, WalletService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IAuctionService, AuctionService>();
        return services;
    }
}
