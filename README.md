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
- **Adaptive panel** - Button and checkbox stay usable when the panel is heavily resized
- **Cross-platform** - Works on both macOS and Windows

## Interface

- **Export Button** (large square) - Exports sequences
- **Checkbox** - Enable to export to Fixed Folder instead of project folder
- **Settings** Configure all export options
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
Open Terminal.

**Easiest method (recommended):** drag and drop `install_mac.sh` into the Terminal window, then press Enter.

**Manual method (command line):**
```bash
cd /path/to/PremiereExportButton
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

## Changelog

### v1.1.13 (2026-03-30)
- **UI**: Vertical mode now sizes the button from the real panel width with a small fixed gutter instead of keeping a near-square width
- **UI**: The portrait export button can now grow with flex to fill the remaining panel height instead of staying locked to a short fixed height

### v1.1.12 (2026-03-30)
- **UI**: Restored the portrait layout trigger and dominant-direction fallback from `1.1.6`, which was the last version where vertical mode still activated reliably
- **UI**: Restored the full-width vertical button layout so portrait mode is visually distinct from the square mode again

### v1.1.11 (2026-03-30)
- **UI**: Vertical mode now switches earlier on narrow portrait panels instead of waiting for a larger safety margin
- **UI**: Vertical mode now uses smaller fixed button widths and tighter portrait spacing to stay inside very narrow panels

### v1.1.10 (2026-03-30)
- **UI**: Responsive sizing now measures the real inner content box of the panel instead of relying on the largest viewport value
- **UI**: Vertical mode now uses fixed portrait button widths and flex shrink guards so the button stays inside very narrow panels

### v1.1.9 (2026-03-30)
- **UI**: Vertical mode now uses the same compact sizing model as horizontal, but applied to panel width instead of height
- **UI**: Vertical fallback now waits for a truly narrow portrait panel before replacing the square layout

### v1.1.8 (2026-03-30)
- **UI**: Vertical mode now mirrors the horizontal compact sizing logic, but on the width axis
- **UI**: Vertical fallback now waits for a narrower portrait panel before replacing the square button

### v1.1.7 (2026-03-30)
- **UI**: Vertical mode now waits for a truly narrow portrait panel instead of replacing the square layout too early
- **UI**: The portrait button width is now capped with a safe margin so it fills the panel better without clipping

### v1.1.6 (2026-03-30)
- **UI**: Vertical layout now behaves like a compact fallback mode and hides secondary controls such as the settings button
- **UI**: The vertical export button now expands to the available panel width instead of staying artificially narrow

### v1.1.5 (2026-03-30)
- **UI**: Vertical mode now has priority on clearly portrait panel shapes instead of falling back to square too often
- **UI**: The vertical button is narrower and taller so the portrait layout is visually obvious

### v1.1.4 (2026-03-30)
- **UI**: The horizontal compact button now shrinks more with panel height to avoid overflowing the panel
- **UI**: Vertical mode now kicks in earlier on narrow panels and uses a taller button shape

### v1.1.3 (2026-03-30)
- **UI**: The panel now switches between square, horizontal, and vertical control layouts depending on the available space
- **UI**: Settings and debug log auto-hide in compact panel sizes so the export button and checkbox remain accessible
- **UI**: Reduced the minimum panel size to allow a much smaller docked panel

### v1.1.2 (2026-03-26)
- **Fix**: Export filenames now keep dots inside the sequence name by always sending Adobe a full filename with the real extension
- Example: `03 26 Aspire 4.0_Andreas` now exports as `03 26 Aspire 4.0_Andreas_V1`

### v1.1.1 (2026-02-09)
- **Fix**: Export now targets only the open timeline unless multiple sequences are selected
- Previously, having a single sequence selected in the project panel would export that sequence instead of the open timeline

### v1.1.0
- Added update notification banner
- Improved settings persistence
- Debug log hidden by default

### v1.0.10
- Fixed batch export on Windows
- Improved path normalization

### v1.0.9
- Fixed Premiere Direct export on macOS
- Improved error handling

### v1.0.8
- Added custom naming patterns with tokens
- Added date/time tokens support

### v1.0.7
- Added In/Out range export option
- Added folder depth setting

### v1.0.6
- Fixed direct export path issues
- Improved preset detection

### v1.0.5
- Added Premiere Direct export mode
- Added fixed folder option

### v1.0.4
- Added batch export for multiple sequences
- Improved Windows compatibility

### v1.0.2
- Added audio-only preset support
- Auto-detection of video/audio sequences

### v1.0.0
- Initial release
- Basic export functionality via AME

---

## License

MIT License
