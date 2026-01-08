/**
 * Premiere Pro Export Button - Main JavaScript
 * Handles UI interactions and export logic
 * 
 * @author CyrilG93
 * @version 1.0.0
 */

// Global CSInterface instance
var csInterface = new CSInterface();

// Storage keys
var STORAGE_KEYS = {
    VIDEO_PRESET: 'exportButton_videoPreset',
    AUDIO_PRESET: 'exportButton_audioPreset',
    DOWNLOAD_ENABLED: 'exportButton_downloadEnabled'
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
    setStatus('Ready');

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
    csInterface.evalScript('typeof getActiveSequence', function (result) {
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

    document.getElementById('video-preset').value = videoPreset;
    document.getElementById('audio-preset').value = audioPreset;
    document.getElementById('download-checkbox').checked = downloadEnabled;
}

/**
 * Save settings to localStorage
 */
function saveSettings() {
    var videoPreset = document.getElementById('video-preset').value;
    var audioPreset = document.getElementById('audio-preset').value;

    localStorage.setItem(STORAGE_KEYS.VIDEO_PRESET, videoPreset);
    localStorage.setItem(STORAGE_KEYS.AUDIO_PRESET, audioPreset);

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
    csInterface.evalScript('getSystemInfo()', function (result) {
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
 */
function handleExport() {
    setStatus('Checking sequence...', 'warning');
    debugLog('Export button clicked', 'info');

    // First check if there's an active sequence
    debugLog('Calling getActiveSequence()...', 'info');
    csInterface.evalScript('getActiveSequence()', function (result) {
        debugLog('getActiveSequence result: ' + result, result ? 'info' : 'error');

        try {
            // Check for ExtendScript errors
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
            // Check if sequence has video tracks
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
    csInterface.evalScript('hasVideoTracks()', function (result) {
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

    if (downloadEnabled) {
        // Export to Downloads folder
        csInterface.evalScript('getSystemInfo()', function (result) {
            try {
                var info = JSON.parse(result);
                var folderPath = info.downloadsPath;

                // Get versioned filename
                getVersionedFilenameAndExport(folderPath, cleanName, presetPath, hasVideo);
            } catch (e) {
                setStatus('Error getting downloads path', 'error');
            }
        });
    } else {
        // Export to project EXPORTS folder
        csInterface.evalScript('getProjectExportsPath()', function (result) {
            try {
                var pathInfo = JSON.parse(result);

                if (!pathInfo.success) {
                    setStatus(pathInfo.error || 'Cannot find EXPORTS folder', 'error');
                    return;
                }

                // Get versioned filename
                getVersionedFilenameAndExport(pathInfo.path, cleanName, presetPath, hasVideo);

            } catch (e) {
                setStatus('Error: ' + e.message, 'error');
            }
        });
    }
}

/**
 * Get the next versioned filename and proceed with export
 * @param {string} folderPath - Path to the export folder
 * @param {string} baseName - Base name (sequence name)
 * @param {string} presetPath - Path to the preset file
 * @param {boolean} hasVideo - Whether the sequence has video
 */
function getVersionedFilenameAndExport(folderPath, baseName, presetPath, hasVideo) {
    // Escape paths for ExtendScript
    var escapedFolderPath = folderPath.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    var escapedBaseName = baseName.replace(/'/g, "\\'");

    var script = "getNextVersionedFilename('" + escapedFolderPath + "', '" + escapedBaseName + "', '')";

    csInterface.evalScript(script, function (result) {
        try {
            var versionInfo = JSON.parse(result);

            if (!versionInfo.success) {
                setStatus(versionInfo.error || 'Error getting version', 'error');
                return;
            }

            // Use the versioned full path
            var outputPath = versionInfo.fullPath;
            setStatus('Exporting ' + versionInfo.filename + '...', 'warning');
            executeExport(outputPath, presetPath, hasVideo, versionInfo.filename);

        } catch (e) {
            setStatus('Error: ' + e.message, 'error');
        }
    });
}

/**
 * Execute the export via Adobe Media Encoder
 * @param {string} outputPath - Full output path (without extension)
 * @param {string} presetPath - Path to the preset file
 * @param {boolean} hasVideo - Whether export includes video
 * @param {string} versionedName - The versioned filename for display
 */
function executeExport(outputPath, presetPath, hasVideo, versionedName) {
    setStatus('Starting export...', 'warning');

    // Escape paths for ExtendScript
    var escapedOutputPath = outputPath.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    var escapedPresetPath = presetPath.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

    var script = "exportToAME('" + escapedOutputPath + "', '" + escapedPresetPath + "')";

    csInterface.evalScript(script, function (result) {
        try {
            var exportResult = JSON.parse(result);

            if (exportResult.success) {
                var type = hasVideo ? 'Video' : 'Audio';
                var displayName = versionedName || 'export';
                setStatus(displayName + ' started!', 'success');
            } else {
                setStatus(exportResult.error || 'Export failed', 'error');
            }
        } catch (e) {
            setStatus('Error: ' + e.message, 'error');
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
 * Browse for a preset file
 * @param {string} targetId - ID of the input field to populate
 */
function browseForPreset(targetId) {
    // Use CEP file dialog
    var result = window.cep.fs.showOpenDialogEx(
        false,  // allowMultipleSelection
        false,  // chooseDirectory
        'Select Preset File',  // title
        '',     // initialPath
        ['epr'] // fileTypes
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
                statusEl.textContent = 'Ready';
                statusEl.className = 'status';
            }
        }, 5000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
