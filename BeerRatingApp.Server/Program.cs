using Raven.Client.Documents;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddSwaggerGen();

// Configure RavenDB
var store = new DocumentStore
{
    Urls = new[] { "http://localhost:8080" },
    Database = "BeerRatingApp"
};
store.Initialize();
builder.Services.AddSingleton<IDocumentStore>(store);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseAuthorization();
app.MapControllers();

app.Run();