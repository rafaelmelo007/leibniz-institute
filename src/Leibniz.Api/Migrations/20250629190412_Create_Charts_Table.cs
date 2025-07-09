using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Leibniz.Api.Migrations
{
    /// <inheritdoc />
    public partial class Create_Charts_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Charts",
                columns: table => new
                {
                    ChartId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreateDateUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: false),
                    UpdateDateUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    DeleteDateUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<long>(type: "bigint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Charts", x => x.ChartId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Charts_Name",
                table: "Charts",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Charts_UpdateDateUtc_CreateDateUtc",
                table: "Charts",
                columns: new[] { "UpdateDateUtc", "CreateDateUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Charts");
        }
    }
}
