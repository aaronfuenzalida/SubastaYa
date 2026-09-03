namespace SubastaYa.Domain.Entities;

public class AuditLog
{
    public int Id { get; set; }
    public required string Entity { get; set; }
    public int EntityId { get; set; }
    public required string Action { get; set; }
    public int? UserId { get; set; }
    public string? DetailsJson { get; set; }
    public DateTime CreatedAt { get; set; }
}
