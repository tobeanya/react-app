# Release Build & Distribution Guide

This guide covers building and distributing the ReactApp for Windows.

## Prerequisites (Build Machine)

- Node.js 18+ (LTS recommended)
- Visual Studio 2022 with:
  - Desktop development with C++
  - Universal Windows Platform development
  - Windows 10/11 SDK (10.0.19041.0 or later)
- Windows 10/11 with Developer Mode enabled

## Building a Release Version

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Uninstall Any Existing Version

**IMPORTANT:** Debug and release builds conflict with each other. Always uninstall before switching:

```powershell
# Remove existing installation (run as Administrator for --AllUsers)
Get-AppxPackage -AllUsers -Name "ReactApp" | Remove-AppxPackage -AllUsers
```

### Step 3: Build Release

```bash
npx react-native run-windows --release --arch x64 --no-launch
```

This creates the release build at:
```
windows/ReactApp.Package/bin/x64/Release/AppX/
```

### Step 4: Verify Build

Check that the AppX folder has this structure:
```
AppX/                        ← Root folder (distribute this entire folder)
├── AppxManifest.xml         ← Package manifest (IN ROOT, not in ReactApp subfolder)
├── resources.pri
├── Images/                  ← App icons
│   └── *.png
├── ReactApp/                ← Subfolder containing the app binaries
│   ├── ReactApp.exe         ← Main executable (138 KB - requires registration to run)
│   ├── Bundle/
│   │   └── index.windows.bundle  ← JavaScript bundle (1.4 MB)
│   ├── hermes.dll           ← JavaScript engine
│   ├── Microsoft.ReactNative.dll
│   └── *.dll                ← Other runtime dependencies
└── Microsoft.Web.WebView2.Core.dll
```

**IMPORTANT:** The `AppxManifest.xml` is in the **root** of AppX, NOT inside the ReactApp subfolder.

---

## Distribution Options
React Native Windows apps are packaged apps (UWP/WinUI) - they can't run as standalone exe files like traditional Win32 apps.
The exe requires the Windows App Host runtime and proper package registration

### Option A: Loose Files (No Signing Required)

Best for: Internal testing, development teams, situations where you control target machines.

#### What to Distribute

Copy the entire `AppX` folder:
```
windows/ReactApp.Package/bin/x64/Release/AppX/
```

Create a zip file for easy distribution:
```powershell
Compress-Archive -Path "windows\ReactApp.Package\bin\x64\Release\AppX\*" -DestinationPath "ReactApp-1.0.0-x64.zip"
```

#### Installation on Target PC

**Prerequisites for Target PC:**
- Windows 10 version 1903+ or Windows 11
- Developer Mode enabled (Settings > Privacy & Security > For developers > Developer Mode: On)

**Install Steps:**

1. Remove any existing version first (run as Administrator):
   ```powershell
   Get-AppxPackage -AllUsers -Name "ReactApp" | Remove-AppxPackage -AllUsers
   ```

