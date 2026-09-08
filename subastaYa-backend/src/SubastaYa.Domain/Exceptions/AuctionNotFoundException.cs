namespace SubastaYa.Domain.Exceptions;

public class AuctionNotFoundException(int id)
    : DomainException($"No auction found for id {id}");