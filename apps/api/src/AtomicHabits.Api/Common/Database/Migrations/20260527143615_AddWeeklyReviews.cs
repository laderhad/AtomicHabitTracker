using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AtomicHabits.Api.Common.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddWeeklyReviews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "weekly_reviews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    WeekStartOn = table.Column<DateOnly>(type: "date", nullable: false),
                    ConsistencyScore = table.Column<int>(type: "integer", nullable: true),
                    WhatWorked = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    WhatWasHard = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Adjustment = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Mood = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_weekly_reviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_weekly_reviews_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_weekly_reviews_UserId_WeekStartOn",
                table: "weekly_reviews",
                columns: new[] { "UserId", "WeekStartOn" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "weekly_reviews");
        }
    }
}
