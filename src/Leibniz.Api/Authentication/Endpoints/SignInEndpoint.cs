using Microsoft.AspNetCore.Authentication;

namespace Leibniz.Api.Authentication.Endpoints;
public class SignInEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPost($"/sign-in", Handle)
        .AllowAnonymous()
        .Produces<IResult>()
        .WithSummary("Sign in an existing user of the system")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record LoginRequest(string Email, string Password);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<LoginRequest> validator,
        [FromServices] ITokenService tokenService,
        [FromServices] AcademyDbContext database,
        [FromServices] IDateTimeService dateTimeService,
        [FromServices] NotificationHandler notifications,
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var user = database.Users.FirstOrDefault(x => x.Email == request.Email);
        if (user is null)
        {
            notifications.AddNotification("E-mail or password are invalid.");
            return notifications.ToBadRequest();
        }

        if (!PasswordHasher.VerifyPassword(request.Password, user.PasswordHash, user.Salt))
        {
            notifications.AddNotification("E-mail or password are invalid.");
            return notifications.ToBadRequest();
        }

        var now = dateTimeService.NowUtc;
        var queryStringToken = Guid.NewGuid();
        await database.Users.Where(x => x.UserId == user.UserId)
            .ExecuteUpdateAsync(x => x.SetProperty(x2 => x2.QueryStringToken, queryStringToken)
            .SetProperty(x => x.UpdateDateUtc, now)
            .SetProperty(x => x.UpdatedBy, user.UserId));
        await database.SaveChangesAsync();

        var token = await tokenService.GenerateJwtTokenAsync(user, cancellationToken);

        return TypedResults.Ok(token);
    }

    // Validations
    public class Validator : AbstractValidator<LoginRequest>
    {
        public Validator()
        {
            RuleFor(x => x.Email)
                .EmailAddress()
                .NotEmpty();
            RuleFor(x => x.Password)
                .NotEmpty()
                .MinimumLength(5);
        }
    }
}
