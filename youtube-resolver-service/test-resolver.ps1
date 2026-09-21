param(
  [Parameter(Mandatory=$true)][string]$ResolverUrl,
  [Parameter(Mandatory=$true)][string]$Secret,
  [Parameter(Mandatory=$true)][string]$YouTubeUrl
)

$base = $ResolverUrl.TrimEnd('/')
Write-Host "Health:" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$base/health"

$headers = @{ "X-Resolver-Secret" = $Secret }
Write-Host "`nResolve:" -ForegroundColor Cyan
$body = @{ url = $YouTubeUrl } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$base/resolve" -Headers $headers -ContentType "application/json" -Body $body | Format-List

Write-Host "`n1-byte stream probe:" -ForegroundColor Cyan
$encoded = [uri]::EscapeDataString($YouTubeUrl)
$response = Invoke-WebRequest -Method Get -Uri "$base/stream?probe=1&url=$encoded" -Headers $headers -MaximumRedirection 0
Write-Host "HTTP $($response.StatusCode)"
$response.Headers | Format-Table
