using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Leibniz.Api.Migrations
{
    /// <inheritdoc />
    public partial class Added_IsPrimary_Col : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPrimary",
                table: "Relationships",
                type: "bit",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Relationships_IsPrimary",
                table: "Relationships",
                column: "IsPrimary");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Relationships_IsPrimary",
                table: "Relationships");

            migrationBuilder.DropColumn(
                name: "IsPrimary",
                table: "Relationships");
        }
    }
}
