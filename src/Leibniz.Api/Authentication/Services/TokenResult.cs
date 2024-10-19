﻿namespace Leibniz.Api.Authentication.Services;
public record TokenResult
{
    public string TokenType { get; set; }
    public string AccessToken { get; set; }
    public int ExpiresIn { get; set; }
}
