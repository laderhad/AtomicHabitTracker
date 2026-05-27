using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AtomicHabits.Api.Common.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddBadgeUnlockSeenAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "SeenAt",
                table: "badge_unlocks",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_badge_unlocks_UserId_SeenAt_UnlockedAt",
                table: "badge_unlocks",
                columns: new[] { "UserId", "SeenAt", "UnlockedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_badge_unlocks_UserId_SeenAt_UnlockedAt",
                table: "badge_unlocks");

            migrationBuilder.DropColumn(
                name: "SeenAt",
                table: "badge_unlocks");
        }
    }
}
