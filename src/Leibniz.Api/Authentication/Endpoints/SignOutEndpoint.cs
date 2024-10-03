﻿namespace Leibniz.Api.Authentication.Endpoints;
public class SignOutEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapDelete($"/sign-out", Handle)
        .Produces<IResult>()
        .WithSummary("Sign out logged user");

    // Handler
    public static async Task<IResult> Handle(
        CancellationToken cancellationToken)
    {
        return TypedResults.SignOut();
    }
}