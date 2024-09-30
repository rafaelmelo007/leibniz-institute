namespace Leibniz.Api.Theses.Endpoints;
public class UpdateThesisEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPut($"/update-thesis", Handle)
        .Produces<UpdateThesisResponse>()
        .WithSummary("Update an existing thesis in the database");

    // Request / Response
    public record UpdateThesisRequest(long ThesisId, string Name, string Content);
    public record UpdateThesisResponse(long ThesisId);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<UpdateThesisRequest> validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [FromBody] UpdateThesisRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var any = await database.Theses.AnyAsync(x => x.Name == request.Name && x.ThesisId != request.ThesisId, cancellationToken);
        if (any)
        {
            notifications.AddNotification($"Thesis '{request.Name}' already exists");
            return notifications.ToBadRequest();
        }

        var entry = await database.Theses.SingleAsync(x => x.ThesisId == request.ThesisId, cancellationToken);
        entry.Name = request.Name;
        entry.Content = request.Content;

        await database.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new UpdateThesisResponse(entry.ThesisId));
    }

    // Validations
    public class Validator : AbstractValidator<UpdateThesisRequest>
    {
        public Validator()
        {
            RuleFor(x => x.ThesisId)
                .GreaterThan(0);
            RuleFor(x => x.Name)
                .MinimumLength(3)
                .MaximumLength(255);
            RuleFor(x => x.Content)
                .MinimumLength(3);
        }
    }
}





