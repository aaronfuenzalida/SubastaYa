using Microsoft.EntityFrameworkCore;
using SubastaYa.Application.Auth.Interfaces;
using SubastaYa.Domain.Entities;
using SubastaYa.Domain.Enums;

namespace SubastaYa.Infrastructure.Persistence;

// Seed en runtime y no con HasData: el enunciado pide fechas relativas al momento de la
// siembra ("cierra en 25 min") y los hashes BCrypt no son deterministas, dos cosas
// incompatibles con el seeding por migraciones.
public static class DbSeeder
{
    public static async Task SeedAsync(SubastaYaDbContext context, IPasswordHasher passwordHasher)
    {
        // Aplicar migraciones aca permite que el proyecto se levante con un solo "dotnet run".
        await context.Database.MigrateAsync();

        // Si hay datos no se toca nada para asi no duplicar ni pisar trabajo manual.
        if (await context.Users.AnyAsync())
            return;

        var now = DateTime.UtcNow;

        // Un solo hash compartido debido a que BCrypt es deliberadamente lento y la contraseña de
        // prueba es la misma para los 4 usuarios (documentada en el README).
        var passwordHash = passwordHasher.Hash("Test1234!");

        var seller = new User
        {
            Email = "vendedor@test.com",
            Name = "Vendedor Test",
            PasswordHash = passwordHash,
            RegisteredAt = now.AddDays(-30),
            Wallet = new Wallet()
        };

        var buyer1 = new User
        {
            Email = "comprador1@test.com",
            Name = "Comprador Uno",
            PasswordHash = passwordHash,
            RegisteredAt = now.AddDays(-30),
            Wallet = new Wallet { TotalBalance = 150_000, HeldBalance = 45_000 }
        };

        // El enunciado sugiere comprador2 sin retenciones, pero como es el ganador de la
        // subasta vencida necesita tener su puja de $10.000 aun retenida: si no, la
        // liquidacion del worker (debitar lo retenido) dejaria HeldBalance (SaldoRetenido) negativo.
        var buyer2 = new User
        {
            Email = "comprador2@test.com",
            Name = "Comprador Dos",
            PasswordHash = passwordHash,
            RegisteredAt = now.AddDays(-30),
            Wallet = new Wallet { TotalBalance = 200_000, HeldBalance = 10_000 }
        };

        var broke = new User
        {
            Email = "sinfondos@test.com",
            Name = "Sin Fondos",
            PasswordHash = passwordHash,
            RegisteredAt = now.AddDays(-30),
            Wallet = new Wallet { TotalBalance = 500 }
        };

        var tech = new Category { Name = "Tecnología", IconUrl = "https://cdn-icons-png.flaticon.com/128/3659/3659898.png" };
        var collectibles = new Category { Name = "Coleccionables", IconUrl = "https://cdn-icons-png.flaticon.com/128/3081/3081478.png" };
        var apparel = new Category { Name = "Indumentaria", IconUrl = "https://cdn-icons-png.flaticon.com/128/863/863684.png" };
        var vehicles = new Category { Name = "Vehículos", IconUrl = "https://cdn-icons-png.flaticon.com/128/741/741407.png" };

        var standardActive = new Auction
        {
            Seller = seller,
            Category = tech,
            Title = "iPhone 15 Pro 256GB",
            Description = "iPhone 15 Pro en excelente estado, batería al 95%, con caja y cargador originales.",
            ImageUrl = "https://picsum.photos/seed/iphone15/600/400",
            BasePrice = 30_000,
            MinIncrement = 5_000,
            StartsAt = now.AddHours(-2),
            EndsAt = now.AddMinutes(25),
            Status = AuctionStatus.Active
        };

        // Cierra en 90s para poder probar la alerta visual del ultimo minuto y la
        // extension anti-sniping sin esperar.
        var criticalActive = new Auction
        {
            Seller = seller,
            Category = apparel,
            Title = "Zapatillas Nike Air Jordan 1",
            Description = "Edición limitada, talle 42, sin uso.",
            ImageUrl = "https://picsum.photos/seed/jordan1/600/400",
            BasePrice = 80_000,
            MinIncrement = 2_000,
            StartsAt = now.AddMinutes(-30),
            EndsAt = now.AddSeconds(90),
            Status = AuctionStatus.Active
        };

        var upcoming = new Auction
        {
            Seller = seller,
            Category = vehicles,
            Title = "Ford Mustang 1967",
            Description = "Clásico restaurado a nuevo, motor V8 original, papeles al día.",
            ImageUrl = "https://picsum.photos/seed/mustang67/600/400",
            BasePrice = 3_000_000,
            MinIncrement = 100_000,
            StartsAt = now.AddHours(24),
            EndsAt = now.AddHours(48),
            Status = AuctionStatus.Scheduled
        };

        // Las dos vencidas se siembran Active a proposito: serian el caso de prueba del
        // worker, el cual debe detectarlas y pasarlas a Finished (liquidando) o Deserted.
        var expiredWithWinner = new Auction
        {
            Seller = seller,
            Category = tech,
            Title = "Notebook Lenovo ThinkPad T14",
            Description = "Ryzen 7, 16GB RAM, 512GB SSD. Ideal para trabajo.",
            ImageUrl = "https://picsum.photos/seed/thinkpad/600/400",
            BasePrice = 8_000,
            MinIncrement = 1_000,
            StartsAt = now.AddDays(-3),
            EndsAt = now.AddHours(-2),
            Status = AuctionStatus.Active
        };

        var expiredDeserted = new Auction
        {
            Seller = seller,
            Category = collectibles,
            Title = "Álbum de figuritas México 86 completo",
            Description = "Álbum original completo del Mundial de México 1986.",
            ImageUrl = "https://picsum.photos/seed/album86/600/400",
            BasePrice = 120_000,
            MinIncrement = 10_000,
            StartsAt = now.AddDays(-4),
            EndsAt = now.AddDays(-1),
            Status = AuctionStatus.Active
        };

        var outbidBid = new Bid { Auction = standardActive, Bidder = buyer2, Amount = 40_000, PlacedAt = now.AddMinutes(-40) };
        var leadingBid = new Bid { Auction = standardActive, Bidder = buyer1, Amount = 45_000, PlacedAt = now.AddMinutes(-15) };
        var winningBid = new Bid { Auction = expiredWithWinner, Bidder = buyer2, Amount = 10_000, PlacedAt = now.AddDays(-1) };

        context.AddRange(seller, buyer1, buyer2, broke);
        context.AddRange(tech, collectibles, apparel, vehicles);
        context.AddRange(standardActive, criticalActive, upcoming, expiredWithWinner, expiredDeserted);
        context.AddRange(outbidBid, leadingBid, winningBid);
        await context.SaveChangesAsync();

        // Segundo SaveChanges: LedgerEntry referencia subastas por AuctionId (sin navegacion),
        // así que necesita los ids que la base genero recién en el guardado anterior.
        // Los asientos cuentan la historia completa: depositos, el hold de comprador2,
        // su release al ser superado, y los holds vigentes que respaldan cada HeldBalance.
        context.AddRange(
            new LedgerEntry { Wallet = buyer1.Wallet, Type = TransactionType.Deposit, Amount = 150_000, CreatedAt = now.AddDays(-7) },
            new LedgerEntry { Wallet = buyer2.Wallet, Type = TransactionType.Deposit, Amount = 200_000, CreatedAt = now.AddDays(-7) },
            new LedgerEntry { Wallet = broke.Wallet, Type = TransactionType.Deposit, Amount = 500, CreatedAt = now.AddDays(-7) },
            new LedgerEntry { Wallet = buyer2.Wallet, Type = TransactionType.Hold, Amount = 40_000, CreatedAt = now.AddMinutes(-40), AuctionId = standardActive.Id },
            new LedgerEntry { Wallet = buyer2.Wallet, Type = TransactionType.Release, Amount = 40_000, CreatedAt = now.AddMinutes(-15), AuctionId = standardActive.Id },
            new LedgerEntry { Wallet = buyer1.Wallet, Type = TransactionType.Hold, Amount = 45_000, CreatedAt = now.AddMinutes(-15), AuctionId = standardActive.Id },
            new LedgerEntry { Wallet = buyer2.Wallet, Type = TransactionType.Hold, Amount = 10_000, CreatedAt = now.AddDays(-1), AuctionId = expiredWithWinner.Id });
        await context.SaveChangesAsync();
    }
}
