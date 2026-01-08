#!/bin/bash
# Installation script for Export Button - macOS
# Author: CyrilG93
# Version: 1.0.0

echo "========================================"
echo "  Export Button - Installation macOS"
echo "========================================"
echo ""

# Define paths
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXTENSION_NAME="com.cyrilg93.exportbutton"
CEP_EXTENSIONS_DIR="$HOME/Library/Application Support/Adobe/CEP/extensions"

# Create CEP extensions directory if it doesn't exist
if [ ! -d "$CEP_EXTENSIONS_DIR" ]; then
    echo "Creating CEP extensions directory..."
    mkdir -p "$CEP_EXTENSIONS_DIR"
fi

# Remove existing installation if present
TARGET_DIR="$CEP_EXTENSIONS_DIR/$EXTENSION_NAME"
if [ -d "$TARGET_DIR" ]; then
    echo "Removing existing installation..."
    rm -rf "$TARGET_DIR"
fi

# Copy extension files
echo "Copying extension files..."
cp -R "$SCRIPT_DIR" "$TARGET_DIR"

# Remove installation scripts from the installed copy
rm -f "$TARGET_DIR/install_mac.sh"
rm -f "$TARGET_DIR/install_windows.bat"
rm -rf "$TARGET_DIR/.git"
rm -f "$TARGET_DIR/.gitignore"
rm -f "$TARGET_DIR/README.md"

# Enable CEP debug mode (required for unsigned extensions)
echo "Enabling CEP debug mode..."
defaults write com.adobe.CSXS.10 PlayerDebugMode 1
defaults write com.adobe.CSXS.11 PlayerDebugMode 1
defaults write com.adobe.CSXS.12 PlayerDebugMode 1
defaults write com.adobe.CSXS.13 PlayerDebugMode 1
defaults write com.adobe.CSXS.14 PlayerDebugMode 1
defaults write com.adobe.CSXS.15 PlayerDebugMode 1

echo ""
echo "========================================"
echo "  Installation completed successfully!"
echo "========================================"
echo ""
echo "Please restart Adobe Premiere Pro to load the extension."
echo ""
echo "To access the extension:"
echo "  Window > Extensions > Export Button"
echo ""
