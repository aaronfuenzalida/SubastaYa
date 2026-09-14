namespace SubastaYa.Domain.Exceptions;

public class AuctionNotActiveException()
    : DomainException("The auction is not active or has already ended.");
