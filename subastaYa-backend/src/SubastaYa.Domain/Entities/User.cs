namespace SubastaYa.Domain.Entities;

public class User
{
    public int Id {get;set;}
    public required string Email {get;set;}
    public required string Name {get;set;}
    public required string PasswordHash {get;set;}
    public DateTime RegisteredAt {get;set;}
    public Wallet Wallet { get; set; } = null!;
}