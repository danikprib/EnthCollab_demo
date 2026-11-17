using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnthCollab.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddHazards : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Hazards",
                table: "Projects",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Hazards",
                table: "Projects");
        }
    }
}
