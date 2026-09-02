using Microsoft.EntityFrameworkCore;

namespace SubastaYa.Infrastructure.Persistence;

public class SubastaYaDbContext : DbContext
{
    public SubastaYaDbContext(DbContextOptions<SubastaYaDbContext> options) : base(options)
    {
    }

    // TODO: DbSets del dominio

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SubastaYaDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
