using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RairCore.Controllers;

// Image upload/delete will talk to Cloudinary instead of S3.
// For now these are stubs — we wire Cloudinary in the next step.
[ApiController]
[Authorize]
public class ImagesController : ControllerBase
{
    // POST /image — receives base64 file, uploads to Cloudinary, returns public URL
    [HttpPost("image")]
    public async Task<IActionResult> Upload([FromBody] ImageUploadRequest request)
    {
        // TODO: integrate Cloudinary SDK
        await Task.CompletedTask;
        return Ok(new { imageUrl = "https://placeholder.com/image.jpg" });
    }

    // DELETE /image?imageUrl=https://...
    [HttpDelete("image")]
    public async Task<IActionResult> Delete([FromQuery] string imageUrl)
    {
        // TODO: extract Cloudinary public_id from URL and delete
        await Task.CompletedTask;
        return Ok(new { message = "Image deleted" });
    }
}

// In C#, small data shapes for request bodies are often "records" — immutable, lightweight.
// This is like a TypeScript type for the incoming JSON body.
public record ImageUploadRequest(string FileData, string FileType);
