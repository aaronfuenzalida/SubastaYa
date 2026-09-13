namespace SubastaYa.Domain.Exceptions;

public class BidTooLowException(decimal minimum)
    : DomainException($"Bid too low. Minimum allowed bid is {minimum}.");
