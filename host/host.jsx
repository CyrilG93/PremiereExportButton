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

        // Simple check
        var hasVideo = false;
        if (seq.videoTracks && seq.videoTracks.numTracks > 0) {
            hasVideo = true;
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
 * EXPORT FILE - Simplified version (no complex path logic yet)
 */
function exportToAME(outputPath, presetPath) {
    try {
        var seq = app.project.activeSequence;

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
 * Verify if a preset file exists
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

/**
 * Get the EXPORTS folder path relative to the project
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
function getNextVersionedFilename(folderPath, baseName, extension) {
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
