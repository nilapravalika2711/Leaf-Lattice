using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InteriorDesign.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerEnquiriesAndPurchaseRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CustomerEnquiries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CustomerId = table.Column<int>(type: "INTEGER", nullable: false),
                    CustomerName = table.Column<string>(type: "TEXT", nullable: false),
                    CustomerEmail = table.Column<string>(type: "TEXT", nullable: false),
                    PhoneNumber = table.Column<string>(type: "TEXT", nullable: false),
                    DesignId = table.Column<int>(type: "INTEGER", nullable: false),
                    EnquiryType = table.Column<string>(type: "TEXT", nullable: false),
                    Message = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    AdminResponse = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerEnquiries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomerEnquiries_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CustomerEnquiries_Designs_DesignId",
                        column: x => x.DesignId,
                        principalTable: "Designs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PurchaseRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CustomerId = table.Column<int>(type: "INTEGER", nullable: false),
                    CustomerName = table.Column<string>(type: "TEXT", nullable: false),
                    CustomerEmail = table.Column<string>(type: "TEXT", nullable: false),
                    PhoneNumber = table.Column<string>(type: "TEXT", nullable: false),
                    DesignId = table.Column<int>(type: "INTEGER", nullable: false),
                    DesignPrice = table.Column<decimal>(type: "TEXT", precision: 12, scale: 2, nullable: false),
                    DeliveryAddress = table.Column<string>(type: "TEXT", nullable: false),
                    AdditionalRequirements = table.Column<string>(type: "TEXT", nullable: true),
                    PreferredContactMethod = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    AdminResponse = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PurchaseRequests_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PurchaseRequests_Designs_DesignId",
                        column: x => x.DesignId,
                        principalTable: "Designs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerEnquiries_CustomerId",
                table: "CustomerEnquiries",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerEnquiries_DesignId",
                table: "CustomerEnquiries",
                column: "DesignId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequests_CustomerId",
                table: "PurchaseRequests",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequests_DesignId",
                table: "PurchaseRequests",
                column: "DesignId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CustomerEnquiries");

            migrationBuilder.DropTable(
                name: "PurchaseRequests");
        }
    }
}
