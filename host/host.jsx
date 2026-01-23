/**
 * Premiere Pro ExtendScript for Export Button
 * Handles export to Adobe Media Encoder
 * 
 * @author CyrilG93
 * @version 1.0.9
 */

/**
 * Get system information (OS and Downloads folder path)
 * @returns {string} JSON string with system info
 */
function ExportButton_getSystemInfo() {
    try {
        var isWindows = $.os.indexOf("Windows") !== -1;
        var downloadsPath = "";

        if (isWindows) {
            // Windows: Use USERPROFILE environment variable
            var userProfile = $.getenv("USERPROFILE");
            downloadsPath = userProfile + "\\Downloads";
        } else {
            // macOS Downloads folder
            downloadsPath = Folder("~/Downloads").fsName;
        }

        return JSON.stringify({
            isWindows: isWindows,
            downloadsPath: downloadsPath,
            separator: isWindows ? "\\" : "/"
        });
    } catch (e) {
        return JSON.stringify({
            error: e.toString()
        });
    }
}

/**
 * Get available AME presets from system
 * @returns {string} JSON string with preset paths
 */
function ExportButton_getDefaultPresetPaths() {
    try {
        var isWindows = $.os.indexOf("Windows") !== -1;
        var presetPaths = [];

        if (isWindows) {
            // Windows preset locations
            var userProfile = $.getenv("USERPROFILE");
            var userPresetsBase = userProfile + "\\Documents\\Adobe\\Adobe Media Encoder";

            // Common system presets location (Program Files)
            var systemPresets = "C:\\Program Files\\Adobe\\Adobe Media Encoder 2025\\MediaIO\\systempresets";

            presetPaths.push({ type: "system", path: systemPresets });

            if (Folder(userPresetsBase).exists) {
                presetPaths.push({ type: "user", path: userPresetsBase });
            }
        } else {
            // macOS preset locations
            var systemPresets = "/Applications/Adobe Media Encoder 2025/Adobe Media Encoder 2025.app/Contents/MediaIO/systempresets";
            var userPresets = Folder("~/Documents/Adobe/Adobe Media Encoder").fsName;

            presetPaths.push({ type: "system", path: systemPresets });
            presetPaths.push({ type: "user", path: userPresets });
        }

        return JSON.stringify({
            success: true,
            presetPaths: presetPaths
        });
    } catch (e) {
        return JSON.stringify({
            success: false,
            error: e.toString()
        });
    }
}

/**
 * Get active sequence information
 * @returns {string} JSON string with sequence info
 */
function ExportButton_getActiveSequence() {
    try {
        if (!app.project) {
            return JSON.stringify({
                success: false,
                error: "No project open"
            });
        }

        var seq = app.project.activeSequence;
        if (!seq) {
            return JSON.stringify({
                success: false,
                error: "No active sequence"
            });
        }

        return JSON.stringify({
            success: true,
            name: seq.name,
            id: seq.sequenceID
        });
    } catch (e) {
        return JSON.stringify({
            success: false,
            error: e.toString()
        });
    }
}

/**
 * Get sequences selected in the Project panel
 * Uses app.getCurrentProjectViewSelection() (Premiere Pro 15.4+)
 * @returns {string} JSON string with array of selected sequences
 */
