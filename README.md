# Export Button for Adobe Premiere Pro

A powerful CEP extension for quick, customizable exports via Adobe Media Encoder.

![Premiere Pro](https://img.shields.io/badge/Premiere%20Pro-15.4%2B-9999FF)
![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows-lightgrey)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **One-click export** - Export the active sequence via Adobe Media Encoder
- **Batch export** - Select multiple sequences in the Project panel and export them all
- **Smart detection** - Automatically uses batch mode when sequences are selected
- **Customizable naming** - Full control over filename with tokens
- **In/Out export** - Option to export only the marked range
- **Folder depth** - Choose how far up from the project to create the export folder
- **Fixed folder** - Export to a specific folder when needed
- **Dual presets** - Separate presets for Video+Audio and Audio-only sequences
- **Cross-platform** - Works on both macOS and Windows

## Interface

- **Export Button** (large square) - Exports sequences
- **Checkbox** - Enable to export to Fixed Folder instead of project folder
- **Settings** (gear icon) - Configure all export options
- **Debug Panel** - Shows detailed logs for troubleshooting

---

## Settings

### Presets
| Setting | Description |
|---------|-------------|
| **Video + Audio Preset** | Path to .epr preset for video exports |
| **Audio Only Preset** | Path to .epr preset for audio-only exports |

**System Presets Location:**
| Platform | Path |
|----------|------|
| **macOS** | `/Applications/Adobe Media Encoder 2025/Adobe Media Encoder 2025.app/Contents/MediaIO/systempresets/` |
| **Windows** | `C:\Program Files\Adobe\Adobe Media Encoder 2025\MediaIO\systempresets\` |

**Custom Presets Location:**
| Platform | Path |
|----------|------|
| **macOS** | `~/Documents/Adobe/Adobe Media Encoder/2025/Presets/` |
| **Windows** | `C:\Users\<username>\Documents\Adobe\Adobe Media Encoder\2025\Presets\` |

### File Naming
| Setting | Description |
|---------|-------------|
| **Naming Pattern** | Full filename pattern with tokens (default: `{SEQ}_V{V}`) |

**Available Tokens:**
| Token | Example (Sequence: "MyEdit", Version: 3) |
|-------|------------------------------------------|
| `{SEQ}` | MyEdit |
| `{V}` | 3 |
| `{VV}` | 03 (zero-padded to 2 digits) |
| `{VVV}` | 003 (zero-padded to 3 digits) |
| `{DATE}` | 2026-01-09 |
| `{TIME}` | 16-15 |

**Pattern Examples:**
```
{SEQ}_V{V}        → MyEdit_V1.mp4
{SEQ}_V{VV}       → MyEdit_V01.mp4
{DATE}_{SEQ}      → 2026-01-09_MyEdit.mp4
{SEQ}_{DATE}_V{V} → MyEdit_2026-01-09_V1.mp4
```

### Export Options
| Setting | Description |
|---------|-------------|
| **Export In/Out range only** | Export only between In and Out points |
| **Export directly in Premiere** | Render directly in Premiere Pro instead of sending to Media Encoder |

#### Direct Premiere Export

When enabled, the sequence renders directly within Premiere Pro using `exportAsMediaDirect()` instead of being sent to Adobe Media Encoder.

**Benefits:**
- Faster for single exports (no AME queue)
- No need to have Media Encoder running

**Limitations:**
- ⚠️ **Not compatible with batch export** - Only the active timeline is exported
- Extension detection is based on preset name (see below)

**Preset Extension Detection:**

Since Premiere's direct export doesn't auto-detect the file format from presets, the extension is inferred from the preset name:

| Preset Name Contains | Extension |
|---------------------|-----------|
| H.264, H264, HEVC, H.265, YouTube, Vimeo, Facebook, Twitter | `.mp4` |
| ProRes, QuickTime, Apple | `.mov` |
| DNxHD, DNxHR, MXF | `.mxf` |
| AVI | `.avi` |
| WebM, VP9, VP8 | `.webm` |
| WAV, Wave | `.wav` |
| AIFF | `.aiff` |
| MP3 | `.mp3` |
| AAC | `.aac` |
| *(fallback)* | `.mp4` (video) or `.wav` (audio) |

> **Note:** If your preset name doesn't match any pattern, rename it to include the format (e.g., "My Preset ProRes.epr").

### Folders
| Setting | Description |
|---------|-------------|
| **Export Folder Name** | Name of the export folder (default: `EXPORTS`) |
| **Folder Depth** | How many folders to go up from the project file |
| **Fixed Folder** | Absolute path when checkbox is enabled (leave empty for Downloads) |

---

## Folder Depth Explained

The **Folder Depth** setting controls where the export folder is created relative to your project file:

```
Project: /Movies/Client/PROJET/project.prproj

Depth 0 → /Movies/Client/PROJET/EXPORTS/     (beside project)
Depth 1 → /Movies/Client/EXPORTS/            (one folder up)
Depth 2 → /Movies/EXPORTS/                   (two folders up)
```

**Typical workflow structure:**
```
00 00 PROJECT_NAME/
├── EXPORTS/          ← Created with Depth 1
└── PROJET/
    └── Project.prproj
```

---

## How It Works

### Single Export
1. Open a sequence in the timeline
2. Click the export button
3. The active sequence is exported with automatic versioning

### Batch Export
1. In the **Project panel**, select multiple sequences (Cmd/Ctrl+click)
2. Click the export button
3. All selected sequences are queued and exported together

---

## Installation

### macOS
```bash
chmod +x install_mac.sh
./install_mac.sh
```

### Windows
Double-click `install_windows.bat`

---

## Requirements

- Adobe Premiere Pro 15.4 or later
- Adobe Media Encoder (same version)

---

## Troubleshooting

The built-in debug panel shows detailed logs. Common issues:

| Issue | Solution |
|-------|----------|
| **Preset not found** | Check the preset path in Settings |
| **AME not available** | Ensure Adobe Media Encoder is installed |
| **Unknown exception** | Usually a path issue on Windows - check debug log |
| **No active sequence** | Open a sequence in the timeline or select in Project panel |

---

## Author

**CyrilG93** - [@CyrilG93](https://github.com/CyrilG93)

## License

MIT License
