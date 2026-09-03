# LLM FARM – eingebettete Hauptgrafiken aus assets\ neu erzeugen.
# Szenenbilder werden platzsparend als JPEG eingebettet; freigestellte Posen bleiben PNG.
$ErrorActionPreference = "Stop"

$dev = $PSScriptRoot
$proj = Split-Path $dev -Parent
$assets = Join-Path $proj "assets"
$target = Join-Path $dev "assets_embed.js"

Add-Type -AssemblyName System.Drawing

function Convert-ToJpegBase64([string]$path, [long]$quality = 88) {
  $source = [System.Drawing.Image]::FromFile($path)
  try {
    $bitmap = New-Object System.Drawing.Bitmap($source.Width, $source.Height)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.Clear([System.Drawing.Color]::White)
        $graphics.DrawImage($source, 0, 0, $source.Width, $source.Height)
      } finally { $graphics.Dispose() }

      $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
        Where-Object MimeType -eq "image/jpeg" |
        Select-Object -First 1
      $parameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
      $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
        [System.Drawing.Imaging.Encoder]::Quality, $quality)
      $stream = New-Object System.IO.MemoryStream
      try {
        $bitmap.Save($stream, $codec, $parameters)
        return [Convert]::ToBase64String($stream.ToArray())
      } finally {
        $stream.Dispose()
        $parameters.Dispose()
      }
    } finally { $bitmap.Dispose() }
  } finally { $source.Dispose() }
}

$entries = New-Object System.Collections.Generic.List[string]

Get-ChildItem -LiteralPath $assets -File -Filter "*.png" |
  Sort-Object Name |
  ForEach-Object {
    $key = $_.BaseName
    $base64 = Convert-ToJpegBase64 $_.FullName
    $entries.Add(('  "{0}":"data:image/jpeg;base64,{1}"' -f $key, $base64))
  }

Get-ChildItem -LiteralPath (Join-Path $assets "posen") -File -Filter "*.png" |
  Sort-Object Name |
  ForEach-Object {
    $key = if ($_.BaseName.StartsWith("sattel_")) { $_.BaseName } else { "pose_" + $_.BaseName }
    $base64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($_.FullName))
    $entries.Add(('  "{0}":"data:image/png;base64,{1}"' -f $key, $base64))
  }

$output = "const ASSETS={`n" + ($entries -join ",`n") + "`n};`n"
[IO.File]::WriteAllText($target, $output, (New-Object Text.UTF8Encoding($false)))
Write-Output ("ASSETS EINGEBETTET: {0} Bilder -> {1} KB" -f $entries.Count, [math]::Round((Get-Item $target).Length / 1KB))
