namespace Leibniz.Api.Users.Endpoints;
public class ForgotPasswordResetEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPut($"/forgot-password", Handle)
        .AllowAnonymous()
        .Produces<IResult>()
        .WithSummary("Reset user password based on reset password token")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record ForgotPasswordResetRequest(Guid ChangePasswordToken, string NewPassword, string ConfirmNewPassword);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<ForgotPasswordResetRequest> validator,
        [FromServices] AcademyDbContext database,
        [FromServices] IDateTimeService dateTimeService,
        [FromServices] NotificationHandler notifications,
        [FromBody] ForgotPasswordResetRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var now = dateTimeService.NowUtc;
        var forgotPassword = database.ForgotPasswords.FirstOrDefault(x => x.ChangePasswordToken == request.ChangePasswordToken && x.ValidUntil >= now);
        if (forgotPassword is null)
        {
            notifications.AddNotification("Forgot password token expired or not found");
            return notifications.ToBadRequest();
        }

        var user = database.Users.FirstOrDefault(x => x.UserId == forgotPassword.UserId);
        var (passwordHash, salt) = PasswordHasher.HashPassword(request.NewPassword);

        await database.Users.Where(x => x.UserId == user.UserId)
            .ExecuteUpdateAsync(x =>
                x.SetProperty(x2 => x2.PasswordHash, passwordHash)
                .SetProperty(x => x.Salt, salt));

        await database.ForgotPasswords.Where(x => x.ForgotPasswordId == forgotPassword.ForgotPasswordId)
            .ExecuteUpdateAsync(x =>
                x.SetProperty(x2 => x2.PasswordChangeDate, now));

        await database.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new { success = true });
    }

    // Validations
    public class Validator : AbstractValidator<ForgotPasswordResetRequest>
    {
        public Validator()
        {
            RuleFor(x => x.ChangePasswordToken)
                .NotEmpty();
            RuleFor(x => x.NewPassword)
                .NotEmpty()
                .MinimumLength(5);
            RuleFor(x => x.ConfirmNewPassword)
                .NotEmpty()
                .Equal(x => x.NewPassword).WithMessage("New password and confirm password must match.");
        }
    }
}
