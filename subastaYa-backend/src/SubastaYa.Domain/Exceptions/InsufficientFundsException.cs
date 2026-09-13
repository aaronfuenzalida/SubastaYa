namespace SubastaYa.Domain.Exceptions;

public class InsufficientFundsException()
    : DomainException("Insufficient available balance to place this bid.");
