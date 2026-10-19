using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;

const string SourceDir = @"D:\2026\projects\ecommerce\apps\backend\Ecommerce\Ecommerce.WebAPI\wwwroot\uploads\products";
const string SupabaseUrl = "https://nwwsveiehdmsgwgujalu.supabase.co";
const string BucketName = "ecommerce-images";
const string ServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53d3N2ZWllaGRtc2d3Z3VqYWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY0OTYyMywiZXhwIjoyMDkxMjI1NjIzfQ.bt-DaxNLqAhB8qJt3awJ9_tmMs3Iq914jSh9UNdyKOw";

var files = Directory.GetFiles(SourceDir, "*.*", SearchOption.AllDirectories);
Console.WriteLine($"Found {files.Length} files to sync.");

using var client = new HttpClient();
client.DefaultRequestHeaders.Add("apikey", ServiceRoleKey);
client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ServiceRoleKey);

int success = 0;
int fail = 0;
int counter = 0;

await Parallel.ForEachAsync(files, new ParallelOptions { MaxDegreeOfParallelism = 8 }, async (filePath, ct) =>
{
    var rel = Path.GetRelativePath(SourceDir, filePath).Replace('\\', '/');
    var remotePath = $"products/{rel}";
    var uploadUrl = $"{SupabaseUrl}/storage/v1/object/{BucketName}/{remotePath}";

    bool uploaded = false;
    for (int retry = 0; retry < 3 && !uploaded; retry++)
    {
        try
        {
            var bytes = await File.ReadAllBytesAsync(filePath, ct);
            using var content = new ByteArrayContent(bytes);
            content.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
            content.Headers.Add("x-upsert", "true");

            using var resp = await client.PostAsync(uploadUrl, content, ct);
            if (resp.IsSuccessStatusCode)
            {
                uploaded = true;
                var current = Interlocked.Increment(ref counter);
                Interlocked.Increment(ref success);
                Console.WriteLine($"[{current}/{files.Length}] OK: {remotePath} ({bytes.Length / 1024} KB)");
            }
            else
            {
                var err = await resp.Content.ReadAsStringAsync(ct);
                if (retry == 2)
                {
                    var current = Interlocked.Increment(ref counter);
                    Interlocked.Increment(ref fail);
                    Console.WriteLine($"[{current}/{files.Length}] FAIL: {remotePath} - {resp.StatusCode}: {err}");
                }
                else
                {
                    await Task.Delay(500, ct);
                }
            }
        }
        catch (Exception ex)
        {
            if (retry == 2)
            {
                var current = Interlocked.Increment(ref counter);
                Interlocked.Increment(ref fail);
                Console.WriteLine($"[{current}/{files.Length}] ERROR: {remotePath} - {ex.Message}");
            }
            else
            {
                await Task.Delay(500, ct);
            }
        }
    }
});

Console.WriteLine($"\n==========================================");
Console.WriteLine($"FINISHED: {success} succeeded, {fail} failed.");
