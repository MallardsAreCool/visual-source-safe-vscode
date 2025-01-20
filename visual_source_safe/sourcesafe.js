const vscode = require("vscode");

const config = require('../utils/config');
const file = require('../utils/files');
const exec = require('../utils/exec');
const tools = require('../utils/tools');
const { debounce } = require('../utils/debounce');
const { iconProvider } = require('../utils/icons');
const { tidyFilePath } = require('../utils/global');

var userCheckedOut = [];
var otherCheckedOut = [];

async function checkInFile(filePath) {
    var physicalFile
    ,   output
    ,   userComment = ''
    ;

    if (!filePath) {
        filePath = file.getCurrentFile();
    }

    physicalFile = filePath;

    if (!file.isValidFile(physicalFile)) {
        physicalFile = file.getFullFilePath(physicalFile);
    }

    if (!file.isFileInWorkingDirectory(physicalFile)) {
        return;
    }

    if (!isCheckedOut(physicalFile)) {
        vscode.window.showErrorMessage(`Visual Source Safe: You don't have this file checked out for edits.`);
    }

    if (config.getShowComment()) {
        userComment = await vscode.window.showInputBox({
            prompt: 'Enter a comment for check in.',
            placeHolder: '',
        });

        if (userComment !== '' && userComment.includes('&&')) {
            userComment = '';
        }
    }

    output = await exec.runCommand(exec.Commands.CHECKIN, physicalFile, userComment);
    if (!output.stderr) {
        vscode.window.showInformationMessage(`Checked in file: ${physicalFile}`);
    } else {
        vscode.window.showErrorMessage(`Visual Source Safe: ${output.stderr}`);
    }
}

async function undoCheckout(filePath) {
    var physicalFile
    ,   output
    ,   removeReadOnly
    ;

    if (!filePath) {
        filePath = file.getCurrentFile();
    }

    physicalFile = filePath;

    if (!file.isValidFile(physicalFile)) {
        physicalFile = file.getFullFilePath(physicalFile);
    }

    if (!file.isFileInWorkingDirectory(physicalFile)) {
        return;
    }

    output = await exec.runCommand(exec.Commands.UNDO, physicalFile);
}

async function getLatestFile(filePath) {
    var physicalFile
    ,   output
    ,   removeReadOnly
    ;

    if (!filePath) {
        filePath = file.getCurrentFile();
    }

    physicalFile = filePath;

    if (!file.isValidFile(physicalFile)) {
        physicalFile = file.getFullFilePath(physicalFile);
    }

    if (!file.isFileInWorkingDirectory(physicalFile)) {
        return;
    }

    if (isCheckedOut(physicalFile, false, true)) {
        removeReadOnly = true;

        const selection = await vscode.window.showWarningMessage(
            `You currently have this file checked out for edits.\nAny changes you've made will be lost.\nDo you wish to proceed?`,
            'Yes', 
            'No'
        );

        if (selection === 'No') {
            return;
        }
    }

    if (file.isDirectory(physicalFile)) {
        output = await exec.runCommand(exec.Commands.GET_FILES, physicalFile);
    } else {
        output = await exec.runCommand(exec.Commands.GET_FILE, physicalFile);
    }
    if (output.stderr) {
        vscode.window.showErrorMessage(`Visual Source Safe: ${output.stderr}`);
    }

    if (removeReadOnly) {
        file.removeReadOnlyFlag(physicalFile);
    }
}

const debouncedCheckOutFile = debounce((filePath) => {
    if (isCheckedOut(filePath)) {
        return;
    }

    checkOutFile(filePath);
}, 500);

async function checkOutFile(filePath) {
    var physicalFile
    ,   output
    ;

    if (!filePath) {
        filePath = file.getCurrentFile();
    }

    physicalFile = filePath;

    if (!file.isValidFile(physicalFile)) {
        physicalFile = file.getFullFilePath(physicalFile);
    }

    if (!file.isFileInWorkingDirectory(physicalFile)) {
        return;
    }

    if (isCheckedOut(physicalFile, true)) {
        return;
    }

    output = await exec.runCommand(exec.Commands.CHECKOUT, physicalFile);
    if (!output.stderr) {
        vscode.window.showInformationMessage(`Checked out file: ${physicalFile}`);
    } else {
        vscode.window.showErrorMessage(`Visual Source Safe: ${output.stderr}`);
    }
}

async function refreshCurrentlyCheckedout() {
    var output
    ,   virtualWorkingDir
    ;

    virtualWorkingDir = tidyFilePath(file.getCurrentWorkingDir());

    if (!!virtualWorkingDir) {
        output = await exec.runCommand(exec.Commands.CURRENT_CHECKOUT, virtualWorkingDir);
        if (!!output) {
            buildCurrentlyCheckedoutRtn(output.stdout);
        }
    }
}

function buildCurrentlyCheckedoutRtn(input) {
    var parsedInput;

    if (!input) {
        return;
    }
    parsedInput = tools.parseCurrentlyCheckedout(input);

    iconProvider.clearCache();
    userCheckedOut = [];
    otherCheckedOut = [];

    parsedInput.forEach(function buildParsedInput(fileData) {
        var physicalURI;
        
        physicalURI = vscode.Uri.file(fileData.physicalFile);

        if (fileData.username === config.getUsername()) {
            if (!userCheckedOut.some(file => file.physicalFile === fileData.physicalFile)) {
                userCheckedOut.push(fileData);
            }

            iconProvider.addDecoration(physicalURI, "MODIFY");
        } else {
            if (!otherCheckedOut.some(file => file.physicalFile === fileData.physicalFile)) {
                otherCheckedOut.push(fileData);
            }

            iconProvider.addDecoration(physicalURI, "LOCKED");
        }
    });

    iconProvider.clearOldDecorations();
}

function isCheckedOut(filePath, showError, userOnly) {
    var matchedFileData;

    matchedFileData = userCheckedOut.find(fileData => {
        return fileData.physicalFile === filePath || fileData.virtualFile === filePath;
    });

    if (!!matchedFileData) {
        if (showError) {
            vscode.window.showErrorMessage(`You currently have this file checked out for edits.`);
        }
        return true;
    }

    if (userOnly) {
        return false;
    }

    matchedFileData = otherCheckedOut.find(fileData => {
        return fileData.physicalFile === filePath || fileData.virtualFile === filePath;
    });

    if (!!matchedFileData) {
        if (showError) {
            vscode.window.showErrorMessage(`'${matchedFileData.username}' currently have this file checked out for edits.`);
        }
        return true;
    }

    return false;
}

module.exports = {
    checkOutFile
    , debouncedCheckOutFile
    , refreshCurrentlyCheckedout
    , getLatestFile
    , undoCheckout
    , isCheckedOut
    , checkInFile
};