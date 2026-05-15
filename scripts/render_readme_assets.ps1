$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$screenshots = Join-Path $repoRoot "screenshots"
$stdout = Join-Path $screenshots "app.stdout.log"
$stderr = Join-Path $screenshots "app.stderr.log"
$port = "5124"
$process = $null
$edgeCandidates = @(
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
)

New-Item -ItemType Directory -Force -Path $screenshots | Out-Null

function Get-EdgePath {
    foreach ($candidate in $edgeCandidates) {
        if (Test-Path $candidate) {
            return $candidate
        }
    }
    throw "Microsoft Edge was not found."
}

function Wait-ForUrl {
    param([string]$Url)
    for ($i = 0; $i -lt 90; $i++) {
        try {
            Invoke-WebRequest -Uri $Url -UseBasicParsing | Out-Null
            return
        } catch {
            Start-Sleep -Seconds 1
        }
    }
    throw "Timed out waiting for $Url"
}

try {
    $env:PORT = $port
    $process = Start-Process -FilePath "npm.cmd" `
        -ArgumentList "run", "dev" `
        -WorkingDirectory $repoRoot `
        -RedirectStandardOutput $stdout `
        -RedirectStandardError $stderr `
        -PassThru

    Wait-ForUrl "http://127.0.0.1:$port/"

    $edge = Get-EdgePath
    $targets = @(
        @{ Url = "http://127.0.0.1:$port/"; File = "01-overview-proof.png"; Size = "1600,1180" },
        @{ Url = "http://127.0.0.1:$port/scenario-matrix"; File = "02-scenario-matrix-proof.png"; Size = "1600,1120" },
        @{ Url = "http://127.0.0.1:$port/secret-replacement"; File = "03-secret-replacement-proof.png"; Size = "1600,1180" },
        @{ Url = "http://127.0.0.1:$port/verification"; File = "04-verification-proof.png"; Size = "1600,1040" }
    )

    foreach ($target in $targets) {
        & $edge `
            --headless `
            --disable-gpu `
            --hide-scrollbars `
            "--window-size=$($target.Size)" `
            "--screenshot=$(Join-Path $screenshots $target.File)" `
            $target.Url | Out-Null
    }
} finally {
    if ($process -and -not $process.HasExited) {
        Stop-Process -Id $process.Id -Force
    }
}