2. Extract the zip file to a permanent location (e.g., `C:\Apps\ReactApp\`)

3. Verify the folder structure looks like this:
   ```
   C:\Apps\ReactApp\
   ├── AppxManifest.xml    ← This file must be here (root level)
   ├── ReactApp\
   │   ├── ReactApp.exe
   │   └── Bundle\
   └── Images\
   ```

4. Open PowerShell as Administrator and run:
   ```powershell
   Add-AppxPackage -Register "C:\Apps\ReactApp\AppxManifest.xml"
   ```

   **Common mistake:** Do NOT point to `C:\Apps\ReactApp\ReactApp\AppxManifest.xml` - the manifest is in the root, not the ReactApp subfolder.

5. Launch from Start Menu (search "Expansion Planning") or run:
   ```powershell
   start "" "shell:AppsFolder\ReactApp_gre46ge5r5092!App"
   ```

**Uninstall:**
```powershell
Get-AppxPackage -Name "ReactApp" | Remove-AppxPackage
```

---

### Option B: Signed MSIX Package (Recommended for End Users)

Best for: Public distribution, enterprise deployment, users without Developer Mode.

#### Step 1: Create a Self-Signed Certificate

Open PowerShell as Administrator:

```powershell
# Create certificate (valid for 1 year)
$cert = New-SelfSignedCertificate -Type Custom -Subject "CN=YourCompanyName" -KeyUsage DigitalSignature -FriendlyName "ReactApp Signing Certificate" -CertStoreLocation "Cert:\CurrentUser\My" -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3", "2.5.29.19={text}")

# Export certificate for distribution (public key only)
Export-Certificate -Cert $cert -FilePath "ReactApp.cer"

# Export with private key for signing (keep this secure!)
$password = ConvertTo-SecureString -String "YourSecurePassword" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath "ReactApp.pfx" -Password $password

Write-Host "Certificate Thumbprint: $($cert.Thumbprint)"
```

#### Step 2: Update Package Manifest

Edit `windows/ReactApp.Package/Package.appxmanifest`:

Change the `Publisher` attribute in the `<Identity>` element to match your certificate:
```xml
<Identity Name="ReactApp" Publisher="CN=YourCompanyName" Version="1.0.0.0" />
```

#### Step 3: Build with Signing

```bash
# Rebuild to apply manifest changes
npx react-native run-windows --release --arch x64 --no-launch
```

#### Step 4: Create and Sign MSIX Package

```powershell
# Create MSIX from AppX folder
& "C:\Program Files (x86)\Windows Kits\10\bin\10.0.19041.0\x64\makeappx.exe" pack /d "windows\ReactApp.Package\bin\x64\Release\AppX" /p "ReactApp-1.0.0-x64.msix"

# Sign the MSIX
& "C:\Program Files (x86)\Windows Kits\10\bin\10.0.19041.0\x64\signtool.exe" sign /fd SHA256 /a /f "ReactApp.pfx" /p "YourSecurePassword" "ReactApp-1.0.0-x64.msix"
```

#### What to Distribute

- `ReactApp-1.0.0-x64.msix` - The signed installer
- `ReactApp.cer` - Certificate file (if self-signed)

#### Installation on Target PC

**For Self-Signed Certificate:**

1. Install the certificate first (one-time, requires Admin):
   ```powershell
   # Run as Administrator
   Import-Certificate -FilePath "ReactApp.cer" -CertStoreLocation "Cert:\LocalMachine\TrustedPeople"
   ```

2. Double-click the `.msix` file to install

**For Trusted Certificate (purchased from CA):**

Just double-click the `.msix` file - no certificate installation needed.

---

### Option C: MSIX Bundle with Dependencies

For distributing to machines that may not have all required runtimes.

#### Create Distribution Folder

```powershell
# Create distribution folder
mkdir ReactApp-Distribution

# Copy main MSIX
copy "ReactApp-1.0.0-x64.msix" "ReactApp-Distribution\"

# Copy dependencies from the test package
copy "windows\ReactApp.Package\AppPackages\ReactApp.Package_1.0.0.0_x64_Test\Dependencies\x64\*.appx" "ReactApp-Distribution\Dependencies\"
copy "windows\ReactApp.Package\AppPackages\ReactApp.Package_1.0.0.0_x64_Test\Dependencies\x64\*.msix" "ReactApp-Distribution\Dependencies\"

# Copy certificate
copy "ReactApp.cer" "ReactApp-Distribution\"
```

#### Create Install Script

Create `ReactApp-Distribution\Install.ps1`:

```powershell
#Requires -RunAsAdministrator

$ErrorActionPreference = "Stop"
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host "Installing ReactApp..." -ForegroundColor Cyan

# Install certificate if present
$certPath = Join-Path $scriptPath "ReactApp.cer"
if (Test-Path $certPath) {
    Write-Host "Installing certificate..." -ForegroundColor Yellow
    Import-Certificate -FilePath $certPath -CertStoreLocation "Cert:\LocalMachine\TrustedPeople" | Out-Null
}

# Install dependencies
$depsPath = Join-Path $scriptPath "Dependencies"
if (Test-Path $depsPath) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    Get-ChildItem $depsPath -Filter "*.appx" | ForEach-Object {
        try {
            Add-AppxPackage -Path $_.FullName -ErrorAction SilentlyContinue
        } catch {}
    }
    Get-ChildItem $depsPath -Filter "*.msix" | ForEach-Object {
        try {
            Add-AppxPackage -Path $_.FullName -ErrorAction SilentlyContinue
        } catch {}
    }
}

