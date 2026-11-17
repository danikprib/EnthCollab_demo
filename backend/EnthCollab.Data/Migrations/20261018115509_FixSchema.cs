using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnthCollab.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Password",
                table: "Users",
                newName: "PasswordHash");

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "Projects",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddCheckConstraint(
                name: "CK_Ticket_Difficulty",
                table: "Tickets",
                sql: "\"Difficulty\" IN ('Easy','Medium','Hard','Advanced')");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Ticket_Status",
                table: "Tickets",
                sql: "\"Status\" IN ('Open','Taken','Done')");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_CreatedByUserId",
                table: "Projects",
                column: "CreatedByUserId");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Project_Status",
                table: "Projects",
                sql: "\"Status\" IN ('WIP','Finished','Cancelled','Frozen')");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Project_Visibility",
                table: "Projects",
                sql: "\"Visibility\" IN ('Public','Private')");

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_Users_CreatedByUserId",
                table: "Projects",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Projects_Users_CreatedByUserId",
                table: "Projects");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Ticket_Difficulty",
                table: "Tickets");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Ticket_Status",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_Projects_CreatedByUserId",
                table: "Projects");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Project_Status",
                table: "Projects");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Project_Visibility",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Projects");

            migrationBuilder.RenameColumn(
                name: "PasswordHash",
                table: "Users",
                newName: "Password");
        }
    }
}
