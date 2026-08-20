@echo off
setlocal

set "ROOT=%~dp0.."
set "VSWHERE=C:\Program Files (x86)\Microsoft Visual Studio\Installer\vswhere.exe"
set "VSINSTALL="

if exist "%VSWHERE%" (
  for /f "usebackq delims=" %%i in (`"%VSWHERE%" -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath`) do set "VSINSTALL=%%i"
)

if not defined VSINSTALL if exist "F:\VSBuildTools\Common7\Tools\VsDevCmd.bat" set "VSINSTALL=F:\VSBuildTools"
if defined VSINSTALL call "%VSINSTALL%\Common7\Tools\VsDevCmd.bat" -arch=x64 -host_arch=x64 >nul

if exist "%ROOT%\..\rustup" set "RUSTUP_HOME=%ROOT%\..\rustup"
set "CARGO_HOME=%USERPROFILE%\.cargo"
set "PATH=%USERPROFILE%\.cargo\bin;%PATH%"

set "TEMP=%ROOT%\..\Temp"
set "TMP=%ROOT%\..\Temp"
if not exist "%TEMP%" mkdir "%TEMP%"

npx tauri %*
exit /b %ERRORLEVEL%
