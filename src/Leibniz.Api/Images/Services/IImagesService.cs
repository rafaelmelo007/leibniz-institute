
namespace Leibniz.Api.Images.Services;
public interface IImagesService
{
    void SaveImage(string? filePath, EntityType type, long id);
    Task<string?> GetImageFilePathAsync(string fileName, int? Width = default, int? Height = default, CancellationToken cancellationToken = default);
    Task<bool> SaveImageAsync(string fileName, Stream stream, CancellationToken cancellationToken);
    Task<bool> RemoveImageAsync(string? fileName, CancellationToken cancellationToken);
}
