using Leibniz.Api.Nodes.Domain;

namespace Leibniz.Api.Nodes.Endpoints;
public class GetOrAddNodeEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPost($"/get-or-add-node", Handle)
        .Produces<GetOrAddNodeResponse>()
        .WithSummary("Get or add a node into the database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record GetOrAddNodeRequest(long NodeId, string Name, long? ParentNodeId);
    public record GetOrAddNodeResponse(long NodeId, string Name, long? ParentNodeId, string ChartData);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<GetOrAddNodeRequest> validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [FromBody] GetOrAddNodeRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var found = await database.Nodes.SingleOrDefaultAsync(x => x.NodeId == request.NodeId ||
        (request.ParentNodeId == null && x.ParentNodeId == null && request.Name == x.Name),
        cancellationToken);
        if (found is null)
        {
            found = new Node
            {
                Name = request.Name,
                ParentNodeId = request.ParentNodeId
            };
            await database.Nodes.AddAsync(found, cancellationToken);
            await database.SaveChangesAsync(cancellationToken);
        }

        return TypedResults.Ok(new GetOrAddNodeResponse(found.NodeId, found.Name, found.ParentNodeId, found.ChartData));
    }

    // Validations
    public class Validator : AbstractValidator<GetOrAddNodeRequest>
    {
        public Validator()
        {
            RuleFor(x => x.Name)
                .MinimumLength(3)
                .MaximumLength(255);
        }
    }
}