# Install main app
$msixPath = Get-ChildItem $scriptPath -Filter "*.msix" | Where-Object { $_.Name -notlike "*Dependencies*" } | Select-Object -First 1
if ($msixPath) {
    Write-Host "Installing ReactApp..." -ForegroundColor Yellow
    Add-AppxPackage -Path $msixPath.FullName
}

Write-Host "Installation complete!" -ForegroundColor Green
Write-Host "Launch ReactApp from the Start Menu." -ForegroundColor Cyan
```

---

## Runtime Dependencies

The following runtimes may need to be installed on target machines if not already present:

| Dependency | Included In | Manual Download |
|------------|-------------|-----------------|
| VC++ Runtime | Windows 10 1903+ | [Microsoft Download](https://aka.ms/vs/17/release/vc_redist.x64.exe) |
| Windows App Runtime | Dependencies folder | [Microsoft Download](https://aka.ms/windowsappsdk/1.7/latest/windowsappruntimeinstall-x64.exe) |
| WebView2 Runtime | Windows 11 / Edge | [Microsoft Download](https://go.microsoft.com/fwlink/p/?LinkId=2124703) |

---

## Troubleshooting

### "Cannot find path '...\AppxManifest.xml' because it does not exist"
You're pointing to the wrong location. The `AppxManifest.xml` is in the **root** of the extracted folder, NOT inside the `ReactApp` subfolder.

```
WRONG: C:\Apps\ReactApp\ReactApp\AppxManifest.xml
RIGHT: C:\Apps\ReactApp\AppxManifest.xml
```

### "App package must be digitally signed"
- Use Option A (loose files) which doesn't require signing
- Or sign the MSIX package (Option B)

### "Developer Mode is not enabled"
Target PC needs Developer Mode:
1. Settings > Privacy & Security > For developers
2. Enable "Developer Mode"

### "The app didn't start"
Check that all DLLs are present in the AppX folder. Rebuild with:
```bash
npx react-native run-windows --release --arch x64 --no-launch --no-deploy
```

### "Deployment failed with HRESULT: 0x80073CFB"
An older version is installed. Remove it first:
```powershell
Get-AppxPackage -Name "ReactApp" | Remove-AppxPackage
```

### "Another user has already installed an unpackaged version" (0x80073D19)
Debug and release builds conflict because they have different signing. Another user account installed a different version.

Fix (run as Administrator):
```powershell
# Remove for ALL users on the machine
Get-AppxPackage -AllUsers -Name "ReactApp" | Remove-AppxPackage -AllUsers

# Also remove any provisioned packages
Get-AppxProvisionedPackage -Online | Where-Object {$_.DisplayName -like "*ReactApp*"} | Remove-AppxProvisionedPackage -Online
```

**Prevention:** Always uninstall before switching between debug and release builds (see Step 2 in Building a Release Version).

### App crashes on launch
Ensure the JavaScript bundle exists at:
```
AppX/ReactApp/Bundle/index.windows.bundle
```

---

## Version Numbering

Update version in `windows/ReactApp.Package/Package.appxmanifest`:
```xml
<Identity Name="ReactApp" Publisher="CN=tobet" Version="1.0.1.0" />
```

Version format: `Major.Minor.Build.Revision`

---

## Quick Reference

| Task | Command |
|------|---------|
| Build Release | `npx react-native run-windows --release --arch x64 --no-launch` |
| Build Debug | `npx react-native run-windows` |
| Create ZIP | `Compress-Archive -Path "windows\ReactApp.Package\bin\x64\Release\AppX\*" -DestinationPath "ReactApp.zip"` |
| Install (loose) | `Add-AppxPackage -Register "AppxManifest.xml"` |
| Uninstall | `Get-AppxPackage -Name "ReactApp" \| Remove-AppxPackage` |
| Launch | `start "" "shell:AppsFolder\ReactApp_gre46ge5r5092!App"` |
