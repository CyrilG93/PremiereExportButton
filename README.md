# Export Button for Adobe Premiere Pro

A simple CEP extension to quickly export the active sequence via Adobe Media Encoder.

![Premiere Pro](https://img.shields.io/badge/Premiere%20Pro-25.5%2B-9999FF)
![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows-lightgrey)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **One-click export** - Export the active sequence via Adobe Media Encoder
- **Auto-start** - Exports start automatically without manual intervention
- **Download mode** - Option to export directly to Downloads folder
- **Dual presets** - Separate presets for Video+Audio and Audio-only sequences
- **Cross-platform** - Works on both macOS and Windows

## Interface

The panel features a minimal, compact interface:
- **Export Button** (large square) - Exports the active sequence
- **Checkbox** (below) - Enable to export to Downloads folder instead of project folder
- **Settings** (gear icon) - Configure export presets

## Project Structure

The extension expects this project structure:
```
00 00 PROJECT_NAME/
├── EXPORTS/          ← Default export destination
└── PROJET/
    └── Project.prproj
```

If the EXPORTS folder doesn't exist, it will be created automatically.

## Export Logic

1. Detects if the active sequence contains video tracks
2. Uses **Video+Audio preset** if video is present
3. Uses **Audio-only preset** if only audio tracks exist
4. Exports to:
   - **EXPORTS folder** (default) - Located at the same level as the PROJET folder
   - **Downloads folder** - When the checkbox is enabled

## Installation

### macOS

1. Download or clone this repository
2. Open Terminal in the extension folder
3. Run the installation script:
   ```bash
   chmod +x install_mac.sh
   ./install_mac.sh
   ```
4. Restart Adobe Premiere Pro

### Windows

1. Download or clone this repository
2. Double-click `install_windows.bat`
3. Restart Adobe Premiere Pro

### Manual Installation

1. Copy the entire extension folder to:
   - **macOS**: `~/Library/Application Support/Adobe/CEP/extensions/com.cyrilg93.exportbutton`
   - **Windows**: `%APPDATA%\Adobe\CEP\extensions\com.cyrilg93.exportbutton`

2. Enable CEP debug mode:
   - **macOS**: Run in Terminal:
     ```bash
     defaults write com.adobe.CSXS.11 PlayerDebugMode 1
     ```
   - **Windows**: Run in Command Prompt (as Administrator):
     ```cmd
     reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1 /f
     ```

3. Restart Adobe Premiere Pro

## Usage

1. Open the panel: **Window > Extensions > Export Button**
2. Open a project with the expected folder structure
3. Select a sequence in the timeline
4. Click the export button

### Configure Presets

1. Click the settings button (gear icon)
2. Enter the path to your export presets (.epr files)
3. Click Save

**Default preset locations:**
- **macOS**: `/Applications/Adobe Media Encoder 2025/Adobe Media Encoder 2025.app/Contents/MediaIO/systempresets/`
- **Windows**: `C:\Program Files\Adobe\Adobe Media Encoder 2025\MediaIO\systempresets\`

## Requirements

- Adobe Premiere Pro 25.5 or later
- Adobe Media Encoder (same version)

## Author

**CyrilG93**
- GitHub: [@CyrilG93](https://github.com/CyrilG93)

## License

This project is licensed under the MIT License.
