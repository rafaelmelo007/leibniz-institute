using System.Linq.Expressions;

namespace Leibniz.Api.Theses.Endpoints;
public class GetThesesEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-theses", Handle)
        .Produces<GetThesesResponse>()
        .WithSummary("Retrieve a set of theses from database");

    // Request / Response
    public record GetThesesRequest(int Index, int Limit, string? Query);
    public record GetThesesResponse(IEnumerable<ThesisRead> Data, int Index, int Limit, int Count);
    public record ThesisRead(long ThesisId, string? Name, string? Content, string ImageFileName);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [AsParameters] GetThesesRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        Expression<Func<Thesis, bool>> where = x => string.IsNullOrEmpty(request.Query) || x.Name.Contains(request.Query) || x.Content.Contains(request.Query);
        var count = await database.Theses.Where(where).CountAsync();
        var rows = await database.Theses.Where(where).OrderByDescending(x => x.UpdateDateUtc ?? x.CreateDateUtc).Skip(request.Index).Take(request.Limit).ToListAsync();

        var ids = rows.Select(x => x.ThesisId).ToList();
        var images = database.Images.Where(x => x.EntityType == EntityType.Thesis && ids.Contains(x.EntityId)).ToDictionary(x => x.EntityId, x => x.ImageFileName);
        var theses = rows.Select(x => new ThesisRead
        (
            ThesisId: x.ThesisId,
            Name: x.Name,
            Content: x.Content,
            ImageFileName: images.ContainsKey(x.ThesisId) ? images[x.ThesisId] : default
        ));
        return TypedResults.Ok(new GetThesesResponse(theses, request.Index, request.Limit, count));
    }

    // Validations
    public class Validator : AbstractValidator<GetThesesRequest>
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


