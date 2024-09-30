namespace Leibniz.Api.Theses.Endpoints;
public class AddThesisEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPost($"/create-thesis", Handle)
        .Produces<AddThesisResponse>()
        .WithSummary("Add a new thesis into the database");

    // Request / Response
    public record AddThesisRequest(int Type, string Name, string Content);
    public record AddThesisResponse(long ThesisId);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<AddThesisRequest> validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [FromBody] AddThesisRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var any = await database.Theses.AnyAsync(x => x.Name == request.Name, cancellationToken);
        if (any)
        {
            notifications.AddNotification($"Thesis '{request.Name}' already exists");
            return notifications.ToBadRequest();
        }

        var entry = new Thesis
        {
            Name = request.Name,
            Content = request.Content,
        };
        await database.Theses.AddAsync(entry, cancellationToken);
        await database.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new AddThesisResponse(entry.ThesisId));
    }

    // Validations
    public class Validator : AbstractValidator<AddThesisRequest>
    {
        public Validator()
        {
            RuleFor(x => x.Name)
                .MinimumLength(3)
                .MaximumLength(255);
            RuleFor(x => x.Content)
                .MinimumLength(3);
        }
    }
}



