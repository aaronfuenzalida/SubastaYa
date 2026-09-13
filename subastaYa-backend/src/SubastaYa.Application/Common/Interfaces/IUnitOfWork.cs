namespace SubastaYa.Application.Common.Interfaces;

public interface IUnitOfWork
{
    Task SaveChangesAsync();
}
