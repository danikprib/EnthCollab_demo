
namespace EnthCollab.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // ----- Add services to the container BEGIN -----
            builder.Services.AddControllers();
            builder.Services.AddOpenApi();

            // Add CORS policy
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("Angular", policy =>
                {
                    policy.WithOrigins("http://localhost:4200")
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });
            // ----- Add services to the container END -----

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();

            app.UseCors("Angular");

            app.UseAuthorization();
            app.MapControllers();
            app.Run();
        }
    }
}
