# Export Button for Adobe Premiere Pro

A simple CEP extension to quickly export sequences via Adobe Media Encoder.

![Premiere Pro](https://img.shields.io/badge/Premiere%20Pro-25.5%2B-9999FF)
![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows-lightgrey)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **One-click export** - Export the active sequence via Adobe Media Encoder
- **Batch export** - Select multiple sequences in the Project panel and export them all
- **Auto-detect** - Automatically uses batch mode when sequences are selected
- **Smart versioning** - Files are automatically versioned with customizable patterns
- **In/Out export** - Option to export only the In/Out range
- **Custom folders** - Configure export folder name and download location
- **Dual presets** - Separate presets for Video+Audio and Audio-only sequences
- **Cross-platform** - Works on both macOS and Windows

## Interface

The panel features a minimal, compact interface:
- **Export Button** (large square) - Exports sequences
- **Checkbox** (below) - Enable to export to Downloads/custom folder
- **Settings** (gear icon) - Configure all export options
- **Debug Panel** - Shows detailed logs for troubleshooting

## Settings

### Presets
- **Video + Audio Preset** - Path to .epr preset for video exports
- **Audio Only Preset** - Path to .epr preset for audio-only exports

### File Naming
- **Suffix Pattern** - Customize filename suffix with tokens:
  - `{V}` = Version number (1, 2, 3...)
  - `{DATE}` = Current date (YYYY-MM-DD)
  - `{TIME}` = Current time (HH-MM)
  - `{SEQ}` = Sequence name
- Examples:
  - `_V{V}` → `SequenceName_V1.mp4` (default)
  - `_{DATE}` → `SequenceName_2026-01-09.mp4`
  - `_V{V}_{DATE}` → `SequenceName_V1_2026-01-09.mp4`

### Export Options
- **Export In/Out range only** - When enabled, exports only the portion between In and Out points

### Folders
- **Export Folder Name** - Name of the export folder relative to project (default: `EXPORTS`)
- **Download Location** - Custom path when checkbox is enabled (leave empty for default Downloads)

## How It Works

### Single Export
1. Open a sequence in the timeline
2. Click the export button
3. The active sequence is exported with automatic versioning

### Batch Export
1. In the **Project panel**, select multiple sequences (Cmd/Ctrl+click)
2. Click the export button
3. All selected sequences are queued and exported together

## Project Structure

The extension expects this project structure:
```
00 00 PROJECT_NAME/
├── EXPORTS/          ← Default export destination (customizable)
└── PROJET/
    └── Project.prproj
```

## Installation

### macOS
```bash
chmod +x install_mac.sh
./install_mac.sh
```

### Windows
Double-click `install_windows.bat`

## Requirements

- Adobe Premiere Pro 15.4 or later
- Adobe Media Encoder (same version)

## Troubleshooting

The built-in debug panel shows detailed logs. Common issues:
- **Preset not found**: Check the preset path in Settings
- **AME not available**: Ensure Adobe Media Encoder is installed
- **Unknown exception**: Usually a path formatting issue on Windows

## Author

**CyrilG93** - [@CyrilG93](https://github.com/CyrilG93)

## License

MIT License
