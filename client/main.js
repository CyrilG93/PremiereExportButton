/**
 * Premiere Pro Export Button - Main JavaScript
 * Handles UI interactions and export logic
 * 
 * @author CyrilG93
 * @version 1.0.8
 */

// Global CSInterface instance
var csInterface = new CSInterface();

// Storage keys
var STORAGE_KEYS = {
    VIDEO_PRESET: 'exportButton_videoPreset',
    AUDIO_PRESET: 'exportButton_audioPreset',
    DOWNLOAD_ENABLED: 'exportButton_downloadEnabled',
    SUFFIX_PATTERN: 'exportButton_suffixPattern',
    INOUT_EXPORT: 'exportButton_inoutExport',
    EXPORT_FOLDER: 'exportButton_exportFolder',
    FOLDER_DEPTH: 'exportButton_folderDepth',
    FIXED_FOLDER: 'exportButton_fixedFolder',
    PREMIERE_DIRECT: 'exportButton_premiereDirect'
};

// Default preset paths (will be updated based on OS)
var defaultPresets = {
    video: '',
    audio: ''
};

/**
 * Initialize the extension
 */
function init() {
    // Load saved settings
    loadSettings();

    // Setup event listeners
    setupEventListeners();

    // Set initial status
    // Set initial status
    // setStatus('Ready'); // Removed as requested

    // Log init
    debugLog('Extension initialized', 'info');

    // Wait a bit for Premiere to be ready, then test ExtendScript
    debugLog('Waiting 2s for Premiere Pro...', 'info');
    setTimeout(function () {
        // Test basic ExtendScript first
        testBasicExtendScript();
    }, 2000);
}

/**
 * Test the most basic ExtendScript operations
 */
function testBasicExtendScript() {
    debugLog('Testing basic ExtendScript...', 'info');

    // Test 1: Simple math (should always work)
    csInterface.evalScript('1+1', function (result) {
        debugLog('Test 1+1 = ' + result, result === '2' ? 'success' : 'error');

        if (result === '2') {
            // ExtendScript works, now load host.jsx
            loadJSX(function () {
                getSystemInfo();
                testExtendScript();
            });
        } else {
            debugLog('ExtendScript engine not responding!', 'error');
            debugLog('Please check: Window > Extensions > Export Button is from Premiere Pro (not another app)', 'error');
        }
    });
}

/**
 * Load the ExtendScript (jsx) file
 * @param {function} callback - Called after script is loaded
 */
function loadJSX(callback) {
    debugLog('Loading host.jsx...', 'info');

    var extensionPath = csInterface.getSystemPath(SystemPath.EXTENSION);
    var jsxPath = extensionPath + '/host/host.jsx';

    debugLog('JSX path: ' + jsxPath, 'info');

    // Use $.evalFile() to load the JSX file - this is the standard ExtendScript method
    var evalScript = '$.evalFile("' + jsxPath.replace(/\\/g, '/') + '")';
    debugLog('Running: ' + evalScript, 'info');

    csInterface.evalScript(evalScript, function (evalResult) {
        debugLog('evalFile result: ' + evalResult, evalResult && evalResult !== 'undefined' ? 'success' : 'error');
        if (callback) callback();
    });
}

/**
 * Debug log function
 * @param {string} message - Message to log
 * @param {string} type - Log type: 'info', 'error', 'success'
 */
function debugLog(message, type) {
    console.log('[' + type + '] ' + message);

    var logEl = document.getElementById('debug-log');
    if (!logEl) return;

    var entry = document.createElement('div');
    entry.className = 'log-entry log-' + (type || 'info');

    var timestamp = new Date().toLocaleTimeString();
    entry.textContent = '[' + timestamp + '] ' + message;

    logEl.appendChild(entry);
    logEl.scrollTop = logEl.scrollHeight;
}

/**
 * Test ExtendScript connection
 */
function testExtendScript() {
    debugLog('Testing ExtendScript connection...', 'info');

    csInterface.evalScript('typeof app', function (result) {
        debugLog('typeof app = ' + result, result === 'object' ? 'success' : 'error');
    });

    csInterface.evalScript('app.project ? "project exists" : "no project"', function (result) {
        debugLog('Project check: ' + result, 'info');
    });

    // Test if our functions are available
    csInterface.evalScript('typeof ExportButton_getActiveSequence', function (result) {
        debugLog('getActiveSequence available: ' + result, result === 'function' ? 'success' : 'error');
    });
}

