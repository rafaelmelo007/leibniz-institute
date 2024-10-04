namespace Leibniz.Api.Authentication.Endpoints;
public class ForgotPasswordSendMailEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPost($"/forgot-password", Handle)
        .AllowAnonymous()
        .Produces<IResult>()
        .WithSummary("Trigger the workflow to reset the user password");

    // Request / Response
    public record ForgotPasswordRequest(string Email);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<ForgotPasswordRequest> validator,
        [FromServices] AcademyDbContext database,
        [FromServices] IDateTimeService dateTimeService,
        [FromServices] NotificationHandler notifications,
        [FromBody] ForgotPasswordRequest request,
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
            notifications.AddNotification("E-mail not found.");
            return notifications.ToBadRequest();
        }

        var forgotPassword = new ForgotPassword();
        forgotPassword.UserId = user.UserId;
        forgotPassword.ChangePasswordToken = Guid.NewGuid();
        forgotPassword.ValidUntil = dateTimeService.NowUtc.AddHours(4);
        await database.ForgotPasswords.AddAsync(forgotPassword, cancellationToken);
        await database.SaveChangesAsync(cancellationToken);

        await SendEmailToResetPasswordAsync(forgotPassword.ChangePasswordToken, cancellationToken);

        return TypedResults.Ok(new { success = true });
    }

    private static Task<bool> SendEmailToResetPasswordAsync(Guid changePasswordToken, CancellationToken cancellationToken)
    {
        // TODO: Create the routine to send the e-mail
        return Task.FromResult(true);
    }

    // Validations
    public class Validator : AbstractValidator<ForgotPasswordRequest>
    {
        public Validator()
        {
            RuleFor(x => x.Email)
                .EmailAddress()
                .NotEmpty();
        }
    }
}
