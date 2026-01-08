/**
 * Premiere Pro ExtendScript for Export Button
 * Handles export to Adobe Media Encoder
 * 
 * @author CyrilG93
 * @version 1.0.0
 */

/**
 * Get system information (OS and Downloads folder path)
 * @returns {string} JSON string with system info
 */
function getSystemInfo() {
    try {
        var isWindows = $.os.indexOf("Windows") !== -1;
        var downloadsPath = "";

        if (isWindows) {
            // Windows Downloads folder
            downloadsPath = Folder.myDocuments.parent.fsName + "\\Downloads";
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
 * Get active sequence information
 * @returns {string} JSON string with sequence info
 */
function getActiveSequence() {
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
 * Check if the active sequence contains video clips
 * @returns {string} JSON string with hasVideo boolean
 */
function hasVideoTracks() {
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

        // Check all video tracks for clips
        for (var i = 0; i < seq.videoTracks.numTracks; i++) {
            var track = seq.videoTracks[i];
            if (track.clips && track.clips.numItems > 0) {
                hasVideo = true;
                break;
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
 * Get the EXPORTS folder path relative to the project
 * Project structure expected:
 * 00 00 NOMPROJET/
 *   EXPORTS/
 *   PROJET/
 *     projet.prproj
 * 
 * @returns {string} JSON string with exports path
 */
function getProjectExportsPath() {
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

        // Normalize path separators
        var normalizedPath = projectPath.replace(/\\/g, "/").replace(/\//g, separator);

        // Split path into parts
        var pathParts = normalizedPath.split(separator);

        // Remove empty parts and the file name
        var cleanParts = [];
        for (var i = 0; i < pathParts.length; i++) {
            if (pathParts[i] && pathParts[i].length > 0) {
                cleanParts.push(pathParts[i]);
            }
        }

        // Remove the .prproj file
        cleanParts.pop();

        // Remove PROJET folder (go up one level)
        cleanParts.pop();

        // Add EXPORTS folder
        cleanParts.push("EXPORTS");

        // Rebuild path
        var exportsPath;
        if (isWindows) {
            exportsPath = cleanParts.join(separator);
        } else {
            exportsPath = separator + cleanParts.join(separator);
        }

        // Create folder if it doesn't exist
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
 * Get sequence name for output file
 * @returns {string} JSON string with sequence name
 */
function getSequenceName() {
    try {
        var seq = app.project.activeSequence;
        if (!seq) {
            return JSON.stringify({
                success: false,
                name: "",
                error: "No active sequence"
            });
        }

        // Clean the name for use as filename
        var cleanName = seq.name.replace(/[<>:"/\\|?*]/g, "_");

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
 * Export the active sequence via Adobe Media Encoder
 * @param {string} outputPath - Full path for output file (without extension)
 * @param {string} presetPath - Path to the .epr preset file
 * @returns {string} JSON string with result
 */
function exportToAME(outputPath, presetPath) {
    try {
        var seq = app.project.activeSequence;
        if (!seq) {
            return JSON.stringify({
                success: false,
                error: "No active sequence"
            });
        }

        // Validate preset exists
        var presetFile = new File(presetPath);
        if (!presetFile.exists) {
            return JSON.stringify({
                success: false,
                error: "Preset file not found: " + presetPath
            });
        }

        // Queue the export to Adobe Media Encoder
        // Parameters: sequence, outputPath, presetPath, workAreaType, removeOnCompletion
        // workAreaType: 0 = entire sequence, 1 = in/out points, 2 = work area
        var jobID = app.encoder.encodeSequence(
            seq,
            outputPath,
            presetPath,
            0,  // Entire sequence
            0   // Don't remove on completion
        );

        if (jobID) {
            // Start the render queue immediately
            app.encoder.startBatch();

            return JSON.stringify({
                success: true,
                jobID: jobID,
                message: "Export queued and started in Adobe Media Encoder"
            });
        } else {
            return JSON.stringify({
                success: false,
                error: "Failed to queue export"
            });
        }
    } catch (e) {
        return JSON.stringify({
            success: false,
            error: e.toString()
        });
    }
}

/**
 * Get available AME presets from system
 * @returns {string} JSON string with preset paths
 */
function getDefaultPresetPaths() {
    try {
        var isWindows = $.os.indexOf("Windows") !== -1;
        var presetPaths = [];

        if (isWindows) {
            // Windows preset locations
            var userPresetsBase = Folder.myDocuments.fsName + "\\Adobe\\Adobe Media Encoder";
            var userPresetsFolder = new Folder(userPresetsBase);

            // Check common system presets location
            var systemPresets = "C:\\Program Files\\Adobe\\Adobe Media Encoder 2025\\MediaIO\\systempresets";
            presetPaths.push({
                type: "system",
                path: systemPresets
            });

            if (userPresetsFolder.exists) {
                presetPaths.push({
                    type: "user",
                    path: userPresetsBase
                });
            }
        } else {
            // macOS preset locations
            var systemPresets = "/Applications/Adobe Media Encoder 2025/Adobe Media Encoder 2025.app/Contents/MediaIO/systempresets";
            var userPresets = Folder("~/Documents/Adobe/Adobe Media Encoder").fsName;

            presetPaths.push({
                type: "system",
                path: systemPresets
            });
            presetPaths.push({
                type: "user",
                path: userPresets
            });
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
 * Verify if a preset file exists
 * @param {string} presetPath - Path to the preset file
 * @returns {string} JSON string with exists boolean
 */
function verifyPresetExists(presetPath) {
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