/**
 * Load saved settings from localStorage
 */
function loadSettings() {
    var videoPreset = localStorage.getItem(STORAGE_KEYS.VIDEO_PRESET) || '';
    var audioPreset = localStorage.getItem(STORAGE_KEYS.AUDIO_PRESET) || '';
    var downloadEnabled = localStorage.getItem(STORAGE_KEYS.DOWNLOAD_ENABLED) === 'true';
    var suffixPattern = localStorage.getItem(STORAGE_KEYS.SUFFIX_PATTERN) || '{SEQ}_V{V}';
    var inoutExport = localStorage.getItem(STORAGE_KEYS.INOUT_EXPORT) === 'true';
    var exportFolder = localStorage.getItem(STORAGE_KEYS.EXPORT_FOLDER) || 'EXPORTS';
    var folderDepth = localStorage.getItem(STORAGE_KEYS.FOLDER_DEPTH) || '0';
    var fixedFolder = localStorage.getItem(STORAGE_KEYS.FIXED_FOLDER) || '';

    var premiereDirect = localStorage.getItem(STORAGE_KEYS.PREMIERE_DIRECT) === 'true';

    document.getElementById('video-preset').value = videoPreset;
    document.getElementById('audio-preset').value = audioPreset;
    document.getElementById('download-checkbox').checked = downloadEnabled;
    document.getElementById('suffix-pattern').value = suffixPattern;
    document.getElementById('inout-export').checked = inoutExport;
    document.getElementById('export-folder').value = exportFolder;
    document.getElementById('folder-depth').value = folderDepth;
    document.getElementById('fixed-folder').value = fixedFolder;
    document.getElementById('premiere-direct').checked = premiereDirect;
}

/**
 * Save settings to localStorage
 */
function saveSettings() {
    var videoPreset = document.getElementById('video-preset').value;
    var audioPreset = document.getElementById('audio-preset').value;
    var suffixPattern = document.getElementById('suffix-pattern').value || '{SEQ}_V{V}';
    var inoutExport = document.getElementById('inout-export').checked;
    var exportFolder = document.getElementById('export-folder').value || 'EXPORTS';
    var folderDepth = document.getElementById('folder-depth').value || '0';
    var fixedFolder = document.getElementById('fixed-folder').value;
    var premiereDirect = document.getElementById('premiere-direct').checked;

    localStorage.setItem(STORAGE_KEYS.VIDEO_PRESET, videoPreset);
    localStorage.setItem(STORAGE_KEYS.AUDIO_PRESET, audioPreset);
    localStorage.setItem(STORAGE_KEYS.SUFFIX_PATTERN, suffixPattern);
    localStorage.setItem(STORAGE_KEYS.INOUT_EXPORT, inoutExport);
    localStorage.setItem(STORAGE_KEYS.EXPORT_FOLDER, exportFolder);
    localStorage.setItem(STORAGE_KEYS.FOLDER_DEPTH, folderDepth);
    localStorage.setItem(STORAGE_KEYS.FIXED_FOLDER, fixedFolder);
    localStorage.setItem(STORAGE_KEYS.PREMIERE_DIRECT, premiereDirect);

    setStatus('Settings saved', 'success');
    closeSettingsModal();
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Export button
    document.getElementById('export-btn').addEventListener('click', handleExport);

    // Download checkbox
    document.getElementById('download-checkbox').addEventListener('change', function () {
        localStorage.setItem(STORAGE_KEYS.DOWNLOAD_ENABLED, this.checked);
    });

    // Settings button
    document.getElementById('settings-btn').addEventListener('click', openSettingsModal);

    // Close modal button
    document.getElementById('close-modal').addEventListener('click', closeSettingsModal);

    // Save settings button
    document.getElementById('save-settings').addEventListener('click', saveSettings);

    // Browse buttons
    document.querySelectorAll('.browse-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var targetId = this.getAttribute('data-target');
            browseForPreset(targetId);
        });
    });

    // Close modal on outside click
    document.getElementById('settings-modal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeSettingsModal();
        }
    });

    // Keyboard shortcut for escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeSettingsModal();
        }
    });


    // Clear log button
    document.getElementById('clear-log').addEventListener('click', function () {
        document.getElementById('debug-log').innerHTML = '';
        debugLog('Log cleared', 'info');
    });

    // Copy log button - use execCommand as clipboard API doesn't work in CEP
    document.getElementById('copy-log').addEventListener('click', function () {
        var logEl = document.getElementById('debug-log');
        var logText = logEl.innerText || logEl.textContent;

        // Create textarea, copy, and remove
        var textarea = document.createElement('textarea');
        textarea.value = logText;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            debugLog('Log copied!', 'success');
        } catch (err) {
            debugLog('Copy failed: ' + err, 'error');
        }

        document.body.removeChild(textarea);
    });

}

