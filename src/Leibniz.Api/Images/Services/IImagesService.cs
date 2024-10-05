namespace Leibniz.Api.Images.Services;
public interface IImagesService
{
    void SaveImage(string? filePath, EntityType type, long id);
    Task<string?> GetImageFilePathAsync(string fileName, int? Width = default, int? Height = default, CancellationToken cancellationToken = default);
}
