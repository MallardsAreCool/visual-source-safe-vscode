const vscode = require('vscode');

const file = require('./files');
const config = require('./config');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const Commands = {
    CHECKOUT: 0,
    CURRENT_CHECKOUT: 1,
    GET_FILE: 2,
    UNDO: 3,
    CHECKIN: 4,
    GET_FILES: 5
}

async function runCommand(commandType, filePath, userComment) {
    var command
    ,  options
    ;

    command = buildCommand(commandType, filePath, userComment);
    options = {
        'cwd': file.getDirectory(filePath),
        'env': {
          'SSDIR': config.getDatabaseDirectory(),
          'SSUSER': config.getUsername(),
          'SSPWD': config.getPassword()
        }
    };

    try {
        return await exec(command, options);
    } catch (output) {
        return output;
    }
}

function buildCommand(commandType, filePath, userComment) {
    var command = '';

    switch (commandType) {
        case Commands.CHECKOUT:
            command = '<SS> checkout "<VIRTUAL_FILE>" -GWR -Q';
            break;
        case Commands.CURRENT_CHECKOUT:
            command = '<SS> status "<VIRTUAL_FILE>" -NL -R';
            break;
        case Commands.GET_FILE:
            command = '<SS> get "<VIRTUAL_FILE>" -GWR -Q';
            break;
        case Commands.UNDO:
            command = '<SS> undocheckout "<VIRTUAL_FILE>" -GWR -Q -I-Y';
            break;
        case Commands.CHECKIN:
            command = '<SS> checkin "<VIRTUAL_FILE>" -Q -C"<COMMENT>" -I-Y';
            break;
        case Commands.GET_FILES:
            command = '<SS> get "<VIRTUAL_FILE>" -GWR -Q -I-Y -R';
            break;
    }

    return populateCommand(command, filePath, userComment);
}

function populateCommand(command, filePath, userComment) { 
    command = command.replace('<VIRTUAL_FILE>', file.getVirtualFile(filePath));
    command = command.replace('<PHISICAL_FILE>', filePath);
    command = command.replace('<USERNAME>', config.getUsername());
    command = command.replace('<PASSWORD>', config.getPassword());
    command = command.replace('<SS>', config.getExecutable());
    command = command.replace('<COMMENT>', userComment);

    return command;
}

module.exports = {
    runCommand
    , Commands
};