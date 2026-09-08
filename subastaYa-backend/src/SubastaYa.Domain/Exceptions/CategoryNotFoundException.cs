namespace SubastaYa.Domain.Exceptions;

public class CategoryNotFoundException(int id)
    : DomainException($"No category found for id {id}");