using Ecommerce.Application.Common.Interfaces;
using Microsoft.Extensions.Hosting;
using System.Net;

namespace Ecommerce.Infrastructure.Services
{
    public sealed class FileEmailTemplateRenderer : IEmailTemplateRenderer
    {
        private readonly string[] _templateRoots;

        public FileEmailTemplateRenderer(IHostEnvironment environment)
        {
            _templateRoots =
            [
                Path.Combine(environment.ContentRootPath, "EmailTemplates"),
                Path.Combine(environment.ContentRootPath, "..", "Ecommerce.Infrastructure", "EmailTemplates")
            ];
        }

        public async Task<string> RenderAsync(string templateName, IReadOnlyDictionary<string, string> values, CancellationToken cancellationToken = default)
        {
            var safeName = Path.GetFileName(templateName);
            var fileName = safeName.EndsWith(".html", StringComparison.OrdinalIgnoreCase) ? safeName : $"{safeName}.html";
            var path = _templateRoots
                .Select(root => Path.Combine(root, fileName))
                .FirstOrDefault(File.Exists)
                ?? throw new FileNotFoundException($"Email template '{fileName}' was not found.");
            var template = await File.ReadAllTextAsync(path, cancellationToken);

            foreach (var (key, value) in values)
            {
                template = template.Replace($"{{{{{key}}}}}", WebUtility.HtmlEncode(value), StringComparison.OrdinalIgnoreCase);
                template = template.Replace($"{{{{{key}:raw}}}}", value, StringComparison.OrdinalIgnoreCase);
            }

            return template;
        }
    }
}
