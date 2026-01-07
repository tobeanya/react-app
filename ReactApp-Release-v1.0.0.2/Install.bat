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
echo                    Expansion Planning Installer
echo =======================================================
echo.
echo This will start the installation process.
echo Please approve the administrator prompt if it appears.
echo.

:: Run the PowerShell installer script, bypassing the execution policy for this session only.
powershell.exe -ExecutionPolicy Bypass -NoProfile -File "Install.ps1"

pause
```