# LLM FARM – Build-Script
# Setzt aus dev\modellhof_template.html + den Daten-Bausteinen die fertige
# ..\modellhof_game.html zusammen und prueft die Syntax (falls node vorhanden).
# Aufruf:  powershell -ExecutionPolicy Bypass -File .\assemble.ps1
$ErrorActionPreference = "Stop"
$dev  = $PSScriptRoot
$proj = Split-Path $PSScriptRoot -Parent
$html = [IO.File]::ReadAllText("$dev\modellhof_template.html", [Text.Encoding]::UTF8)

$teile = @(
  @{ marker = "/*===HOFLOOP:CSS===*/"; datei = "$dev\hofloop.css" },
  @{ marker = "/*===HOFLOOP===*/"; datei = "$dev\hofloop.js" },
  @{ marker = "/*===RECHENHAUS:CSS===*/"; datei = "$dev\rechenhaus.css" },
  @{ marker = "/*===RECHENHAUS:ASSETS===*/"; datei = "$dev\rechenhaus_assets.js" },
  @{ marker = "/*===RECHENHAUS:OBJEKTE===*/"; datei = "$dev\rechenhaus_objekte.js" },
  @{ marker = "/*===RECHENHAUS===*/"; datei = "$dev\rechenhaus.js" },
  @{ marker = "/*===TEICH===*/"; datei = "$dev\teich.js" },
  @{ marker = "/*===ASSETS===*/";         datei = "$dev\assets_embed.js" },
  @{ marker = "/*===GRAFIK===*/";         datei = "$dev\grafik.js" },
  @{ marker = "/*===DATEN:MODELLE===*/";  datei = "$dev\modelle.js" },
  @{ marker = "/*===DATEN:HARNESSE===*/"; datei = "$dev\harnesse.js" },
  @{ marker = "/*===DATEN:TECHNIK===*/";  datei = "$dev\technik.js" },
  @{ marker = "/*===DATEN:CONTENT===*/";  datei = "$dev\content.js" },
  @{ marker = "/*===MINISPIELE===*/";     datei = "$dev\minispiele.js" },
  @{ marker = "/*===ZUCHT===*/";          datei = "$dev\zucht.js" },
  @{ marker = "/*===EREIGNISSE===*/";     datei = "$dev\ereignisse.js" },
  @{ marker = "/*===ZETTELSCHMIEDE===*/"; datei = "$dev\zettelschmiede.js" },
  @{ marker = "/*===NEEDLE===*/";         datei = "$dev\needle.js" },
  @{ marker = "/*===HOFSPRECHER===*/";    datei = "$dev\hofsprecher.js" },
  @{ marker = "/*===BERUFE===*/";         datei = "$dev\berufe.js" },
  @{ marker = "/*===COMPLIANCE===*/";     datei = "$dev\compliance.js" },
  @{ marker = "/*===FINALE===*/";       datei = "$dev\finale.js" },
  @{ marker = "/*===TECHBAUM===*/";     datei = "$dev\techbaum.js" },
  @{ marker = "/*===MCP===*/";          datei = "$dev\mcp.js" },
  @{ marker = "/*===STAMMBAUM===*/";    datei = "$dev\stammbaum.js" },
  @{ marker = "/*===MINISPIELE:CSS===*/"; datei = "$dev\minispiele.css" },
  @{ marker = "/*===ADA:MUND===*/";       datei = "$dev\ada_visemen.js" },
  @{ marker = "/*===DATEN:QUIRKS===*/";   datei = "$dev\quirks.js" },
  @{ marker = "/*===DATEN:ARCH===*/";     datei = "$dev\arch_patch.js" },
  @{ marker = "/*===DATEN:KRANK===*/";    datei = "$dev\krank_wissen.js" }
)
foreach ($t in $teile) {
  if (-not (Test-Path $t.datei)) { Write-Output ("FEHLT: " + $t.datei); exit 1 }
  $inhalt = [IO.File]::ReadAllText($t.datei, [Text.Encoding]::UTF8)
  if ($html.IndexOf($t.marker) -lt 0) { Write-Output ("MARKER FEHLT: " + $t.marker); exit 1 }
  $html = $html.Replace($t.marker, $inhalt)
}
[IO.File]::WriteAllText("$proj\modellhof_game.html", $html, (New-Object Text.UTF8Encoding($false)))
Write-Output ("ASSEMBLIERT: " + [math]::Round((Get-Item "$proj\modellhof_game.html").Length/1kb) + " KB -> modellhof_game.html")

$m = [regex]::Match($html, "(?s)<script>(.*)</script>")
if (-not $m.Success) { Write-Output "SCRIPT-BLOCK NICHT GEFUNDEN"; exit 1 }
$tmp = Join-Path $env:TEMP "modellhof_check.js"
[IO.File]::WriteAllText($tmp, $m.Groups[1].Value, (New-Object Text.UTF8Encoding($false)))
$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
  $out = & node --check $tmp 2>&1
  if ($LASTEXITCODE -eq 0) { Write-Output "SYNTAX OK" } else { Write-Output "SYNTAX-FEHLER:"; Write-Output ($out | Out-String); exit 1 }
} else {
  Write-Output "node nicht gefunden - Syntaxpruefung uebersprungen"
}
