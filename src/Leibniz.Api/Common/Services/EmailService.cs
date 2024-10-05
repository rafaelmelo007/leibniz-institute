using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;

namespace Leibniz.Api.Common.Services;
public class EmailService : IEmailService
{
    private readonly EmailConfiguration _configuration;

    public EmailService(IOptions<EmailConfiguration> configuration)
    {
        _configuration = configuration.Value;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var smtpClient = new SmtpClient(_configuration.Host, _configuration.Port);
        smtpClient.EnableSsl = _configuration.RequireSsl;
        smtpClient.Credentials = new NetworkCredential(_configuration.EmailFrom, _configuration.Password);
        var mailMessage = new MailMessage(_configuration.EmailFrom, to, subject, body);
        mailMessage.IsBodyHtml = true;
        await smtpClient.SendMailAsync(mailMessage);
    }
}