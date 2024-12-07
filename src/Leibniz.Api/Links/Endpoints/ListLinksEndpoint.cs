﻿namespace Leibniz.Api.Links.Endpoints;
public class ListLinksEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/list-links", Handle)
        .Produces<ResultSet<ListLinkRead>>()
        .WithSummary("List a set of links from database");

    // Request / Response
    public record ListLinksRequest(int Index, int Limit, string Query);
    public record ListLinkRead(long LinkId, string? Name, string? Content, string? Url, string ImageFileName);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [AsParameters] ListLinksRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var query = database.Links.AsQueryable();
        if (!string.IsNullOrEmpty(request.Query))
        {
            query = query.Where(x => x.Name.Contains(request.Query)
                || x.Content.Contains(request.Query)
                    || x.Url.Contains(request.Query));
        }

        var count = await query.CountAsync();
        var rows = await query.OrderByDescending(x => x.UpdateDateUtc ?? x.CreateDateUtc)
            .Skip(request.Index).Take(request.Limit).ToListAsync();

        var ids = rows.Select(x => x.LinkId).ToList();
        var images = database.Images
            .Where(x => x.EntityType == EntityType.Link && ids.Contains(x.EntityId))
            .ToDictionary(x => x.EntityId, x => x.ImageFileName);

        var links = rows.Select(x => new ListLinkRead
        (
            LinkId: x.LinkId,
            Name: x.Name,
            Content: x.Content,
            Url: x.Url,
            ImageFileName: images.ContainsKey(x.LinkId) ? images[x.LinkId] : default
        )).ToList();

        return TypedResults.Ok(
            new ResultSet<ListLinkRead>
            {
                Data = links,
                Index = request.Index,
                Count = rows.Count,
                Limit = request.Limit,
                Query = request.Query,
            });
    }

    // Validations
    public class Validator : AbstractValidator<ListLinksRequest>
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

