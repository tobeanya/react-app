# Developer Guide: Building and Releasing a Signed MSIX Package

This guide provides a detailed, step-by-step process for developers to build, sign, and package the React Native Windows application for distribution.

The recommended method for distributing to non-technical users is a **signed MSIX package**. This provides a professional one-click installation experience and does not require the user to enable Developer Mode.

---

## Step 1: Create a Signing Certificate

A certificate is required to prove the application came from you. For professional distribution, you should purchase one from a trusted Certificate Authority (CA). For internal testing or free distribution, you can create your own "self-signed" certificate.

**Action: Create a Self-Signed Certificate**

1.  Open PowerShell **as an Administrator**.
2.  Run the following command to generate the certificate:

    ```powershell
    # --- Certificate Details ---
    $publisherName = "CN=PowerGEM" # IMPORTANT: Change this to your company or developer name
    $certPassword = "YourSecurePassword" # IMPORTANT: Change this to a strong password
    $certFileName = "ReactApp_SigningCert"
    
    # --- Create the Certificate ---
    # This creates a certificate on your machine, valid for 2 years.
    $cert = New-SelfSignedCertificate -Type Custom -Subject $publisherName -KeyUsage DigitalSignature -FriendlyName "ReactApp Signing Certificate" -CertStoreLocation "Cert:\CurrentUser\My" -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3", "2.5.29.19={text}") -NotAfter (Get-Date).AddYears(2)
    
    # --- Export the Public Key (.cer file) ---
    # This file is safe to distribute. Users will need to install it to trust your self-signed apps.
    Export-Certificate -Cert $cert -FilePath "$($certFileName).cer"
    
    # --- Export the Private Key (.pfx file) ---
    # This file is SECRET and must be kept safe. It is your digital identity and is used to sign the app.
    $securePassword = ConvertTo-SecureString -String $certPassword -Force -AsPlainText
    Export-PfxCertificate -Cert $cert -FilePath "$($certFileName).pfx" -Password $securePassword
    
    Write-Host "`nCertificate created successfully!" -ForegroundColor Green
    Write-Host "Thumbprint: $($cert.Thumbprint)"
    Write-Host "  - Public Key: $($certFileName).cer (for users to install)"
    Write-Host "  - Private Key: $($certFileName).pfx (keep this safe!)"
    ```

**What this script does:**
*   `New-SelfSignedCertificate`: Creates the certificate itself and stores it in your user's certificate store.
*   `Export-Certificate`: Creates the `.cer` file. This is the public part of your certificate. For self-signed apps, the user must install this file once to trust your application.
*   `Export-PfxCertificate`: Creates the `.pfx` file, which includes the private key. This file is password-protected and is used to sign your MSIX package. **Do not share the `.pfx` file or its password.**

---

## Step 2: Configure the Application Manifest

The application manifest must reference the publisher name from your certificate.

**Action: Update the Manifest**

1.  Open the file: `windows/ReactApp.Package/Package.appxmanifest`.
2.  Find the `<Identity>` element.
3.  Change the `Publisher` attribute to match the `$publisherName` you used in the PowerShell script (e.g., `"CN=YourCompanyName"`).

    ```xml
    <!-- Before -->
    <Identity Name="ReactApp" Publisher="CN=tobet" Version="1.0.0.0" />
    
    <!-- After -->
    <Identity Name="ReactApp" Publisher="CN=YourCompanyName" Version="1.0.0.0" />
    ```

4.  Update the `Version` number as needed. The format is `Major.Minor.Build.Revision`.

---

## Step 3: Build the Release Binaries

Now, build the application with your manifest changes included.

**Action: Run the Release Build**

```bash
# This command compiles the app and bundles the JavaScript.
# --no-launch prevents it from trying to start the app after building.
npx react-native run-windows --release --arch x64 --no-launch
```

This command populates the `windows/ReactApp.Package/bin/x64/Release/AppX/` directory with all the necessary files.

---

## Step 4: Create and Sign the MSIX Package

This is the final step where you package the `AppX` folder into a single `.msix` file and digitally sign it using your `.pfx` file.

**Action: Package and Sign**

1.  Open PowerShell (does not need to be as Administrator).
2.  Run the following commands:

    ```powershell
    # --- Packaging Details ---
    $packageVersion = "1.0.0" # Change this to match your app version
    $certFileName = "ReactApp_SigningCert" # Must match the name from Step 1
    $certPassword = "YourSecurePassword" # Must match the password from Step 1

    # --- Tool Paths (usually correct for default VS installation) ---
    $makeAppxPath = "C:\Program Files (x86)\Windows Kits\10\bin\10.0.19041.0\x64\makeappx.exe"
    $signtoolPath = "C:\Program Files (x86)\Windows Kits\10\bin\10.0.19041.0\x64\signtool.exe"

    # --- File Paths ---
    $appxFolder = "C:\Users\tobet\Projects\react-app\windows\ReactApp.Package\bin\x64\Release\AppX"
    $msixOutputFile = "ReactApp-Installer-v$($packageVersion).msix"
    $pfxPath = "$($certFileName).pfx"

    # --- Create MSIX Package ---
    Write-Host "Creating MSIX package..."
    & $makeAppxPath pack /d $appxFolder /p $msixOutputFile /o
    
    # --- Sign the MSIX Package ---
    Write-Host "Signing MSIX package..."
    & $signtoolPath sign /fd SHA256 /a /f $pfxPath /p $certPassword $msixOutputFile
    
    Write-Host "`nSuccessfully created and signed '$msixOutputFile'" -ForegroundColor Green
    ```

**What this script does:**
*   `makeappx.exe`: This is a tool from the Windows SDK that takes the "loose" application files and bundles them into a single `.msix` package. The `/o` flag tells it to overwrite the output file if it already exists.
*   `signtool.exe`: This is another SDK tool that applies a digital signature to a file.
    *   `/fd SHA256`: Sets the signing algorithm to SHA256 (the modern standard).
    *   `/a`: Automatically selects the best certificate to use.
    *   `/f $pfxPath`: Specifies the path to your private key file.
    *   `/p $certPassword`: Provides the password for your private key.

---

## Step 5: Create a Distribution Bundle with Dependencies (Recommended)

To avoid errors and provide a seamless experience, you should bundle all runtimes with your app. This new process creates a folder with a user-friendly batch file (`.bat`) that automatically handles administrative rights and PowerShell security policies.

### 5.1: Create the Distribution Folder Structure

First, create a main folder for your release and copy your signed MSIX and certificate into it.

```powershell
# --- Create the main folder ---
$releaseFolder = "ReactApp-Release-v$($packageVersion)"
# Clean up previous attempt
if (Test-Path $releaseFolder) { remove-item $releaseFolder -Recurse -Force }
mkdir $releaseFolder

