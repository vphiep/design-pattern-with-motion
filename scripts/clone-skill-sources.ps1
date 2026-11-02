# Helper script to clone git animation skill sources for offline reference
# Run: powershell -ExecutionPolicy Bypass -File .\scripts\clone-skill-sources.ps1

$TargetDir = Join-Path $PSScriptRoot "..\.references"
if (!(Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Path $TargetDir | Out-Null
}

$repos = @(
    @{ Name = "animejs"; Url = "https://github.com/juliangarnier/anime.git" },
    @{ Name = "animate-css"; Url = "https://github.com/animate-css/animate.css.git" },
    @{ Name = "gsap"; Url = "https://github.com/greensock/GSAP.git" },
    @{ Name = "motion"; Url = "https://github.com/motiondivision/motion.git" },
    @{ Name = "tailwindcss-animate"; Url = "https://github.com/jamiebuilds/tailwindcss-animate.git" },
    @{ Name = "tailwind-motion"; Url = "https://github.com/romboHQ/tailwind-motion.git" },
    @{ Name = "rough"; Url = "https://github.com/rough-stuff/rough.git" },
    @{ Name = "react-spring"; Url = "https://github.com/pmndrs/react-spring.git" },
    @{ Name = "lottie-web"; Url = "https://github.com/airbnb/lottie-web.git" }
)

Write-Host "Cloning/Updating Animation Skill Reference Sources into $TargetDir..." -ForegroundColor Cyan

foreach ($repo in $repos) {
    $dest = Join-Path $TargetDir $repo.Name
    if (Test-Path (Join-Path $dest ".git")) {
        Write-Host "Updating $($repo.Name)..." -ForegroundColor Yellow
        git -C $dest pull --depth 1
    } else {
        Write-Host "Cloning $($repo.Name) (shallow clone)..." -ForegroundColor Green
        git clone --depth 1 $repo.Url $dest
    }
}

Write-Host "Done! Sources ready in $TargetDir." -ForegroundColor Cyan
