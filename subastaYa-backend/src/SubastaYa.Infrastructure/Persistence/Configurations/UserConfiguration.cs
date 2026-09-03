using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SubastaYa.Domain.Entities;

namespace SubastaYa.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);

        builder.Property(u => u.Email).HasMaxLength(255);
        builder.Property(u => u.Name).HasMaxLength(100);
        builder.Property(u => u.PasswordHash).HasMaxLength(100);

        builder.HasIndex(u => u.Email).IsUnique();
    }
}
