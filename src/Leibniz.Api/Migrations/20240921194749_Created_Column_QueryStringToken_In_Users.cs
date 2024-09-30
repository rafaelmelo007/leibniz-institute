﻿using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Leibniz.Api.Migrations
{
    /// <inheritdoc />
    public partial class Created_Column_QueryStringToken_In_Users : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "QueryStringToken",
                table: "Users",
                type: "uniqueidentifier",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "QueryStringToken",
                table: "Users");
        }
    }
}
