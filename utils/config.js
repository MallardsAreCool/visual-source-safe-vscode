const vscode = require('vscode');

const { tidyFilePath } = require('./global');
const { debounce } = require('./debounce');

var physicalDirectory = ''
,   databaseDirectory = ''
,   username = ''
,   password = ''
,   refreshRate = 1
,   executable = ''
;

function checkConfig(showMsg) {
    var config = vscode.workspace.getConfiguration('visualSourceSafe');
    var errorMsgs = [];

    physicalDirectory = tidyFilePath(config.get('workingDirectory', ''));
    databaseDirectory = tidyFilePath(config.get('databaseDirectory', ''));
    username = config.get('username', '');
    password = config.get('password', '');
    refreshRate = config.get('refreshRate', 1);
    executable = config.get('executable', 'ss');
    showComment = config.get('toggleComment', false);


    if (physicalDirectory === '') {
        errorMsgs.push('Directory');
    } else {
        if (!physicalDirectory.endsWith('/')) {
            physicalDirectory += '/';
        }
    }

    if (username === '') {
        errorMsgs.push('Username');
    }
    
    if (password === '') {
        errorMsgs.push('Password');
    }

    if (databaseDirectory === '') {
        errorMsgs.push('Directory');
    } else {
        if (!databaseDirectory.endsWith('/')) {
            databaseDirectory += '/';
        }
    }

    if (executable === '') {
        errorMsgs.push('Executable');
    } else {
        if (!executable.endsWith('.exe') || executable === 'ss') {
            executable += '.exe';
        }
    }

    if (!!!refreshRate) {
        refreshRate = 1;
    }

    if (errorMsgs.length !== 0 && showMsg) {
        vscode.window.showErrorMessage(
            `Missing required setting! Please update it. (${errorMsgs.join(', ')})`,
            'Open Settings'
        ).then(selection => {
            if (selection === 'Open Settings') {
                vscode.commands.executeCommand(
                    'workbench.action.openSettings',
                    '@ext:mallardsarecool.visual-source-safe'
                );
            }
        });
        return false;
    }

    return true;
}

const debouncedCheckConfig = debounce(() => {
    checkConfig();
}, 500);

function getPhysicalDirectory() {
    return tidyFilePath(physicalDirectory);
}

function getDatabaseDirectory() {
    return tidyFilePath(databaseDirectory);
}

function getUsername() {
    return username;
}

function getPassword() {
    return password;
}

function getRefreshRate() {
    return refreshRate * 1000;
}

function getExecutable() {
    return executable;
}

function getShowComment() {
    return showComment;
}

module.exports = {
    checkConfig
    , getPhysicalDirectory
    , getDatabaseDirectory
    , getUsername
    , getPassword
    , getRefreshRate
    , debouncedCheckConfig
    , getExecutable
    , getShowComment
};