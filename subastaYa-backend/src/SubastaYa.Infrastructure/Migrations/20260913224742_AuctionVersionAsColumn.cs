using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SubastaYa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AuctionVersionAsColumn : Migration
    {
        // Corregida a mano: EF scaffoldeó un RenameColumn de "xmin", pero xmin es una
        // columna de sistema de Postgres (nunca existió como columna propia) y no puede
        // renombrarse. Lo real es agregar la columna Version nueva.
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "Auctions",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Version",
                table: "Auctions");
        }
    }
}
