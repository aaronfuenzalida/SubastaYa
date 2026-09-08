using Microsoft.EntityFrameworkCore;
using SubastaYa.Application.Auctions.Dtos;
using SubastaYa.Application.Common.Dtos;
using SubastaYa.Application.Common.Interfaces;
using SubastaYa.Domain.Entities;

namespace SubastaYa.Infrastructure.Persistence.Repositories;

public class AuctionRepository(SubastaYaDbContext context) : IAuctionRepository
{
    public async Task<PagedResultDto<AuctionSummaryDto>> GetPagedAsync(AuctionFilterDto filter)
    {
        // Es una composicionn condicional, por ende cada filtro se suma solo si vino en la query string
        // y nada se ejecuta contra la base hasta CountAsync/ToListAsync
        var query = context.Auctions.AsQueryable();

        if (filter.Status is not null)
            query = query.Where(a => a.Status == filter.Status);

        if (filter.CategoryId is not null)
            query = query.Where(a => a.CategoryId == filter.CategoryId);

        // Precio actual = puja maxima o precio base si no hay pujas. El cast a decimal?
        // hace que el MAX sin filas sea null y el ?? se traduzca a COALESCE en SQL
        if (filter.MinPrice is not null)
            query = query.Where(a => (a.Bids.Max(b => (decimal?)b.Amount) ?? a.BasePrice) >= filter.MinPrice);

        if (filter.MaxPrice is not null)
            query = query.Where(a => (a.Bids.Max(b => (decimal?)b.Amount) ?? a.BasePrice) <= filter.MaxPrice);

        // El orden se fija antes de pagina ya que paginar sin orden estable mezcla las paginas
        query = filter.Sort == "highestPrice"
            ? query.OrderByDescending(a => a.Bids.Max(b => (decimal?)b.Amount) ?? a.BasePrice)
            : query.OrderBy(a => a.EndsAt);

        // Total de la busqueda completa (sin Skip/Take), el front lo va a necesitar para el paginador
        var total = await query.CountAsync();

        // Proyeccion directa a las columnas, la base resuelve joins, MAX y COUNT
        // y viajan solo los campos de la card (sin Includes ni entidades completas)
        var rows = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(a => new
            {
                a.Id,
                a.Title,
                CategoryName = a.Category.Name,
                a.ImageUrl,
                CurrentPrice = a.Bids.Max(b => (decimal?)b.Amount) ?? a.BasePrice,
                BidsCount = a.Bids.Count,
                a.EndsAt,
                a.Status
            })
            .ToListAsync();

        // Segundo Select en memoria ya que EF no traduce enum.ToString(), asi que la
        // conversion cosmetica se hace sobre las filas ya materializadas
        var items = rows
            .Select(r => new AuctionSummaryDto(r.Id, r.Title, r.CategoryName, r.ImageUrl,
                r.CurrentPrice, r.BidsCount, r.EndsAt, r.Status.ToString()))
            .ToList();

        return new PagedResultDto<AuctionSummaryDto>(items, filter.Page, filter.PageSize, total);
    }

    public Task<Auction?> GetByIdAsync(int id) =>
        context.Auctions
            .Include(a => a.Category)
            .Include(a => a.Seller)
            .Include(a => a.Bids)
            .FirstOrDefaultAsync(a => a.Id == id);

    public async Task AddAsync(Auction auction)
    {
        context.Auctions.Add(auction);
        await context.SaveChangesAsync();
    }
}
