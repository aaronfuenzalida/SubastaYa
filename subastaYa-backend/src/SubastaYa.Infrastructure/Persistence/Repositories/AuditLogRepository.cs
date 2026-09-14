using SubastaYa.Application.Common.Interfaces;
using SubastaYa.Domain.Entities;

namespace SubastaYa.Infrastructure.Persistence.Repositories;

public class AuditLogRepository(SubastaYaDbContext context) : IAuditLogRepository
{
    // Sin SaveChanges: el registro viaja en la misma transaccion de la operacion
    // auditada (si la operacion falla, el audit se revierte con ella).
    public void Add(AuditLog entry) => context.AuditLogs.Add(entry);
}
