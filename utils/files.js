const vscode = require('vscode');

const config = require('./config');
const { tidyFilePath } = require('./global');
const { debouncedCheckOutFile } = require('./debounce');

const path = require('path');
const fs = require('fs');


function getCurrentFile() {
    var editor
    ,   currentFile = ''
    ;

    editor = vscode.window.activeTextEditor;

    if (editor) {
        currentFile = editor.document.uri.fsPath;
    }

    return tidyFilePath(currentFile);
}

function getVirtualFile(physicalFile) {
    return physicalFile.replace(config.getPhysicalDirectory(), '$').toLowerCase();
}

function getPhysicalFile(virtualFile) {
    return virtualFile.replace('$', config.getPhysicalDirectory()).toLowerCase();
}


function getDirectory(physicalFile) {
    if (isDirectory(physicalFile)) {
        return physicalFile;
    }

    return path.dirname(physicalFile) + '/';
}

function getCurrentWorkingDir() {
    return vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : null;
}

function isValidFile(fullPath) {
    try {
        const fileStats = fs.lstatSync(fullPath);
    } catch (error) {
        return false;
    }

    return true;
}

function getFullFilePath(physicalFile) {
    var files 
    ,   directory
    ,   fileName
    ;
    
    directory = `${path.dirname(physicalFile)}/`;
    fileName = physicalFile.replace(directory, '');

    try {
        files = fs.readdirSync(directory);
        return `${directory}${files.find(file => file.startsWith(fileName))}`;
    } catch {
        return '';
    }
}

function removeReadOnlyFlag(physicalFile) {
    try {
        fs.chmodSync(physicalFile, 0o666);
    } catch {
        vscode.window.showErrorMessage('Failed to remove read-only flag: ' + error.message);
    }
}

function isDirectory(physicalFile) {
    var fileData = fs.statSync(physicalFile);

    if (!!fileData) {
        return fileData.isDirectory();
    }

    return false;
}

function isFileInWorkingDirectory(physicalFile) {
    var workingDirectory = config.getPhysicalDirectory();

    if (!workingDirectory) {
        return false;
    }

    return physicalFile.includes(workingDirectory);
}

module.exports = {
    getCurrentFile
    , getVirtualFile
    , getPhysicalFile
    , getDirectory
    , getCurrentWorkingDir
    , isValidFile
    , getFullFilePath
    , removeReadOnlyFlag
    , isDirectory
    , isFileInWorkingDirectory
};