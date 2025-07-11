namespace Leibniz.Api.Nodes.Endpoints;
public class DeleteNodeBranchEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapDelete($"/delete-node-branch", Handle)
        .Produces<bool>()
        .WithSummary("Update node chart in the database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record DeleteNodeBranchRequest(long NodeId);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<DeleteNodeBranchRequest> validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [AsParameters] DeleteNodeBranchRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        await database.Nodes.Where(x => x.NodeId == request.NodeId)
            .ExecuteDeleteAsync(cancellationToken);
        await database.Database.ExecuteSqlRawAsync("DELETE FROM Nodes WHERE ParentNodeId IS NOT NULL AND ParentNodeId NOT IN (SELECT NodeId FROM Nodes WITH (NOLOCK))");
        await database.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(true);
    }

    // Validations
    public class Validator : AbstractValidator<DeleteNodeBranchRequest>
    {
        public Validator()
        {
            RuleFor(x => x.NodeId)
                .GreaterThan(0);
        }
    }
}




