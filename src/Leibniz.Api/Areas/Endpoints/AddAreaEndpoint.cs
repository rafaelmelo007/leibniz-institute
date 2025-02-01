namespace Leibniz.Api.Areas.Endpoints;
public class AddAreaEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPost($"/create-area", Handle)
        .Produces<AddAreaResponse>()
        .Produces<BadRequestObjectResult>(StatusCodes.Status400BadRequest)
        .WithSummary("Add a new area into the database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record AddAreaRequest(int Type, string Name, string Content);
    public record AddAreaResponse(long AreaId);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<AddAreaRequest> validator,
        [FromServices] AcademyDbContext database,
        [FromServices] NotificationHandler notifications,
        [FromBody] AddAreaRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var any = await database.Areas.AnyAsync(x => x.Name == request.Name, cancellationToken);
        if (any)
        {
            notifications.AddNotification($"Area '{request.Name}' already exists");
            return notifications.ToBadRequest();
        }

        var entry = new Area
        {
            Name = request.Name,
            Content = request.Content,
        };
        await database.Areas.AddAsync(entry, cancellationToken);
        await database.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new AddAreaResponse(entry.AreaId));
    }

    // Validations
    public class Validator : AbstractValidator<AddAreaRequest>
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



