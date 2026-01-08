@echo off
REM Installation script for Export Button - Windows
REM Author: CyrilG93
REM Version: 1.0.0

echo ========================================
echo   Export Button - Installation Windows
echo ========================================
echo.

REM Define paths
set "EXTENSION_NAME=com.cyrilg93.exportbutton"
set "CEP_EXTENSIONS_DIR=%APPDATA%\Adobe\CEP\extensions"
set "SCRIPT_DIR=%~dp0"

REM Create CEP extensions directory if it doesn't exist
if not exist "%CEP_EXTENSIONS_DIR%" (
    echo Creating CEP extensions directory...
    mkdir "%CEP_EXTENSIONS_DIR%"
)

REM Remove existing installation if present
set "TARGET_DIR=%CEP_EXTENSIONS_DIR%\%EXTENSION_NAME%"
if exist "%TARGET_DIR%" (
    echo Removing existing installation...
    rmdir /s /q "%TARGET_DIR%"
)

REM Copy extension files
echo Copying extension files...
xcopy /E /I /Y "%SCRIPT_DIR%*" "%TARGET_DIR%\"

REM Remove installation scripts from the installed copy
del /q "%TARGET_DIR%\install_mac.sh" 2>nul
del /q "%TARGET_DIR%\install_windows.bat" 2>nul
rmdir /s /q "%TARGET_DIR%\.git" 2>nul
del /q "%TARGET_DIR%\.gitignore" 2>nul
del /q "%TARGET_DIR%\README.md" 2>nul

REM Enable CEP debug mode (required for unsigned extensions)
echo Enabling CEP debug mode...
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1 /f

echo.
echo ========================================
echo   Installation completed successfully!
echo ========================================
echo.
echo Please restart Adobe Premiere Pro to load the extension.
echo.
echo To access the extension:
echo   Window ^> Extensions ^> Export Button
echo.
pause