# --- Copy your main app package and certificate ---
copy "$msixOutputFile" "$releaseFolder\"
copy "$($certFileName).cer" "$releaseFolder\"
```

### 5.2: Gather Dependency Installers

React Native automatically downloads the required dependency installers. We can copy them from the `..._Test` build output folder.

```powershell
# --- Create a subfolder for dependencies ---
$depsFolder = "$releaseFolder\Dependencies"
mkdir $depsFolder

# --- Copy all dependency packages ---
$testBuildFolder = Get-ChildItem "windows\ReactApp.Package\AppPackages" -Recurse | Where-Object { $_.Name -like "*_Test" } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
copy "$($testBuildFolder.FullName)\Dependencies\x64\*.appx" "$depsFolder\"
copy "$($testBuildFolder.FullName)\Dependencies\x64\*.msix" "$depsFolder\"

Write-Host "Dependencies copied to '$depsFolder'" -ForegroundColor Green
```

### 5.3: Create the Installer Scripts

We will create two scripts: a PowerShell script to perform the work, and a Batch file to launch it correctly.

**1. Create the PowerShell Script (`Install.ps1`)**

This script handles the core installation logic. Create a new file named `Install.ps1` inside your `$releaseFolder` and add the following content. Note the improved error handling in the `catch` block.

```powershell
#Requires -RunAsAdministrator
<#
.SYNOPSIS
  Installs the ReactApp application and all required dependencies.
#>

