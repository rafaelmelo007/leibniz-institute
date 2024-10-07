using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Leibniz.Api.Migrations
{
    /// <inheritdoc />
    public partial class Date_Fields_In_Periods_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<short>(
                name: "BeginDay",
                table: "Periods",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "BeginMonth",
                table: "Periods",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "BeginYear",
                table: "Periods",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "EndDay",
                table: "Periods",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "EndMonth",
                table: "Periods",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "EndYear",
                table: "Periods",
                type: "smallint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Periods_BeginYear_EndYear",
                table: "Periods",
                columns: new[] { "BeginYear", "EndYear" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Periods_BeginYear_EndYear",
                table: "Periods");

            migrationBuilder.DropColumn(
                name: "BeginDay",
                table: "Periods");

            migrationBuilder.DropColumn(
                name: "BeginMonth",
                table: "Periods");

            migrationBuilder.DropColumn(
                name: "BeginYear",
                table: "Periods");

            migrationBuilder.DropColumn(
                name: "EndDay",
                table: "Periods");

            migrationBuilder.DropColumn(
                name: "EndMonth",
                table: "Periods");

            migrationBuilder.DropColumn(
                name: "EndYear",
                table: "Periods");
        }
    }
}
