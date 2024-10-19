using dotenv.net;
using Microsoft.OpenApi.Models;
using Leibniz.Api.Authors;
using Leibniz.Api.Books;
using Leibniz.Api.Links;
using Leibniz.Api.Periods;
using Leibniz.Api.Posts;
using Leibniz.Api.Theses;
using Leibniz.Api.Topics;
using Leibniz.Api.Authentication;
using Leibniz.Api.Import;
using Leibniz.Api.Areas;
using Leibniz.Api.Images;
using Leibniz.Api.Relationships;
using System.Text;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
DotEnv.Load(options: new DotEnvOptions(probeForEnv: true, probeLevelsToSearch: 6));
builder.Configuration.AddEnvironmentVariables();
builder.Services.AddTransient<IDateTimeService, DateTimeService>();
builder.Services.AddTransient<Leibniz.Api.Common.Services.ILogger, SerilogLogger>();
builder.Services.AddTransient<ICurrentUserService, CurrentUserService>();
builder.Services.AddTransient<IHttpContextAccessor, HttpContextAccessor>();
builder.Services.AddTransient<IDapperConnectionFactory, DapperConnectionFactory>();
builder.Services.AddTransient<IRelationshipService, RelationshipService>();
builder.Services.AddTransient<IImagesService, ImagesService>();
builder.Services.AddTransient<IEmailService, EmailService>();
builder.Services.AddTransient<ITokenService, TokenService>();
builder.Services.AddScoped<NotificationHandler>();

var emailConfiguration = builder.Configuration.GetSection(nameof(EmailConfiguration)).Get<EmailConfiguration>();
builder.Services.Configure<EmailConfiguration>(builder.Configuration.GetSection(nameof(EmailConfiguration)));

var imageConfiguration = builder.Configuration.GetSection(nameof(Leibniz.Api.Images.ImageConfiguration)).Get<Leibniz.Api.Images.ImageConfiguration>();
builder.Services.Configure<Leibniz.Api.Images.ImageConfiguration>(builder.Configuration.GetSection(nameof(Leibniz.Api.Images.ImageConfiguration)));

var authenticationConfiguration = builder.Configuration.GetSection(nameof(AuthenticationConfiguration)).Get<AuthenticationConfiguration>();
builder.Services.Configure<AuthenticationConfiguration>(builder.Configuration.GetSection(nameof(AuthenticationConfiguration)));

builder.Services.AddPersistence(builder.Configuration, false);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddDatabaseDeveloperPageExceptionFilter();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Leibniz Api", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
});

builder.Services.AddAuthentication()
    .AddJwtBearer(options =>
{
    var signingKey = authenticationConfiguration.SigningKey;
    var keyBytes = Encoding.ASCII.GetBytes(signingKey);
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});
builder.Services.AddAuthorization();
builder.Services.AddCors();

builder.Services.AddValidatorsFromAssemblyContaining<Program>();

var app = builder.Build();

app.MapGroup("/")
    .WithTags("Health Check")
    .MapGet("/health-check",
    () => new { message = "OK" })
    .WithSummary("Check if the api is up and running");

app.MapAuthenticationEndpoints();
app.MapImportEndpoints();
app.MapPeriodsEndpoints();
app.MapPostEndpoints();
app.MapLinkEndpoints();
app.MapBookEndpoints();
app.MapThesesEndpoints();
app.MapAuthorsEndpoints();
app.MapTopicsEndpoints();
app.MapAreasEndpoints();
app.MapRelationshipsEndpoints();
app.MapImageEndpoints();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors(builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader()
               .WithExposedHeaders("Access-Control-Allow-Origin", "Accept");
    });
}
app.Run();


