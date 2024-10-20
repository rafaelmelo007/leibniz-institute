namespace Leibniz.Api.Periods.Endpoints;
public class GetPeriodsEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-periods", Handle)
        .Produces<GetPeriodsResponse>()
        .WithSummary("Retrieve a set of periods from database");

    // Request / Response
    public record GetPeriodsRequest(int Index, int Limit, string Query);
    public record GetPeriodsResponse(IEnumerable<PeriodRead> Data, int Index, int Limit, int Count);
    public record PeriodRead(long PeriodId, string? Name, string? Content, string ImageFileName, short? BeginYear, short? EndYear);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [AsParameters] GetPeriodsRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var query = database.Periods.AsQueryable();
        if (!string.IsNullOrEmpty(request.Query))
        {
            query = query.Where(x => x.Name.Contains(request.Query) || x.Content.Contains(request.Query));
        }

        var count = await query.CountAsync();
        var rows = await query.OrderByDescending(x => x.UpdateDateUtc ?? x.CreateDateUtc).Skip(request.Index).Take(request.Limit).ToListAsync();

        var ids = rows.Select(x => x.PeriodId).ToList();
        var images = database.Images.Where(x => x.EntityType == EntityType.Period && ids.Contains(x.EntityId)).ToDictionary(x => x.EntityId, x => x.ImageFileName);
        var periods = rows.Select(x => new PeriodRead
        (
            PeriodId: x.PeriodId,
            Name: x.Name,
            Content: x.Content,
            BeginYear: x.BeginYear,
            EndYear: x.EndYear,
            ImageFileName: images.ContainsKey(x.PeriodId) ? images[x.PeriodId] : default
        ));
        return TypedResults.Ok(new GetPeriodsResponse(periods, request.Index, request.Limit, count));
    }

    // Validations
    public class Validator : AbstractValidator<GetPeriodsRequest>
    {
        public Validator()
        {
            RuleFor(x => x.Index)
                .GreaterThanOrEqualTo(0);
            RuleFor(x => x.Limit)
                .GreaterThan(0)
                .LessThan(500);
        }
    }
}


