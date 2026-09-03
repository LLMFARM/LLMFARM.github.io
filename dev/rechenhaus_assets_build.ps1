# Technischer Export: Originale erhalten; ausschließlich proportional verkleinern.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$rhRoot = Split-Path $PSScriptRoot -Parent
$rhOut = Join-Path $rhRoot 'assets\rechenhaus'
New-Item -ItemType Directory -Path $rhOut -Force | Out-Null
$rhRecords = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'rechenhaus_bildquellen.json') | ConvertFrom-Json
$rhJs = [System.Text.StringBuilder]::new()
[void]$rhJs.AppendLine('/* Generierte Rechenhaus-Grafiken. Rohdateien und Prompts: rechenhaus_bildquellen.json. */')
[void]$rhJs.AppendLine('Object.assign(ASSETS,{')
foreach($rhRecord in $rhRecords){
  $rhSourcePath = if([IO.Path]::IsPathRooted([string]$rhRecord.path)){$rhRecord.path}else{Join-Path $rhRoot $rhRecord.path}
  $rhSrc = [System.Drawing.Bitmap]::new($rhSourcePath)
  $rhMax = if($rhRecord.id.StartsWith('trink_')){360}else{768}
  $rhScale = [Math]::Min(1.0,[double]$rhMax/[Math]::Max($rhSrc.Width,$rhSrc.Height))
  $rhDst = [System.Drawing.Bitmap]::new([int]($rhSrc.Width*$rhScale),[int]($rhSrc.Height*$rhScale),[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $rhG = [System.Drawing.Graphics]::FromImage($rhDst)
  $rhG.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
  $rhG.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $rhG.DrawImage($rhSrc,0,0,$rhDst.Width,$rhDst.Height)
  $rhPath = Join-Path $rhOut ($rhRecord.id+'.png')
  $rhDst.Save($rhPath,[System.Drawing.Imaging.ImageFormat]::Png)
  $rhG.Dispose();$rhDst.Dispose();$rhSrc.Dispose()
  $rhKey = if($rhRecord.id.StartsWith('trink_')){'pose_'+$rhRecord.id.Substring(6)+'_trink'}else{'rh_'+$rhRecord.id}
  [void]$rhJs.AppendLine(('"'+$rhKey+'":"data:image/png;base64,'+[Convert]::ToBase64String([IO.File]::ReadAllBytes($rhPath))+'",'))
}
[void]$rhJs.AppendLine('});')
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'rechenhaus_assets.js'),$rhJs.ToString(),[Text.UTF8Encoding]::new($false))
Write-Output ('Rechenhaus: '+$rhRecords.Count+' Grafiken exportiert und eingebettet.')
