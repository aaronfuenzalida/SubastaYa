using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SubastaYa.Domain.Entities;

namespace SubastaYa.Infrastructure.Persistence.Configurations;

public class LedgerEntryConfiguration : IEntityTypeConfiguration<LedgerEntry>
{
    public void Configure(EntityTypeBuilder<LedgerEntry> builder)
    {
        builder.HasKey(l => l.Id);

        builder.Property(l => l.Amount).HasPrecision(18, 2);

        builder.Property(l => l.Type).HasConversion<string>().HasMaxLength(20);

        builder.HasOne(l => l.Wallet)
            .WithMany()
            .HasForeignKey(l => l.WalletId);

        builder.HasOne<Auction>()
            .WithMany()
            .HasForeignKey(l => l.AuctionId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
