namespace Leibniz.Api.Users.Endpoints;
public class ForgotPasswordSendMailEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPost($"/forgot-password", Handle)
        .AllowAnonymous()
        .Produces<IResult>()
        .WithSummary("Trigger the workflow to reset the user password")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record ForgotPasswordRequest(string Email);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<ForgotPasswordRequest> validator,
        [FromServices] AcademyDbContext database,
        [FromServices] IDateTimeService dateTimeService,
        [FromServices] NotificationHandler notifications,
        [FromServices] IEmailService emailService,
        HttpContext httpContext,
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

        var referrerUrl = httpContext.Request.Headers["Referer"].ToString();

        await SendEmailToResetPasswordAsync(user.Email, referrerUrl,
            forgotPassword.ChangePasswordToken, emailService, cancellationToken);

        return TypedResults.Ok(new { success = true });
    }

    private static async Task<bool> SendEmailToResetPasswordAsync(
        string email, string referrerUrl, Guid changePasswordToken,
        IEmailService emailService, CancellationToken cancellationToken)
    {
        string subject = "Reset Your Password";
        string body = $@"
            <html>
            <body>
                <h1>Password Reset Request</h1>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href='{referrerUrl}/pages/account/reset-password?changePasswordToken={changePasswordToken}'>Reset Password</a>
                <p>This link will expire in 4 hours.</p>
            </body>
            </html>
        ";

        await emailService.SendEmailAsync(email, subject, body);

        return true;
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