function ExportButton_getSelectedSequences() {
    try {
        if (!app.project) {
            return JSON.stringify({
                success: false,
                sequences: [],
                count: 0,
                error: "No project open"
            });
        }

        // Get currently selected items in Project panel
        // This API was added in Premiere Pro 15.4
        // On Windows, this API can sometimes hang - we wrap in extra safety
        var selectedItems = null;

        // Check if the function exists first
        if (typeof app.getCurrentProjectViewSelection !== 'function') {
            // Fallback for older versions - not supported
            return JSON.stringify({
                success: true,
                sequences: [],
                count: 0,
                error: "Batch export requires Premiere Pro 15.4 or later"
            });
        }

        // Try to get selection - wrap in its own try-catch
        try {
            selectedItems = app.getCurrentProjectViewSelection();
        } catch (selectionError) {
            // Selection API failed - return empty (will fall back to active sequence)
            return JSON.stringify({
                success: true,
                sequences: [],
                count: 0,
                error: "Selection API error: " + selectionError.toString()
            });
        }

        // Verify we got a valid result
        if (!selectedItems || typeof selectedItems.length === 'undefined') {
            return JSON.stringify({
                success: true,
                sequences: [],
                count: 0
            });
        }

        if (selectedItems.length === 0) {
            return JSON.stringify({
                success: true,
                sequences: [],
                count: 0
            });
        }

        var sequences = [];

        // Filter only sequences from selected items
        for (var i = 0; i < selectedItems.length; i++) {
            var item = selectedItems[i];

            // Check if item is a sequence
            // ProjectItem.isSequence() returns true for sequence items
            try {
                if (item && typeof item.isSequence === 'function' && item.isSequence()) {
                    sequences.push({
                        name: item.name,
                        nodeId: item.nodeId || "",
                        treePath: item.treePath || ""
                    });
                }
            } catch (itemError) {
                // Skip this item if there's an issue checking it
                continue;
            }
        }

        return JSON.stringify({
            success: true,
            sequences: sequences,
            count: sequences.length
        });

    } catch (e) {
        return JSON.stringify({
            success: false,
            sequences: [],
            count: 0,
            error: e.toString()
        });
    }
}

/**
 * Check if the active sequence contains visible video clips
 * A track with clips but muted/hidden counts as no video for export purposes
 * @returns {string} JSON string with hasVideo boolean
 */
function ExportButton_hasVideoTracks() {
    try {
        var seq = app.project.activeSequence;
        if (!seq) {
            return JSON.stringify({
                success: false,
                hasVideo: false,
                error: "No active sequence"
            });
        }

        var hasVideo = false;

        // Loop through video tracks to see if any have visible clips
        if (seq.videoTracks) {
            for (var i = 0; i < seq.videoTracks.numTracks; i++) {
                var track = seq.videoTracks[i];

                // Check if track has clips
                if (track.clips && track.clips.numItems > 0) {
                    // Check if track is visible (not muted)
                    // isMuted() returns true if track output is disabled
                    var isMuted = false;
                    if (typeof track.isMuted === 'function') {
                        isMuted = track.isMuted();
                    }

                    // If track has clips AND is not muted, we have visible video
                    if (!isMuted) {
                        hasVideo = true;
                        break;
                    }
                }
            }
        }

        return JSON.stringify({
            success: true,
            hasVideo: hasVideo
        });
    } catch (e) {
        return JSON.stringify({
            success: false,
            hasVideo: false,
            error: e.toString()
        });
    }
}

/**
 * Get sequence name for output file
 * @returns {string} JSON string with sequence name
 */
function ExportButton_getSequenceName() {
    try {
        var seq = app.project.activeSequence;
        if (!seq) {
            return JSON.stringify({
                success: false,
                name: "",
                error: "No active sequence"
            });
        }

        // Clean name - very simple regex
        var cleanName = seq.name;

        return JSON.stringify({
            success: true,
            name: cleanName
        });
    } catch (e) {
        return JSON.stringify({
            success: false,
            name: "",
            error: e.toString()
        });
    }
}

/**
 * EXPORT FILE - With Windows path normalization
 */
