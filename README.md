# Export Button for Adobe Premiere Pro 25.5

A simple CEP extension to quickly export sequences via Adobe Media Encoder.

![Premiere Pro](https://img.shields.io/badge/Premiere%20Pro-25.5%2B-9999FF)
![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows-lightgrey)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **One-click export** - Export the active sequence via Adobe Media Encoder
- **Batch export** - Select multiple sequences in the Project panel and export them all at once
- **Auto-detect** - Automatically uses batch mode when sequences are selected, or single mode for active sequence
- **Auto-start** - Exports start automatically without manual intervention
- **Smart versioning** - Files are automatically versioned (_V1, _V2, _V3...)
- **Download mode** - Option to export directly to Downloads folder
- **Dual presets** - Separate presets for Video+Audio and Audio-only sequences
- **Cross-platform** - Works on both macOS and Windows

## Interface

The panel features a minimal, compact interface:
- **Export Button** (large square) - Exports sequences
- **Checkbox** (below) - Enable to export to Downloads folder instead of project folder
- **Settings** (gear icon) - Configure export presets
- **Debug Panel** - Shows detailed logs for troubleshooting

## How It Works

### Single Export (Active Sequence)
1. Open a sequence in the timeline
2. Click the export button
3. The active sequence is exported with automatic versioning

### Batch Export (Multiple Sequences)
1. In the **Project panel**, select multiple sequences (Cmd/Ctrl+click)
2. Click the export button
3. All selected sequences are queued and exported together

The extension automatically detects if sequences are selected in the Project panel. If yes, it exports all of them. If nothing is selected, it exports the active sequence.

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

1. Detects if each sequence contains video clips (not just empty tracks)
2. Uses **Video+Audio preset** if video is present
3. Uses **Audio-only preset** if only audio exists
4. Automatically versions files (_V1, _V2, _V3...)
5. Exports to:
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
3. Either:
   - Select a sequence in the timeline (single export)
   - Select multiple sequences in the Project panel (batch export)
4. Click the export button

### Configure Presets

1. Click the settings button (gear icon)
2. Enter the path to your export presets (.epr files)
3. Click Save

**Default preset locations:**
- **macOS**: `/Applications/Adobe Media Encoder 2025/Adobe Media Encoder 2025.app/Contents/MediaIO/systempresets/`
- **Windows**: `C:\Program Files\Adobe\Adobe Media Encoder 2025\MediaIO\systempresets\`

## Requirements

- Adobe Premiere Pro 15.4 or later (batch export requires this version for `getCurrentProjectViewSelection` API)
- Adobe Media Encoder (same version)

## Troubleshooting

The built-in debug panel shows detailed logs. If you encounter issues:
1. Check the debug panel for error messages
2. Use the "Copy" button to copy logs
3. Common issues:
   - **Preset not found**: Check the preset path in Settings
   - **AME not available**: Ensure Adobe Media Encoder is installed
   - **Unknown exception**: Usually a path formatting issue on Windows

## Author

**CyrilG93**
- GitHub: [@CyrilG93](https://github.com/CyrilG93)

## License

This project is licensed under the MIT License.
