function test() {
    return "Extension working!";
}

function getSystemInfo() {
    return JSON.stringify({
        isWindows: $.os.indexOf("Windows") !== -1,
        downloadsPath: Folder.desktop.fsName,
        separator: "/"
    });
}

function getActiveSequence() {
    return JSON.stringify({
        success: true,
        name: "Test Sequence",
        id: "123"
    });
}