function ExportButton_exportToAME(outputPath, presetPath) {
    try {
        // Check if encoder is available
        if (!app.encoder) {
            return JSON.stringify({
                success: false,
                error: "Adobe Media Encoder not available. Please ensure AME is installed."
            });
        }

        var seq = app.project.activeSequence;
        if (!seq) {
            return JSON.stringify({
                success: false,
                error: "No active sequence"
            });
        }

        // Normalize paths for Windows (convert forward slashes to backslashes)
        var isWindows = $.os.indexOf("Windows") !== -1;
        if (isWindows) {
            outputPath = outputPath.replace(/\//g, "\\");
            presetPath = presetPath.replace(/\//g, "\\");
        }

        // Verify preset file exists
        var presetFile = new File(presetPath);
        if (!presetFile.exists) {
            return JSON.stringify({
                success: false,
                error: "Preset file not found: " + presetPath
            });
        }

        // Queue the export to Adobe Media Encoder
        var jobID = app.encoder.encodeSequence(
            seq,
            outputPath,
            presetPath,
            0,  // Entire sequence
            0   // Don't remove on completion
        );

        if (jobID) {
            app.encoder.startBatch();
            return JSON.stringify({
                success: true,
                jobID: jobID,
                message: "Export started"
            });
        } else {
            return JSON.stringify({
                success: false,
                error: "Failed to queue export. Check if AME is running."
            });
        }
    } catch (e) {
        // More detailed error info
        var errorDetails = e.toString();
        if (e.message) {
            errorDetails = e.message;
        }
        if (e.line) {
            errorDetails += " (line " + e.line + ")";
        }
        return JSON.stringify({
            success: false,
            error: errorDetails
        });
    }
}

/**
 * Find a sequence by name in the project
 * @param {string} sequenceName - Name of the sequence to find
 * @returns {Sequence|null} The sequence object or null
 */
function ExportButton_findSequenceByName(sequenceName) {
    if (!app.project || !app.project.sequences) {
        return null;
    }

    for (var i = 0; i < app.project.sequences.numSequences; i++) {
        var seq = app.project.sequences[i];
        if (seq.name === sequenceName) {
            return seq;
        }
    }
    return null;
}

/**
 * Check if a specific sequence has visible video clips
 * Muted/hidden video tracks count as no video for export preset selection
 * @param {string} sequenceName - Name of the sequence
 * @returns {string} JSON string with hasVideo boolean
 */
function ExportButton_hasVideoForSequence(sequenceName) {
    try {
        var seq = ExportButton_findSequenceByName(sequenceName);
        if (!seq) {
            return JSON.stringify({
                success: false,
                hasVideo: false,
                error: "Sequence not found: " + sequenceName
            });
        }

        var hasVideo = false;

        if (seq.videoTracks) {
            for (var i = 0; i < seq.videoTracks.numTracks; i++) {
                var track = seq.videoTracks[i];

                // Check if track has clips
                if (track.clips && track.clips.numItems > 0) {
                    // Check if track is visible (not muted)
                    var isMuted = false;
                    if (typeof track.isMuted === 'function') {
                        isMuted = track.isMuted();
                    }

                    // If track has clips AND is not muted, we have visible video
                    if (!isMuted) {
                        hasVideo = true;
                        break;
                    }
                }
            }
        }

        return JSON.stringify({
            success: true,
            hasVideo: hasVideo
        });
    } catch (e) {
        return JSON.stringify({
            success: false,
            hasVideo: false,
            error: e.toString()
        });
    }
}

/**
 * Export a specific sequence by name
 * @param {string} sequenceName - Name of the sequence to export
 * @param {string} outputPath - Full path for output file
 * @param {string} presetPath - Path to the preset file
 * @returns {string} JSON string with result
 */
function ExportButton_exportSequenceByName(sequenceName, outputPath, presetPath) {
    try {
        // Check if encoder is available
        if (!app.encoder) {
            return JSON.stringify({
                success: false,
                error: "Adobe Media Encoder not available"
            });
        }

        // Find the sequence
        var seq = ExportButton_findSequenceByName(sequenceName);
        if (!seq) {
            return JSON.stringify({
                success: false,
                error: "Sequence not found: " + sequenceName
            });
        }

        // Normalize paths for Windows
        var isWindows = $.os.indexOf("Windows") !== -1;
        if (isWindows) {
            outputPath = outputPath.replace(/\//g, "\\");
            presetPath = presetPath.replace(/\//g, "\\");
        }

        // Verify preset file exists
        var presetFile = new File(presetPath);
        if (!presetFile.exists) {
            return JSON.stringify({
                success: false,
                error: "Preset file not found: " + presetPath
            });
        }

        // Queue the export
        var jobID = app.encoder.encodeSequence(
            seq,
            outputPath,
            presetPath,
            0,  // Entire sequence
            0   // Don't remove on completion
        );

        if (jobID) {
            // Don't start batch yet - we'll start after all sequences are queued
            return JSON.stringify({
                success: true,
                jobID: jobID,
                sequenceName: sequenceName
            });
        } else {
            return JSON.stringify({
                success: false,
                error: "Failed to queue: " + sequenceName
            });
        }
    } catch (e) {
        var errorDetails = e.toString();
        if (e.message) {
            errorDetails = e.message;
        }
        return JSON.stringify({
            success: false,
            error: errorDetails
        });
    }
}

/**
 * Start the AME batch (call after queueing all sequences)
 */
function ExportButton_startAMEBatch() {
    try {
        if (app.encoder) {
            app.encoder.startBatch();
            return JSON.stringify({ success: true });
        } else {
            return JSON.stringify({ success: false, error: "AME not available" });
        }
    } catch (e) {
        return JSON.stringify({ success: false, error: e.toString() });
    }
}

/**
 * Verify if a preset file exists
 */
function ExportButton_verifyPresetExists(presetPath) {
    try {
        var presetFile = new File(presetPath);
        return JSON.stringify({
            exists: presetFile.exists,
            path: presetPath
        });
    } catch (e) {
        return JSON.stringify({
            exists: false,
            error: e.toString()
        });
    }
}

/**
 * Get the EXPORTS folder path relative to the project
 */
function ExportButton_getProjectExportsPath() {
    try {
        if (!app.project || !app.project.path) {
            return JSON.stringify({
                success: false,
                path: "",
                error: "No project path available"
            });
        }

        var projectPath = app.project.path;
        var isWindows = $.os.indexOf("Windows") !== -1;
        var separator = isWindows ? "\\" : "/";

        // Simple string manipulation instead of regex
        var parentPath = new File(projectPath).parent.fsName;

        // Check for PROJET folder
        var parentFolder = new Folder(parentPath);
        if (parentFolder.name === "PROJET") {
            // Go up one level
            parentPath = parentFolder.parent.fsName;
        }

        var exportsPath = parentPath + separator + "EXPORTS";

        // Create folder
        var exportsFolder = new Folder(exportsPath);
        if (!exportsFolder.exists) {
            exportsFolder.create();
        }

        return JSON.stringify({
            success: true,
            path: exportsPath
        });
    } catch (e) {
        return JSON.stringify({
            success: false,
            path: "",
            error: e.toString()
        });
    }
}

/**
 * Get next versioned filename
 * Format: NAME_V1.ext
 */
function ExportButton_getNextVersionedFilename(folderPath, baseName, extension) {
    try {
        var folder = new Folder(folderPath);
        var isWindows = $.os.indexOf("Windows") !== -1;
        var separator = isWindows ? "\\" : "/";

        if (!folder.exists) {
            return JSON.stringify({
                success: true,
                version: 1,
                filename: baseName + "_V1",
                fullPath: folderPath + separator + baseName + "_V1"
            });
        }

        var files = folder.getFiles();
        var maxVer = 0;

        // Simple loop
        for (var i = 0; i < files.length; i++) {
            var f = files[i];
            if (f instanceof File) {
                var name = decodeURI(f.name); // decodeURI to handle special chars
                var nameLower = name.toLowerCase();
                var baseLower = baseName.toLowerCase();

                // Check if starts with baseName_V
                if (nameLower.indexOf(baseLower + "_v") === 0) {
                    // Extract version number
                    var rest = name.substring(baseName.length + 2); // after _V
                    var dotIdx = rest.lastIndexOf(".");
                    var verStr = "";

                    if (dotIdx > 0) {
                        verStr = rest.substring(0, dotIdx);
                    } else {
                        verStr = rest;
                    }

                    var num = parseInt(verStr);
                    if (!isNaN(num) && num > maxVer) {
                        maxVer = num;
                    }
                }
            }
        }

        var nextVer = maxVer + 1;
        var finalName = baseName + "_V" + nextVer;

        return JSON.stringify({
            success: true,
            version: nextVer,
            filename: finalName,
            fullPath: folderPath + separator + finalName
        });

    } catch (e) {
        return JSON.stringify({
            success: false,
            error: e.toString()
        });
    }
}

/**
 * Get next version number based on custom suffix pattern
 * Looks for files matching baseName + pattern where {V} is a number
 * @param {string} folderPath - Path to search
 * @param {string} baseName - Base filename
 * @param {string} extension - File extension
 * @param {string} suffixPattern - Pattern like "_V{V}" or "_{DATE}_{V}"
 */
function ExportButton_getNextVersionedFilenameWithPattern(folderPath, baseName, extension, suffixPattern) {
    try {
        var folder = new Folder(folderPath);
        var isWindows = $.os.indexOf("Windows") !== -1;
        var separator = isWindows ? "\\" : "/";

        if (!folder.exists) {
            return JSON.stringify({
                success: true,
                version: 1
            });
        }

        var files = folder.getFiles();
        var maxVer = 0;

        // Look for files that start with baseName
        for (var i = 0; i < files.length; i++) {
            var f = files[i];
            if (f instanceof File) {
                var name = decodeURI(f.name);
                var nameLower = name.toLowerCase();
                var baseLower = baseName.toLowerCase();

                // Check if file starts with baseName
                if (nameLower.indexOf(baseLower) === 0) {
                    // Extract the suffix part (after baseName, before extension)
                    var rest = name.substring(baseName.length);
                    var dotIdx = rest.lastIndexOf(".");
                    if (dotIdx > 0) {
                        rest = rest.substring(0, dotIdx);
                    }

                    // Try to find a version number in the suffix
                    // Look for patterns like _V1, _V2, _V10, etc.
                    var vMatch = rest.match(/_V(\d+)/i);
                    if (vMatch && vMatch[1]) {
                        var num = parseInt(vMatch[1]);
                        if (!isNaN(num) && num > maxVer) {
                            maxVer = num;
                        }
                    }
                }
            }
        }

        return JSON.stringify({
            success: true,
            version: maxVer + 1
        });

    } catch (e) {
        return JSON.stringify({
            success: false,
            version: 1,
            error: e.toString()
        });
    }
}

/**
 * Get exports path with custom folder name
 * @param {string} customFolderName - Name of the export folder (default: "EXPORTS")
 */
function ExportButton_getProjectExportsPathCustom(customFolderName) {
    try {
        if (!customFolderName) {
            customFolderName = "EXPORTS";
        }

        if (!app.project || !app.project.path) {
            return JSON.stringify({
                success: false,
                path: "",
                error: "No project path available"
            });
        }

        var projectPath = app.project.path;
        var isWindows = $.os.indexOf("Windows") !== -1;
        var separator = isWindows ? "\\" : "/";

        var parentPath = new File(projectPath).parent.fsName;

        // Check for PROJET folder
        var parentFolder = new Folder(parentPath);
        if (parentFolder.name === "PROJET") {
            parentPath = parentFolder.parent.fsName;
        }

        var exportsPath = parentPath + separator + customFolderName;

        // Create folder if needed
        var exportsFolder = new Folder(exportsPath);
        if (!exportsFolder.exists) {
            exportsFolder.create();
        }

        return JSON.stringify({
            success: true,
            path: exportsPath
        });
    } catch (e) {
        return JSON.stringify({
            success: false,
            path: "",
            error: e.toString()
        });
    }
}

/**
 * Get exports path with custom folder name and depth
 * @param {string} customFolderName - Name of the export folder
 * @param {number} depth - How many folders to go up (0 = beside project, 1 = one up, etc.)
 */
function ExportButton_getProjectExportsPathWithDepth(customFolderName, depth) {
    try {
        if (!customFolderName) {
            customFolderName = "EXPORTS";
        }
        if (isNaN(depth) || depth < 0) {
            depth = 0;
        }

        if (!app.project || !app.project.path) {
            return JSON.stringify({
                success: false,
                path: "",
                error: "No project path available"
            });
        }

        var projectPath = app.project.path;
        var isWindows = $.os.indexOf("Windows") !== -1;
        var separator = isWindows ? "\\" : "/";

        // Start from project file's parent folder
        var currentFolder = new File(projectPath).parent;

        // Go up by 'depth' folders
        for (var i = 0; i < depth; i++) {
            if (currentFolder.parent) {
                currentFolder = currentFolder.parent;
            }
        }

        var basePath = currentFolder.fsName;
        var exportsPath = basePath + separator + customFolderName;

        // Create folder if needed
        var exportsFolder = new Folder(exportsPath);
        if (!exportsFolder.exists) {
            exportsFolder.create();
        }

        return JSON.stringify({
            success: true,
            path: exportsPath
        });
    } catch (e) {
        return JSON.stringify({
            success: false,
            path: "",
            error: e.toString()
        });
    }
}

/**
 * Export with options (In/Out support)
 * @param {string} outputPath - Output file path
 * @param {string} presetPath - Preset file path
 * @param {boolean} useInOut - If true, export only In/Out range
 */
function ExportButton_exportToAMEWithOptions(outputPath, presetPath, useInOut) {
    try {
        if (!app.encoder) {
            return JSON.stringify({
                success: false,
                error: "Adobe Media Encoder not available"
            });
        }

        var seq = app.project.activeSequence;
        if (!seq) {
            return JSON.stringify({
                success: false,
                error: "No active sequence"
            });
        }

        // Normalize paths for Windows
        var isWindows = $.os.indexOf("Windows") !== -1;
        if (isWindows) {
            outputPath = outputPath.replace(/\//g, "\\");
            presetPath = presetPath.replace(/\//g, "\\");
        }

        // Verify preset
        var presetFile = new File(presetPath);
        if (!presetFile.exists) {
            return JSON.stringify({
                success: false,
                error: "Preset file not found: " + presetPath
            });
        }

        // encodeSequence parameter: 0 = entire sequence, 1 = work area (In/Out)
        var rangeType = useInOut ? 1 : 0;

        var jobID = app.encoder.encodeSequence(
            seq,
            outputPath,
            presetPath,
            rangeType,
            0
        );

        if (jobID) {
            app.encoder.startBatch();
            return JSON.stringify({
                success: true,
                jobID: jobID,
                message: "Export started"
            });
        } else {
            return JSON.stringify({
                success: false,
                error: "Failed to queue export"
            });
        }
    } catch (e) {
        var errorDetails = e.toString();
        if (e.message) {
            errorDetails = e.message;
        }
        return JSON.stringify({
            success: false,
            error: errorDetails
        });
    }
}

/**
 * Export directly in Premiere Pro (without Adobe Media Encoder)
 * Uses sequence.exportAsMediaDirect() method
 * @param {string} outputPath - Output file path
 * @param {string} presetPath - Preset file path
 * @param {boolean} useInOut - If true, export only In/Out range
 * @returns {string} JSON string with result
 */
function ExportButton_exportDirectInPremiere(outputPath, presetPath, useInOut) {
    try {
        var seq = app.project.activeSequence;
        if (!seq) {
            return JSON.stringify({
                success: false,
                error: "No active sequence"
            });
        }

        // Detect platform
        var isWindows = $.os.indexOf("Windows") !== -1;
        var isMac = !isWindows;

        // Normalize paths based on platform
        if (isWindows) {
            outputPath = outputPath.replace(/\//g, "\\");
            presetPath = presetPath.replace(/\//g, "\\");
        } else {
            // Mac: ensure forward slashes
            outputPath = outputPath.replace(/\\/g, "/");
            presetPath = presetPath.replace(/\\/g, "/");
        }

        // Verify preset file exists
        var presetFile = new File(presetPath);
        if (!presetFile.exists) {
            return JSON.stringify({
                success: false,
                error: "Preset file not found: " + presetPath
            });
        }

        // Create output directory if it doesn't exist
        var outputFile = new File(outputPath);
        var outputFolder = outputFile.parent;
        if (outputFolder && !outputFolder.exists) {
            outputFolder.create();
        }

        // workAreaType: 0 = entire sequence, 1 = in/out points
        var workAreaType = useInOut ? 1 : 0;

        // Check if exportAsMediaDirect exists
        if (typeof seq.exportAsMediaDirect !== 'function') {
            return JSON.stringify({
                success: false,
                error: "exportAsMediaDirect not available - requires Premiere Pro 15.4+"
            });
        }

        // exportAsMediaDirect renders directly in Premiere without sending to AME
        // Note: Return value is unreliable on Mac - may return false even on success
        var result = seq.exportAsMediaDirect(outputPath, presetPath, workAreaType);

        // Check if file was created (more reliable than return value on Mac)
        $.sleep(500); // Brief wait for file system
        var exportedFile = new File(outputPath);
        var fileCreated = exportedFile.exists;

        if (result === true || fileCreated) {
            return JSON.stringify({
                success: true,
                message: "Export completed",
                fileExists: fileCreated
            });
        } else {
            var errorMsg = "Export failed";
            if (isMac) {
                errorMsg = "Direct export failed on Mac. Try disabling Premiere Direct option.";
            } else {
                errorMsg = "Export failed - check preset compatibility";
            }
            return JSON.stringify({
                success: false,
                error: errorMsg,
                platform: isMac ? "mac" : "windows"
            });
        }
    } catch (e) {
        var errorDetails = e.toString();
        if (e.message) {
            errorDetails = e.message;
        }
        var isMac = $.os.indexOf("Windows") === -1;
        if (isMac) {
            errorDetails += " [Mac: Try using AME instead]";
        }
        return JSON.stringify({
            success: false,
            error: errorDetails
        });
    }
}
