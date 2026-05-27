using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AtomicHabits.Api.Common.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddChallengesAndShareCards : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "challenges",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Description = table.Column<string>(type: "character varying(600)", maxLength: 600, nullable: false),
                    StartAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    EndAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Visibility = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    InviteCode = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_challenges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_challenges_AspNetUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "share_cards",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Title = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Subtitle = table.Column<string>(type: "character varying(240)", maxLength: 240, nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    DeepLink = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    PayloadJson = table.Column<string>(type: "jsonb", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_share_cards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_share_cards_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "challenge_check_ins",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ChallengeId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    HabitLogId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_challenge_check_ins", x => x.Id);
                    table.ForeignKey(
                        name: "FK_challenge_check_ins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_challenge_check_ins_challenges_ChallengeId",
                        column: x => x.ChallengeId,
                        principalTable: "challenges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_challenge_check_ins_habit_logs_HabitLogId",
                        column: x => x.HabitLogId,
                        principalTable: "habit_logs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "challenge_participants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ChallengeId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Role = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    JoinedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_challenge_participants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_challenge_participants_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_challenge_participants_challenges_ChallengeId",
                        column: x => x.ChallengeId,
                        principalTable: "challenges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_challenge_check_ins_ChallengeId_HabitLogId",
                table: "challenge_check_ins",
                columns: new[] { "ChallengeId", "HabitLogId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_challenge_check_ins_HabitLogId",
                table: "challenge_check_ins",
                column: "HabitLogId");

            migrationBuilder.CreateIndex(
                name: "IX_challenge_check_ins_UserId_CreatedAt",
                table: "challenge_check_ins",
                columns: new[] { "UserId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_challenge_participants_ChallengeId_UserId",
                table: "challenge_participants",
                columns: new[] { "ChallengeId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_challenge_participants_UserId_JoinedAt",
                table: "challenge_participants",
                columns: new[] { "UserId", "JoinedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_challenges_CreatedByUserId",
                table: "challenges",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_challenges_InviteCode",
                table: "challenges",
                column: "InviteCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_challenges_Visibility_StartAt_EndAt",
                table: "challenges",
                columns: new[] { "Visibility", "StartAt", "EndAt" });

            migrationBuilder.CreateIndex(
                name: "IX_share_cards_UserId_CreatedAt",
                table: "share_cards",
                columns: new[] { "UserId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "challenge_check_ins");

            migrationBuilder.DropTable(
                name: "challenge_participants");

            migrationBuilder.DropTable(
                name: "share_cards");

            migrationBuilder.DropTable(
                name: "challenges");
        }
    }
}
