using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EnthCollab.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixTags : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Tags",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "Tags",
                table: "Projects");

            migrationBuilder.AlterColumn<string>(
                name: "Visibility",
                table: "Projects",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.CreateTable(
                name: "Tag",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tag", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProjectTag",
                columns: table => new
                {
                    ProjectsId = table.Column<int>(type: "integer", nullable: false),
                    TagsId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectTag", x => new { x.ProjectsId, x.TagsId });
                    table.ForeignKey(
                        name: "FK_ProjectTag_Projects_ProjectsId",
                        column: x => x.ProjectsId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectTag_Tag_TagsId",
                        column: x => x.TagsId,
                        principalTable: "Tag",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TagTicket",
                columns: table => new
                {
                    TagsId = table.Column<int>(type: "integer", nullable: false),
                    TicketsId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TagTicket", x => new { x.TagsId, x.TicketsId });
                    table.ForeignKey(
                        name: "FK_TagTicket_Tag_TagsId",
                        column: x => x.TagsId,
                        principalTable: "Tag",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TagTicket_Tickets_TicketsId",
                        column: x => x.TicketsId,
                        principalTable: "Tickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTag_TagsId",
                table: "ProjectTag",
                column: "TagsId");

            migrationBuilder.CreateIndex(
                name: "IX_TagTicket_TicketsId",
                table: "TagTicket",
                column: "TicketsId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProjectTag");

            migrationBuilder.DropTable(
                name: "TagTicket");

            migrationBuilder.DropTable(
                name: "Tag");

            migrationBuilder.AddColumn<int[]>(
                name: "Tags",
                table: "Tickets",
                type: "integer[]",
                nullable: false,
                defaultValue: new int[0]);

            migrationBuilder.AlterColumn<int>(
                name: "Visibility",
                table: "Projects",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<int[]>(
                name: "Tags",
                table: "Projects",
                type: "integer[]",
                nullable: false,
                defaultValue: new int[0]);
        }
    }
}
