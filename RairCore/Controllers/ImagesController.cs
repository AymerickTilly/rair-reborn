using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RairCore.Controllers;

[ApiController]
[Authorize]
public class ImagesController(Cloudinary cloudinary) : ControllerBase
{
    // POST /image
    // Receives a base64 image string (same format your old Lambda expected),
    // uploads it to Cloudinary, and returns the public URL.
    [HttpPost("image")]
    public async Task<IActionResult> Upload([FromBody] ImageUploadRequest request)
    {
        // Strip the base64 prefix if present (e.g. "data:image/png;base64,...")
        // then convert to a byte stream Cloudinary can read
        var base64Data = request.FileData.Contains(',')
            ? request.FileData.Split(',')[1]
            : request.FileData;

        var bytes = Convert.FromBase64String(base64Data);
        using var stream = new MemoryStream(bytes);

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription("upload", stream),
            Folder = "rair-products",   // organises uploads in Cloudinary dashboard
            UseFilename = false,
            UniqueFilename = true,
        };

        var result = await cloudinary.UploadAsync(uploadParams);

        if (result.Error is not null)
            return BadRequest(new { error = result.Error.Message });

        // Return the same shape your frontend already expects: { imageUrl: "..." }
        return Ok(new { imageUrl = result.SecureUrl.ToString() });
    }

    // DELETE /image?imageUrl=https://res.cloudinary.com/...
    // Extracts the Cloudinary public_id from the URL and deletes the asset.
    [HttpDelete("image")]
    public async Task<IActionResult> Delete([FromQuery] string imageUrl)
    {
        // Cloudinary public_id is the path segment after /upload/vXXXXX/
        // e.g. https://res.cloudinary.com/de9lwzbql/image/upload/v123/rair-products/abc.jpg
        //      → public_id = "rair-products/abc"
        var uri = new Uri(imageUrl);
        var segments = uri.AbsolutePath.Split('/');
        var uploadIndex = Array.IndexOf(segments, "upload");

        if (uploadIndex < 0)
            return BadRequest(new { error = "Invalid Cloudinary URL" });

        // Skip "upload" and the version segment (v1234567), join the rest, remove extension
        var publicIdWithExt = string.Join("/", segments[(uploadIndex + 2)..]);
        var publicId = Path.GetFileNameWithoutExtension(publicIdWithExt);
        var folder = Path.GetDirectoryName(publicIdWithExt)?.Replace('\\', '/');
        var fullPublicId = string.IsNullOrEmpty(folder) ? publicId : $"{folder}/{publicId}";

        var deleteParams = new DeletionParams(fullPublicId);
        var result = await cloudinary.DestroyAsync(deleteParams);

        if (result.Error is not null)
            return BadRequest(new { error = result.Error.Message });

        return Ok(new { message = "Image deleted", result = result.Result });
    }
}

public record ImageUploadRequest(string FileData, string FileType);
