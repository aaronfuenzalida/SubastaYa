using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SubastaYa.Application.Auctions.Interfaces;

namespace SubastaYa.Infrastructure.BackgroundJobs;

public class AuctionFinalizerWorker(
    IServiceScopeFactory scopeFactory,
    ILogger<AuctionFinalizerWorker> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromSeconds(30);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(Interval);

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                // el worker es singleton pero el DbContext es scoped
                using var scope = scopeFactory.CreateScope();
                var finalizer = scope.ServiceProvider.GetRequiredService<IAuctionFinalizerService>();
                await finalizer.StartScheduledAuctionsAsync();
                await finalizer.ProcessExpiredAuctionsAsync();
            }
            catch (Exception exception)
            {
                logger.LogError(exception, "Error while finalizing expired auctions");
            }
        }
    }
}
