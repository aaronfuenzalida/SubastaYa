namespace SubastaYa.Application.Common.Dtos;

public record PagedResultDto<T>(
    List<T> Items,
    int Page,
    int PageSize,
    int TotalCount
);
