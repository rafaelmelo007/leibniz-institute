using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.BearerToken;

namespace Leibniz.Api.Authentication.Endpoints;
public class RegisterEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPost($"/register", Handle)
        .AllowAnonymous()
        .Produces<IResult>()
        .WithSummary("Register a new user in the system")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record RegisterRequest(string FullName, string Cpf, string City, string State,
        string Phone, string Website, string Email, string Password, bool AcceptedTermsAndConditions);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<RegisterRequest> validator,
        [FromBody] RegisterRequest request,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var anyUser = await database.Users.AnyAsync();
        var user = database.Users.FirstOrDefault(x => x.Email == request.Email);
        if (user is not null)
        {
            notifications.AddNotification($"User '{request.Email}' already exists");
            return notifications.ToBadRequest();
        }

        var (passwordHash, salt) = PasswordHasher.HashPassword(request.Password);

        user = new User
        {
            FullName = request.FullName,
            Cpf = request.Cpf,
            City = request.City,
            State = request.State,
            Phone = request.Phone,
            Website = request.Website,
            Email = request.Email,
            PasswordHash = passwordHash,
            Salt = salt,
            AcceptedTermsAndConditions = request.AcceptedTermsAndConditions,
            Role = !anyUser ? UserRoles.Administrator : UserRoles.Contributor,
        };

        await database.Users.AddAsync(user, cancellationToken);
        await database.SaveChangesAsync(cancellationToken);


        var claimsPrincipal = new ClaimsPrincipal(
          new ClaimsIdentity(
            new[]
            {
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Sid, user.Cpf),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.PrimarySid, user.UserId.ToString()),
            },
            BearerTokenDefaults.AuthenticationScheme
          )
        );


        var authProperties = new AuthenticationProperties
        {
            ExpiresUtc = DateTimeOffset.UtcNow.AddHours(4), // Set the token to expire in 4 hours
            IsPersistent = true,
        };

        return TypedResults.SignIn(claimsPrincipal, authProperties);
    }

    // Validations
    public class Validator : AbstractValidator<RegisterRequest>
    {
        public Validator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty();
            RuleFor(x => x.Cpf)
                .NotEmpty();
            RuleFor(x => x.City)
                .NotEmpty();
            RuleFor(x => x.State)
                .NotEmpty();
            RuleFor(x => x.Phone)
                .NotEmpty();
            RuleFor(x => x.Email)
                .EmailAddress()
                .NotEmpty();
            RuleFor(x => x.Password)
                .NotEmpty()
                .MinimumLength(5);
            RuleFor(x => x.AcceptedTermsAndConditions)
                .NotEmpty()
                .NotEqual(false);
        }
    }
}
