namespace SubastaYa.Domain.Exceptions;

public class WalletNotFoundException(int userId)
    : DomainException($"No wallet found for user {userId}.");
