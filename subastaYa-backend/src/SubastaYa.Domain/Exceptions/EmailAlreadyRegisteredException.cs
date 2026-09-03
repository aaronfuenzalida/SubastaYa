namespace SubastaYa.Domain.Exceptions;

public class EmailAlreadyRegisteredException(string email)
    : DomainException($"The email '{email}' is already registered.");
