using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SubastaYa.Domain.Entities;

namespace SubastaYa.Infrastructure.Persistence.Configurations;

public class AuctionConfiguration : IEntityTypeConfiguration<Auction>
{
    public void Configure(EntityTypeBuilder<Auction> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Title).HasMaxLength(150);
        builder.Property(a => a.Description).HasMaxLength(2000);
        builder.Property(a => a.ImageUrl).HasMaxLength(500);

        builder.Property(a => a.BasePrice).HasPrecision(18, 2);
        builder.Property(a => a.MinIncrement).HasPrecision(18, 2);

        builder.Property(a => a.Status).HasConversion<string>().HasMaxLength(20);

        builder.Property(a => a.Version).IsRowVersion();

        builder.HasOne(a => a.Seller)
            .WithMany()
            .HasForeignKey(a => a.SellerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Category)
            .WithMany()
            .HasForeignKey(a => a.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(a => new { a.Status, a.EndsAt });
    }
}
