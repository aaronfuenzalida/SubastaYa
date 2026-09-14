using Microsoft.EntityFrameworkCore;
using SubastaYa.Application.Common.Interfaces;
using SubastaYa.Domain.Exceptions;

namespace SubastaYa.Infrastructure.Persistence;

public class UnitOfWork(SubastaYaDbContext context) : IUnitOfWork
{
    public async Task SaveChangesAsync()
    {
        try
        {
            await context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            //Traduccion a excepcion de dominio ya que Application no conoce tipos de EF
            throw new ConcurrencyConflictException();
        }
    }
}
