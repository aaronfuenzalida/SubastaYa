namespace SubastaYa.Domain.Exceptions;

public class ConcurrencyConflictException()
    : DomainException("The resource was modified by another operation. Please retry.");