/**
 * Get system information from ExtendScript
 */
function getSystemInfo() {
    csInterface.evalScript('ExportButton_getSystemInfo()', function (result) {
        try {
            var info = JSON.parse(result);
            if (info.isWindows) {
                // Windows default preset paths
                defaultPresets.video = 'C:\\Program Files\\Adobe\\Adobe Media Encoder 2025\\MediaIO\\systempresets\\58444341_4d584658\\YouTube 1080p Full HD.epr';
                defaultPresets.audio = 'C:\\Program Files\\Adobe\\Adobe Media Encoder 2025\\MediaIO\\systempresets\\41494646_41494646\\WAV 48kHz 16 bit.epr';
            } else {
                // macOS default preset paths
                defaultPresets.video = '/Applications/Adobe Media Encoder 2025/Adobe Media Encoder 2025.app/Contents/MediaIO/systempresets/58444341_4d584658/YouTube 1080p Full HD.epr';
                defaultPresets.audio = '/Applications/Adobe Media Encoder 2025/Adobe Media Encoder 2025.app/Contents/MediaIO/systempresets/41494646_41494646/WAV 48kHz 16 bit.epr';
            }

            // Set defaults if no presets are saved
            if (!localStorage.getItem(STORAGE_KEYS.VIDEO_PRESET)) {
                document.getElementById('video-preset').placeholder = defaultPresets.video;
            }
            if (!localStorage.getItem(STORAGE_KEYS.AUDIO_PRESET)) {
                document.getElementById('audio-preset').placeholder = defaultPresets.audio;
            }
        } catch (e) {
            console.error('Error parsing system info:', e);
        }
    });
}

/**
 * Handle export button click
 * First checks for selected sequences in Project panel (batch export)
 * Falls back to active sequence if nothing selected
 * Note: Premiere Direct export mode skips batch (not compatible)
 */
function handleExport() {
    setStatus('Checking...', 'warning');
    debugLog('Export button clicked', 'info');

    // Check if Premiere Direct export is enabled
    var premiereDirect = localStorage.getItem(STORAGE_KEYS.PREMIERE_DIRECT) === 'true';

    // Premiere Direct mode is not compatible with batch export
    if (premiereDirect) {
        debugLog('Premiere Direct mode - using active sequence only', 'info');
        handleSingleExport();
        return;
    }

    // First, check if there are sequences selected in Project panel
    debugLog('Checking for selected sequences...', 'info');

    // Add timeout to prevent hanging on Windows
    var selectionCallbackFired = false;
    var selectionTimeout = setTimeout(function () {
        if (!selectionCallbackFired) {
            selectionCallbackFired = true;
            debugLog('Selection check timed out - falling back to active sequence', 'warning');
            handleSingleExport();
        }
    }, 3000); // 3 second timeout

    csInterface.evalScript('ExportButton_getSelectedSequences()', function (result) {
        // Cancel timeout and mark callback as fired
        clearTimeout(selectionTimeout);
        if (selectionCallbackFired) {
            // Timeout already fired, ignore this late callback
            return;
        }
        selectionCallbackFired = true;

        debugLog('getSelectedSequences result: ' + result, 'info');

        try {
            var selectionInfo = JSON.parse(result);

            if (selectionInfo.success && selectionInfo.count > 0) {
                // Batch export mode!
                debugLog('Batch export: ' + selectionInfo.count + ' sequences selected', 'success');
                setStatus('Batch: ' + selectionInfo.count + ' sequences', 'warning');
                handleBatchExport(selectionInfo.sequences);
            } else {
                // No selection or failed - fall back to active sequence
                debugLog('No selection, using active sequence', 'info');
                handleSingleExport();
            }
        } catch (e) {
            debugLog('Selection check failed: ' + e.message, 'error');
            // Fall back to active sequence
            handleSingleExport();
        }
    });
}


