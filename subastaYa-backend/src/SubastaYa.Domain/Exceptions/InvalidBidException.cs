namespace SubastaYa.Domain.Exceptions;

public class InvalidBidException(string reason) : DomainException(reason);