$ErrorActionPreference = "Stop"
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host "--- ReactApp Installer ---" -ForegroundColor Cyan
Write-Host "This script will install the app and its required dependencies."
Write-Host "--------------------------`n"

try {
    # Step 1: Install the Certificate
    $certPath = Get-ChildItem $scriptPath -Filter "*.cer" | Select-Object -First 1
    if ($certPath) {
        Write-Host "1. Installing security certificate..." -ForegroundColor Yellow
        Import-Certificate -FilePath $certPath.FullName -CertStoreLocation "Cert:\LocalMachine\TrustedPeople" | Out-Null
        Write-Host "   Success: Certificate installed.`n"
    } else { Write-Host "1. No certificate file found, skipping.`n" }

    # Step 2: Install Dependencies
    $depsPath = Join-Path $scriptPath "Dependencies"
    if (Test-Path $depsPath) {
        Write-Host "2. Installing required runtimes..." -ForegroundColor Yellow
        Get-ChildItem $depsPath | ForEach-Object {
            Write-Host "   - Installing $($_.Name)"
            try { Add-AppxPackage -Path $_.FullName -ErrorAction SilentlyContinue } catch {}
        }
        Write-Host "   Success: All runtimes installed.`n"
    } else { Write-Host "2. No 'Dependencies' folder found, skipping.`n" }

    # Step 3: Install the Main Application
    $msixPath = Get-ChildItem $scriptPath -Filter "*.msix" | Where-Object { $_.Name -notlike "*Dependencies*" } | Select-Object -First 1
    if ($msixPath) {
        Write-Host "3. Installing ReactApp..." -ForegroundColor Yellow
        Add-AppxPackage -Path $msixPath.FullName
        Write-Host "   Success: ReactApp installed.`n"
    } else { throw "Main application package (.msix) not found." }

    Write-Host "--- Installation Complete! ---" -ForegroundColor Green
    Write-Host "You can now find and launch ReactApp from your Start Menu."

} catch {
    Write-Host "`n--- AN ERROR OCCURRED ---" -ForegroundColor Red
    Write-Host "Error on line $($_.InvocationInfo.ScriptLineNumber): $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nTroubleshooting Steps:" -ForegroundColor Yellow
    Write-Host "1. Ensure you are running as an Administrator."
    Write-Host "2. Check if a conflicting version of the app is already installed."
    if ($_.Exception.Message -like "*0x80073D19*") {
        Write-Host "`nThis error often means a debug build was installed for another user on this PC. Remove it from all accounts and try again." -ForegroundColor Cyan
    }
}

Write-Host "`nPress any key to exit..."
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
```

**2. Create the Batch File Launcher (`Install.bat`)**

This is the only file the user needs to run. It automatically handles admin rights and PowerShell security policy. Create a new file named `Install.bat` inside your `$releaseFolder` with this content:

```batch
@echo off
:: BatchGotAdmin
:-------------------------------------
REM  --> Check for permissions
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
REM --> If error flag set, we do not have admin.
if '%errorlevel%' NEQ '0' (
    echo Requesting administrative privileges...
    goto UACPrompt
) else ( goto gotAdmin )
:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    exit /B
:gotAdmin
    if exist "%temp%\getadmin.vbs" ( del "%temp%\getadmin.vbs" )
    pushd "%~dp0"
:--------------------------------------

:: --- Main Logic ---
cls
echo =======================================================
echo                    ReactApp Installer
echo =======================================================
echo.
echo This will start the installation process.
echo Please approve the administrator prompt if it appears.
echo.

:: Run the PowerShell installer script, bypassing the execution policy for this session only.
powershell.exe -ExecutionPolicy Bypass -NoProfile -File "Install.ps1"

pause
```

### 5.4: Package for Distribution

You now have a complete release folder with a user-friendly installer. Zip it up. The user will only need to run the `Install.bat` file.

```powershell
# Zip the entire release folder
Compress-Archive -Path "$releaseFolder\*" -DestinationPath "$($releaseFolder).zip"

Write-Host "Complete release package created at: $($releaseFolder).zip" -ForegroundColor Green
```

The final output is a single zip file (e.g., `ReactApp-Release-v1.0.0.zip`) that you can send to your users.

