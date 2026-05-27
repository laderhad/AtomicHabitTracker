using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AtomicHabits.Api.Common.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddHabitReminders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "habit_reminders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    HabitId = table.Column<Guid>(type: "uuid", nullable: false),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false),
                    TriggerTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    TimeZone = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Channel = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    DaysOfWeek = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    QuietHoursStart = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    QuietHoursEnd = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_habit_reminders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_habit_reminders_habits_HabitId",
                        column: x => x.HabitId,
                        principalTable: "habits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_habit_reminders_Enabled_Channel_TriggerTime",
                table: "habit_reminders",
                columns: new[] { "Enabled", "Channel", "TriggerTime" });

            migrationBuilder.CreateIndex(
                name: "IX_habit_reminders_HabitId",
                table: "habit_reminders",
                column: "HabitId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "habit_reminders");
        }
    }
}
