const vscode = require("vscode");

const file = require('./files');
const { tidyFilePath } = require('./global');

function parseCurrentlyCheckedout(input) {
    const lines = input.replaceAll('\r', '').split('\n');
    const result = [];

    // Loop over files in blocks of 4
    for (var i = 0; i < lines.length; i += 4) {
        var virtualDirectory
        ,   fileData
        ,   fileName
        ,   username
        ,   virtualFile
        ,   physicalFile
        ;

        virtualDirectory = tidyFilePath(lines[i].replace(/:$/, ''));
        fileData = lines[i + 1].toLowerCase();

        fileName = fileData.substring(0, 20).trim(); //First 20 chars = filename
        username = fileData.substring(20, 20 + 14).trim(); //Next 14 chars = username

        virtualFile = tidyFilePath(`${virtualDirectory}/${fileName}`);
        physicalFile = file.getPhysicalFile(virtualFile);

        if (!file.isValidFile(physicalFile)) {
            physicalFile = file.getFullFilePath(physicalFile);
            virtualFile = file.getVirtualFile(physicalFile);
        }

        result.push({
            'username': username,
            'virtualFile': virtualFile,
            'physicalFile': physicalFile,
        });
    }

    return result;
}

function buildFileObject(physicalFile, username) {
    return {
        'username': username,
        'virtualFile': file.getVirtualFile(physicalFile),
        'physicalFile': physicalFile,
    };
}

module.exports = {
    parseCurrentlyCheckedout
    , buildFileObject
};