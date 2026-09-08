namespace SubastaYa.Domain.Exceptions;

public class InvalidAuctionDatesException(string reason)
    : DomainException($"Invalid auction dates: {reason}");
