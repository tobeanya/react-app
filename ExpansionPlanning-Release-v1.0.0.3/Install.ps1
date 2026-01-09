#Requires -RunAsAdministrator
<#
.SYNOPSIS
  Installs or updates the Expansion Planning application and all required dependencies.
  It will first uninstall any existing version of the application.
#>

$ErrorActionPreference = "Stop"
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$appDisplayName = "Expansion Planning" # User-friendly name for messages
$appPackageName = "ExpansionPlanning"  # Package name from manifest Identity (for Get-AppxPackage)

Write-Host "--- $appDisplayName Installer ---" -ForegroundColor Cyan
Write-Host "This script will install or update the app and its required dependencies."
Write-Host "--------------------------`n"

try {
    # Step 1: Uninstall ALL Previous Versions (including development mode)
    Write-Host "1. Checking for existing versions of $appDisplayName..." -ForegroundColor Yellow
    $removedCount = 0

    # First, try to remove all-users packages (requires admin)
    $allUsersPackages = Get-AppxPackage -Name "*$appPackageName*" -AllUsers -ErrorAction SilentlyContinue
    foreach ($pkg in $allUsersPackages) {
        Write-Host "   - Found (all-users): $($pkg.PackageFullName)"
        Write-Host "   - Uninstalling..."
        try {
            Remove-AppxPackage -Package $pkg.PackageFullName -AllUsers -ErrorAction Stop
            $removedCount++
        } catch {
            Write-Host "   - Warning: Could not remove all-users package, trying per-user..." -ForegroundColor Yellow
        }
    }

    # Then, remove any per-user packages
    $userPackages = Get-AppxPackage -Name "*$appPackageName*" -ErrorAction SilentlyContinue
    foreach ($pkg in $userPackages) {
        Write-Host "   - Found (per-user): $($pkg.PackageFullName)"
        Write-Host "   - Uninstalling..."
        try {
            Remove-AppxPackage -Package $pkg.PackageFullName -ErrorAction Stop
            $removedCount++
        } catch {
            Write-Host "   - Warning: Could not remove package: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }

    if ($removedCount -gt 0) {
        Write-Host "   Success: Removed $removedCount previous installation(s).`n"
    } else {
        Write-Host "   - No previous versions found.`n"
    }

    # Step 2: Install the Certificate
    Write-Host "2. Installing security certificate..." -ForegroundColor Yellow
    $certPath = Get-ChildItem $scriptPath -Filter "*.cer" | Select-Object -First 1
    if ($certPath) {
        Import-Certificate -FilePath $certPath.FullName -CertStoreLocation "Cert:\LocalMachine\TrustedPeople" -ErrorAction Stop | Out-Null
        Write-Host "   Success: Certificate installed.`n"
    } else {
        Write-Host "   - No certificate file found, skipping.`n"
    }

    # Step 3: Install Dependencies
    Write-Host "3. Installing required runtimes..." -ForegroundColor Yellow
    $depsPath = Join-Path $scriptPath "Dependencies"
    if (Test-Path $depsPath) {
        Get-ChildItem $depsPath | Where-Object { $_.Extension -in @(".msix", ".appx") } | ForEach-Object {
            Write-Host "   - Installing $($_.Name)"
            try {
                Add-AppxPackage -Path $_.FullName -ErrorAction Stop
            } catch {
                # Ignore if a newer version is already installed
                if ($_.Exception.Message -like "*higher version*already installed*") {
                    Write-Host "     (Skipped: newer version already installed)" -ForegroundColor Gray
                } else {
                    Write-Host "     Warning: $($_.Exception.Message)" -ForegroundColor Yellow
                }
            }
        }
        Write-Host "   Success: All runtimes processed.`n"
    } else {
        Write-Host "   - No 'Dependencies' folder found, skipping.`n"
    }

    # Step 4: Install the Main Application
    Write-Host "4. Installing $appDisplayName..." -ForegroundColor Yellow
    $msixPath = Get-ChildItem $scriptPath -Filter "*.msix" | Where-Object { $_.Name -notlike "*Dependencies*" } | Select-Object -First 1
    if ($msixPath) {
        Add-AppxPackage -Path $msixPath.FullName -ErrorAction Stop
        Write-Host "   Success: $appDisplayName installed.`n"
    } else {
        throw "Main application package (.msix) not found."
    }

    Write-Host "--- Installation Complete! ---" -ForegroundColor Green
    Write-Host "You can now find and launch '$appDisplayName' from your Start Menu."

    # Step 5: Launch the Application
    Write-Host "5. Attempting to launch $appDisplayName..." -ForegroundColor Yellow
    $newlyInstalledPackage = Get-AppxPackage -Name "*$appPackageName*" | Select-Object -First 1
    if ($newlyInstalledPackage) {
        $packageFamilyName = $newlyInstalledPackage.PackageFamilyName
        $appId = "$packageFamilyName!App" # Default AppId for most UWP apps

        try {
            # Use explorer.exe to launch the app
            Start-Process "explorer.exe" "shell:AppsFolder\$appId" -ErrorAction Stop
            Write-Host "   Success: $appDisplayName launched.`n"
        } catch {
            Write-Host "   Warning: Failed to launch $appDisplayName automatically. You can launch it from the Start Menu." -ForegroundColor Yellow
            Write-Host "   Launch error: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "   Warning: Could not find installed $appDisplayName to launch automatically." -ForegroundColor Yellow
    }

} catch {
    Write-Host "`n--- AN ERROR OCCURRED ---" -ForegroundColor Red
    Write-Host "Error on line $($_.InvocationInfo.ScriptLineNumber): $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nTroubleshooting Steps:" -ForegroundColor Yellow
    Write-Host "1. Ensure this script was run using 'Install.bat' (which handles admin rights)."
    Write-Host "2. For self-signed certificates, this PC may require 'Developer Mode' to be enabled in Windows Settings."
    Write-Host "3. Check if a conflicting version of the app is installed for a different user on this PC."
    if ($_.Exception.Message -like "*0x80073D19*") {
        Write-Host "`nThis error often means a debug build was installed for another user on this PC. Remove it from all accounts and try again." -ForegroundColor Cyan
    }
}

Write-Host "`nPress any key to exit..."
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
