namespace Leibniz.Api.Nodes.Endpoints;
public class UpdateChartEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPut($"/update-chart", Handle)
        .Produces<UpdateChartResponse>()
        .WithSummary("Update node chart in the database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record UpdateChartRequest(long NodeId, string ChartData);
    public record UpdateChartResponse(bool Success);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<UpdateChartRequest> validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [FromBody] UpdateChartRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        await database.Nodes.Where(x => x.NodeId == request.NodeId)
            .ExecuteUpdateAsync(x => x.SetProperty(y => y.ChartData, request.ChartData));
        await database.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new UpdateChartResponse(true));
    }

    // Validations
    public class Validator : AbstractValidator<UpdateChartRequest>
    {
        public Validator()
        {
            RuleFor(x => x.ChartData)
                .MinimumLength(3);
        }
    }
}