/**
 * Handle batch export of multiple sequences
 * @param {Array} sequences - Array of sequence objects {name, nodeId}
 */
function handleBatchExport(sequences) {
    var downloadEnabled = document.getElementById('download-checkbox').checked;
    var totalCount = sequences.length;
    var successCount = 0;
    var errorCount = 0;
    var currentIndex = 0;

    debugLog('Starting batch export of ' + totalCount + ' sequences', 'info');

    // Process sequences one by one
    function processNextSequence() {
        if (currentIndex >= totalCount) {
            // All done - start the batch
            debugLog('All sequences queued, starting AME batch...', 'info');
            csInterface.evalScript('ExportButton_startAMEBatch()', function (result) {
                setStatus('Batch started: ' + successCount + '/' + totalCount, 'success');
                debugLog('Batch export complete: ' + successCount + ' success, ' + errorCount + ' errors', 'success');
            });
            return;
        }

        var seq = sequences[currentIndex];
        setStatus('Queueing ' + (currentIndex + 1) + '/' + totalCount + '...', 'warning');
        debugLog('Processing: ' + seq.name, 'info');

        // Get video info for this sequence
        var escapedName = seq.name.replace(/'/g, "\\'");
        csInterface.evalScript("ExportButton_hasVideoForSequence('" + escapedName + "')", function (videoResult) {
            try {
                var videoInfo = JSON.parse(videoResult);
                var hasVideo = videoInfo.hasVideo || false;

                // Determine preset
                var presetPath;
                if (hasVideo) {
                    presetPath = localStorage.getItem(STORAGE_KEYS.VIDEO_PRESET) || defaultPresets.video;
                } else {
                    presetPath = localStorage.getItem(STORAGE_KEYS.AUDIO_PRESET) || defaultPresets.audio;
                }

                // Determine output folder
                if (downloadEnabled) {
                    csInterface.evalScript('getSystemInfo()', function (sysResult) {
                        try {
                            var sysInfo = JSON.parse(sysResult);
                            var folderPath = sysInfo.downloadsPath;
                            queueSequenceExport(seq.name, folderPath, presetPath, hasVideo);
                        } catch (e) {
                            debugLog('Error getting downloads path: ' + e.message, 'error');
                            errorCount++;
                            currentIndex++;
                            processNextSequence();
                        }
                    });
                } else {
                    csInterface.evalScript('ExportButton_getProjectExportsPath()', function (pathResult) {
                        try {
                            var pathInfo = JSON.parse(pathResult);
                            if (pathInfo.success) {
                                queueSequenceExport(seq.name, pathInfo.path, presetPath, hasVideo);
                            } else {
                                debugLog('EXPORTS folder error: ' + pathInfo.error, 'error');
                                errorCount++;
                                currentIndex++;
                                processNextSequence();
                            }
                        } catch (e) {
                            debugLog('Error getting exports path: ' + e.message, 'error');
                            errorCount++;
                            currentIndex++;
                            processNextSequence();
                        }
                    });
                }
            } catch (e) {
                debugLog('Video check error for ' + seq.name + ': ' + e.message, 'error');
                errorCount++;
                currentIndex++;
                processNextSequence();
            }
        });

        function queueSequenceExport(seqName, folderPath, presetPath, hasVideo) {
            // Clean name
            var cleanName = seqName.replace(/[<>:"/\\|?*]/g, '_');
            var extension = hasVideo ? 'mp4' : 'wav';

            // Get naming pattern from settings
            var namingPattern = localStorage.getItem(STORAGE_KEYS.SUFFIX_PATTERN) || '{SEQ}_V{V}';

            // Get versioned filename
            var safeFolderPath = folderPath.replace(/\\/g, '\\\\');
            var safeBaseName = cleanName.replace(/'/g, "\\'");
            var safeNamingPattern = namingPattern.replace(/'/g, "\\'");

            csInterface.evalScript("ExportButton_getNextVersionedFilenameWithPattern('" + safeFolderPath + "', '" + safeBaseName + "', '" + extension + "', '" + safeNamingPattern + "')", function (verResult) {
                try {
                    var verInfo = JSON.parse(verResult);
                    var version = verInfo.success ? verInfo.version : 1;

                    // Apply naming pattern (full filename now)
                    var fileName = parseSuffixPattern(namingPattern, version, cleanName);
                    var sep = (folderPath.indexOf('\\') !== -1) ? '\\' : '/';
                    var outputPath = folderPath + sep + fileName;

                    // Escape for ExtendScript
                    var escapedOutput = outputPath.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
                    var escapedPreset = presetPath.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
                    var escapedSeqName = seqName.replace(/'/g, "\\'");

                    var script = "ExportButton_exportSequenceByName('" + escapedSeqName + "', '" + escapedOutput + "', '" + escapedPreset + "')";
                    debugLog('Queueing: ' + fileName, 'info');

                    csInterface.evalScript(script, function (exportResult) {
                        try {
                            var expInfo = JSON.parse(exportResult);
                            if (expInfo.success) {
                                successCount++;
                                debugLog('Queued: ' + fileName, 'success');
                            } else {
                                errorCount++;
                                debugLog('Failed: ' + seqName + ' - ' + expInfo.error, 'error');
                            }
                        } catch (e) {
                            errorCount++;
                            debugLog('Export error: ' + e.message, 'error');
                        }

                        currentIndex++;
                        processNextSequence();
                    });
                } catch (e) {
                    debugLog('Version error: ' + e.message, 'error');
                    errorCount++;
                    currentIndex++;
                    processNextSequence();
                }
            });
        }
    }

    // Start processing
    processNextSequence();
}

/**
 * Handle single sequence export (active sequence)
 */
function handleSingleExport() {
    debugLog('Calling getActiveSequence()...', 'info');
    csInterface.evalScript('ExportButton_getActiveSequence()', function (result) {
        debugLog('getActiveSequence result: ' + result, result ? 'info' : 'error');

        try {
            if (!result || result === 'undefined' || result.indexOf('Error') === 0 || result.indexOf('EvalScript') === 0) {
                setStatus('Script error - check log', 'error');
                debugLog('ExtendScript error: ' + result, 'error');
                return;
            }

            var seqInfo = JSON.parse(result);
            debugLog('Parsed sequence info: ' + JSON.stringify(seqInfo), 'success');

            if (!seqInfo.success) {
                setStatus(seqInfo.error || 'No active sequence', 'error');
                debugLog('No active sequence: ' + seqInfo.error, 'error');
                return;
            }

            debugLog('Sequence name: ' + seqInfo.name, 'success');
            checkVideoAndExport(seqInfo.name);

        } catch (e) {
            setStatus('Error: ' + e.message, 'error');
            debugLog('Parse error: ' + e.message + ' | Raw result: ' + result, 'error');
        }
    });
}

/**
 * Check if sequence has video and proceed with export
 * @param {string} sequenceName - Name of the sequence
 */
function checkVideoAndExport(sequenceName) {
    csInterface.evalScript('ExportButton_hasVideoTracks()', function (result) {
        try {
            var videoInfo = JSON.parse(result);
            var hasVideo = videoInfo.hasVideo;

            // Determine which preset to use
            var presetPath;
            if (hasVideo) {
                presetPath = localStorage.getItem(STORAGE_KEYS.VIDEO_PRESET) || defaultPresets.video;
            } else {
                presetPath = localStorage.getItem(STORAGE_KEYS.AUDIO_PRESET) || defaultPresets.audio;
            }

            if (!presetPath) {
                setStatus('No preset configured', 'error');
                openSettingsModal();
                return;
            }

            // Determine output path
            determineOutputPath(sequenceName, presetPath, hasVideo);

        } catch (e) {
            setStatus('Error: ' + e.message, 'error');
        }
    });
}

/**
 * Determine output path and proceed with export
 * @param {string} sequenceName - Name of the sequence
 * @param {string} presetPath - Path to the preset file
 * @param {boolean} hasVideo - Whether the sequence has video
 */
function determineOutputPath(sequenceName, presetPath, hasVideo) {
    var downloadEnabled = document.getElementById('download-checkbox').checked;

    // Clean sequence name for use as filename
    var cleanName = sequenceName.replace(/[<>:"/\\|?*]/g, '_');

    // Get custom settings
    var customExportFolder = localStorage.getItem(STORAGE_KEYS.EXPORT_FOLDER) || 'EXPORTS';
    var folderDepth = parseInt(localStorage.getItem(STORAGE_KEYS.FOLDER_DEPTH) || '0', 10);
    var fixedFolder = localStorage.getItem(STORAGE_KEYS.FIXED_FOLDER) || '';

    if (downloadEnabled) {
        // Check for fixed folder path
        if (fixedFolder && fixedFolder.trim() !== '') {
            // Use custom fixed folder
            getVersionedFilenameAndExport(fixedFolder, cleanName, presetPath, hasVideo);
        } else {
            // Use default Downloads folder
            csInterface.evalScript('ExportButton_getSystemInfo()', function (result) {
                try {
                    var info = JSON.parse(result);
                    var folderPath = info.downloadsPath;
                    getVersionedFilenameAndExport(folderPath, cleanName, presetPath, hasVideo);
                } catch (e) {
                    setStatus('Error getting downloads path', 'error');
                }
            });
        }
    } else {
        // Export to project folder with custom folder name and depth
        var safefolderName = customExportFolder.replace(/'/g, "\\'");
        csInterface.evalScript("ExportButton_getProjectExportsPathWithDepth('" + safefolderName + "', " + folderDepth + ")", function (result) {
            try {
                var pathInfo = JSON.parse(result);

                if (!pathInfo.success) {
                    setStatus(pathInfo.error || 'Cannot find export folder', 'error');
                    return;
                }

                getVersionedFilenameAndExport(pathInfo.path, cleanName, presetPath, hasVideo);

            } catch (e) {
                setStatus('Error: ' + e.message, 'error');
            }
        });
    }
}

/**
 * Parse suffix pattern and replace tokens
 * @param {string} pattern - The suffix pattern with tokens
 * @param {number} version - Version number
 * @param {string} sequenceName - Name of the sequence
 * @returns {string} Parsed suffix
 * 
 * Supported tokens:
 *   {V}   = version without padding (1, 2, 10, 100...)
 *   {VV}  = version with 2 digits (01, 02, 10, 100...)
 *   {VVV} = version with 3 digits (001, 002, 010, 100...)
 *   {DATE} = current date (YYYY-MM-DD)
 *   {TIME} = current time (HH-MM)
 *   {SEQ}  = sequence name
 */
function parseSuffixPattern(pattern, version, sequenceName) {
    var now = new Date();
    var dateStr = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0');
    var timeStr = String(now.getHours()).padStart(2, '0') + '-' +
        String(now.getMinutes()).padStart(2, '0');

    // Replace version tokens with appropriate padding
    // Match {V}, {VV}, {VVV}, etc. (case insensitive)
    var result = pattern.replace(/\{(V+)\}/gi, function (match, vChars) {
        var padLength = vChars.length;
        return String(version).padStart(padLength, '0');
    });

    // Replace other tokens
    result = result
        .replace(/\{DATE\}/gi, dateStr)
        .replace(/\{TIME\}/gi, timeStr)
        .replace(/\{SEQ\}/gi, sequenceName);

    return result;
}

/**
 * Get versioned filename and export
 * @param {string} folderPath - Path to the export folder
 * @param {string} baseName - Base name of the file (sequence name)
 * @param {string} presetPath - Path to the preset file
 * @param {boolean} hasVideo - Whether the sequence has video
 */
function getVersionedFilenameAndExport(folderPath, baseName, presetPath, hasVideo) {
    // Determine extension based on preset
    var extension = hasVideo ? "mp4" : "wav";

    // Get naming pattern from settings (now full filename pattern, not suffix)
    var namingPattern = localStorage.getItem(STORAGE_KEYS.SUFFIX_PATTERN) || '{SEQ}_V{V}';

    // Check if path has trailing slash
    var sep = (folderPath.indexOf('\\') !== -1) ? '\\' : '/';
    if (folderPath.slice(-1) === sep && folderPath.length > 1) {
        folderPath = folderPath.slice(0, -1);
    }

    // Escape for ExtendScript
    var safeFolderPath = folderPath.replace(/\\/g, '\\\\');
    var safeBaseName = baseName.replace(/'/g, "\\'");
    var safeNamingPattern = namingPattern.replace(/'/g, "\\'");

    // Pass pattern to ExtendScript for version detection
    var script = "ExportButton_getNextVersionedFilenameWithPattern('" + safeFolderPath + "', '" + safeBaseName + "', '" + extension + "', '" + safeNamingPattern + "')";
    debugLog('Getting version...', 'info');

    csInterface.evalScript(script, function (result) {
        try {
            var info = JSON.parse(result);
            if (info.success) {
                // Parse naming pattern with the version number
                // Pattern IS the full filename now (not suffix)
                var finalFilename = parseSuffixPattern(namingPattern, info.version, baseName);
                var finalPath = folderPath + sep + finalFilename;

                debugLog('Version found: ' + finalFilename, 'info');
                executeExport(finalPath, presetPath, hasVideo, finalFilename);
            } else {
                debugLog('Versioning error: ' + info.error, 'error');
                // Fallback to V1
                var fallbackName = parseSuffixPattern(namingPattern, 1, baseName);
                var fullPath = folderPath + sep + fallbackName;
                executeExport(fullPath, presetPath, hasVideo, fallbackName);
            }
        } catch (e) {
            setStatus('Error getting version', 'error');
            debugLog('Version Parse Error: ' + result, 'error');
            // Fallback with default pattern
            var fallbackName = parseSuffixPattern('{SEQ}_V1', 1, baseName);
            var fullPath = folderPath + sep + fallbackName;
            executeExport(fullPath, presetPath, hasVideo, fallbackName);
        }
    });
}

/**
 * Detect file extension from preset name/path
 * Since Premiere's exportAsMediaDirect doesn't auto-detect extension from .epr,
 * we infer it from the preset name using common patterns
 * @param {string} presetPath - Path to the preset file
 * @param {boolean} hasVideo - Whether the sequence has video (fallback)
 * @returns {string} File extension with dot (e.g., '.mp4', '.mov')
 */
function getExtensionFromPreset(presetPath, hasVideo) {
    // Get just the preset filename (lowercase for matching)
    var presetName = presetPath.split(/[/\\]/).pop().toLowerCase();

    // Video formats - check preset name for format hints
    // H.264 / HEVC / AVC
    if (presetName.indexOf('h.264') !== -1 ||
        presetName.indexOf('h264') !== -1 ||
        presetName.indexOf('hevc') !== -1 ||
        presetName.indexOf('h.265') !== -1 ||
        presetName.indexOf('youtube') !== -1 ||
        presetName.indexOf('vimeo') !== -1 ||
        presetName.indexOf('facebook') !== -1 ||
        presetName.indexOf('twitter') !== -1) {
        return '.mp4';
    }

    // Apple ProRes / QuickTime
    if (presetName.indexOf('prores') !== -1 ||
        presetName.indexOf('quicktime') !== -1 ||
        presetName.indexOf('apple') !== -1 ||
        presetName.indexOf('.mov') !== -1) {
        return '.mov';
    }

    // DNxHD / DNxHR / MXF
    if (presetName.indexOf('dnxhd') !== -1 ||
        presetName.indexOf('dnxhr') !== -1 ||
        presetName.indexOf('mxf') !== -1) {
        return '.mxf';
    }

    // AVI
    if (presetName.indexOf('avi') !== -1) {
        return '.avi';
    }

    // WebM / VP9
    if (presetName.indexOf('webm') !== -1 ||
        presetName.indexOf('vp9') !== -1 ||
        presetName.indexOf('vp8') !== -1) {
        return '.webm';
    }

    // Audio formats
    if (presetName.indexOf('wav') !== -1 ||
        presetName.indexOf('wave') !== -1) {
        return '.wav';
    }

    if (presetName.indexOf('aiff') !== -1) {
        return '.aiff';
    }

    if (presetName.indexOf('mp3') !== -1) {
        return '.mp3';
    }

    if (presetName.indexOf('aac') !== -1) {
        return '.aac';
    }

    // Fallback based on hasVideo
    debugLog('Could not detect format from preset name, using fallback', 'info');
    return hasVideo ? '.mp4' : '.wav';
}

/**
 * Execute the export via Adobe Media Encoder or directly in Premiere
 * @param {string} outputPath - Full output path (without extension)
 * @param {string} presetPath - Path to the preset file
 * @param {boolean} hasVideo - Whether export includes video
 * @param {string} versionedName - The versioned filename for display
 */
function executeExport(outputPath, presetPath, hasVideo, versionedName) {
    debugLog('executeExport called', 'info');
    debugLog('Output path: ' + outputPath, 'info');
    debugLog('Preset path: ' + presetPath, 'info');
    debugLog('Has video: ' + hasVideo, 'info');

    setStatus('Starting export...', 'warning');

    // Get settings
    var useInOut = localStorage.getItem(STORAGE_KEYS.INOUT_EXPORT) === 'true';
    var premiereDirect = localStorage.getItem(STORAGE_KEYS.PREMIERE_DIRECT) === 'true';
    debugLog('Use In/Out: ' + useInOut, 'info');
    debugLog('Premiere Direct: ' + premiereDirect, 'info');

    // For direct Premiere export, we need to add the file extension
    // Detect extension from preset name (since Premiere doesn't auto-detect from .epr)
    var finalOutputPath = outputPath;
    if (premiereDirect) {
        var extension = getExtensionFromPreset(presetPath, hasVideo);
        finalOutputPath = outputPath + extension;
        debugLog('Detected extension from preset: ' + extension, 'info');
    }

    // Escape paths for ExtendScript
    var escapedOutputPath = finalOutputPath.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    var escapedPresetPath = presetPath.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

    debugLog('Escaped output: ' + escapedOutputPath, 'info');
    debugLog('Escaped preset: ' + escapedPresetPath, 'info');

    // Choose export method based on setting
    var script;
    if (premiereDirect) {
        script = "ExportButton_exportDirectInPremiere('" + escapedOutputPath + "', '" + escapedPresetPath + "', " + useInOut + ")";
        debugLog('Using Premiere Direct export', 'info');
    } else {
        script = "ExportButton_exportToAMEWithOptions('" + escapedOutputPath + "', '" + escapedPresetPath + "', " + useInOut + ")";
        debugLog('Using AME export', 'info');
    }
    debugLog('Script: ' + script, 'info');

    csInterface.evalScript(script, function (result) {
        debugLog('Export result: ' + result, result ? 'info' : 'error');

        try {
            var exportResult = JSON.parse(result);

            if (exportResult.success) {
                var type = hasVideo ? 'Video' : 'Audio';
                var displayName = versionedName || 'export';
                var inoutLabel = useInOut ? ' (In/Out)' : '';
                var modeLabel = premiereDirect ? ' [Direct]' : '';
                setStatus(displayName + inoutLabel + modeLabel + ' started!', 'success');
                debugLog('Export started successfully!', 'success');
            } else {
                setStatus(exportResult.error || 'Export failed', 'error');
                debugLog('Export failed: ' + exportResult.error, 'error');
            }
        } catch (e) {
            setStatus('Error: ' + e.message, 'error');
            debugLog('Parse error: ' + e.message, 'error');
            debugLog('Raw result was: ' + result, 'error');
        }
    });
}



/**
 * Open settings modal
 */
function openSettingsModal() {
    document.getElementById('settings-modal').classList.add('show');
}

/**
 * Close settings modal
 */
function closeSettingsModal() {
    document.getElementById('settings-modal').classList.remove('show');
}

/**
 * Browse for a preset file or folder
 * @param {string} targetId - ID of the input field to populate
 */
function browseForPreset(targetId) {
    // Check if we're selecting a folder (for fixed-folder option)
    var isFolder = (targetId === 'fixed-folder');

    // Use CEP file dialog
    var result = window.cep.fs.showOpenDialogEx(
        false,  // allowMultipleSelection
        isFolder,  // chooseDirectory - true for folder selection
        isFolder ? 'Select Folder' : 'Select Preset File',  // title
        '',     // initialPath
        isFolder ? [] : ['epr'] // fileTypes - empty for folders
    );

    if (result.err === 0 && result.data && result.data.length > 0) {
        document.getElementById(targetId).value = result.data[0];
    }
}

/**
 * Set status message
 * @param {string} message - Status message
 * @param {string} type - Message type (success, error, warning)
 */
function setStatus(message, type) {
    var statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = 'status';
    if (type) {
        statusEl.classList.add(type);
    }

    // Clear status after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(function () {
            if (statusEl.textContent === message) {
                statusEl.textContent = '';
                statusEl.className = 'status';
            }
        }, 5000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
