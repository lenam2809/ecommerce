param(
    [string]$SourceDir = "D:\2026\projects\ecommerce\apps\backend\Ecommerce\Ecommerce.WebAPI\wwwroot\uploads\products",
    [string]$SupabaseUrl = "https://nwwsveiehdmsgwgujalu.supabase.co",
    [string]$BucketName = "ecommerce-images",
    [string]$ServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53d3N2ZWllaGRtc2d3Z3VqYWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY0OTYyMywiZXhwIjoyMDkxMjI1NjIzfQ.bt-DaxNLqAhB8qJt3awJ9_tmMs3Iq914jSh9UNdyKOw"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $SourceDir)) {
    Write-Error "Source directory not found: $SourceDir"
    exit 1
}

$files = Get-ChildItem -File -Recurse $SourceDir
Write-Host "Found $($files.Count) image files to sync." -ForegroundColor Cyan

$successCount = 0
$failCount = 0
$index = 0

foreach ($file in $files) {
    $index++
    $rel = $file.FullName.Substring($SourceDir.Length).TrimStart('\', '/')
    $remotePath = "products/" + $rel.Replace('\', '/')
    $uploadUrl = "$SupabaseUrl/storage/v1/object/$BucketName/$remotePath"

    $mime = "image/jpeg"
    if ($file.Extension -ieq ".png") { $mime = "image/png" }
    elseif ($file.Extension -ieq ".webp") { $mime = "image/webp" }

    $headers = @{
        "apikey" = $ServiceRoleKey
        "Authorization" = "Bearer $ServiceRoleKey"
        "Content-Type" = $mime
        "x-upsert" = "true"
    }

    try {
        $fileBytes = [System.IO.File]::ReadAllBytes($file.FullName)
        $null = Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers $headers -Body $fileBytes -TimeoutSec 30
        $successCount++
        Write-Host "[$index/$($files.Count)] OK: $remotePath ($([math]::Round($file.Length/1KB, 1)) KB)" -ForegroundColor Green
    }
    catch {
        $failCount++
        Write-Host "[$index/$($files.Count)] FAILED: $remotePath - $_" -ForegroundColor Red
    }
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Sync Complete: $successCount succeeded, $failCount failed." -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Yellow" })
