using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AtomicHabits.Api.Common.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddBadgeUnlocks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "badge_unlocks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    BadgeCode = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    UnlockedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ContextJson = table.Column<string>(type: "jsonb", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_badge_unlocks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_badge_unlocks_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_badge_unlocks_UserId_BadgeCode",
                table: "badge_unlocks",
                columns: new[] { "UserId", "BadgeCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_badge_unlocks_UserId_UnlockedAt",
                table: "badge_unlocks",
                columns: new[] { "UserId", "UnlockedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "badge_unlocks");
        }
    }
}
