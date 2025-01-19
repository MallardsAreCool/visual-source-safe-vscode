const vscode = require("vscode");
const path = require('path');

const visualSourceSafe = require('./sourcesafe');
const config = require('../utils/config');
const file = require('../utils/files');
const { tidyFilePath } = require('../utils/global');
const { iconProvider } = require('../utils/icons');
const { restartRefresh, debouncedRestartRefresh } = require('../utils/refresh');

var vsCodeContext;

function activate(context) {
    vsCodeContext = context;

    config.checkConfig(true);
    restartRefresh();

    vscode.workspace.onDidChangeConfiguration(function refreshConfig(event) {
        if (event.affectsConfiguration('visualSourceSafe')) {
            config.debouncedCheckConfig();
            debouncedRestartRefresh();
        }
    });

    context.subscriptions.push(
        vscode.window.registerFileDecorationProvider(iconProvider)
    );

    vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor && editor.document) {
          const fileName = tidyFilePath(editor.document.fileName); 
          const isCheckedOutUser = visualSourceSafe.isCheckedOut(fileName, false, true);
          const isCheckedOutOther = visualSourceSafe.isCheckedOut(fileName, false);
          
          vscode.commands.executeCommand('setContext', `isCheckedOutUser`, isCheckedOutUser);
          vscode.commands.executeCommand('setContext', `isCheckedOutOther`, isCheckedOutOther);
        }
    });

    registerCommand('visualSourceSafe.checkOutCurrent', function checkOutCurrentHandler(args) {
        var filePath;

        if (!!args && !!args.fsPath) {
            filePath = tidyFilePath(args.fsPath);
        }

        visualSourceSafe.checkOutFile(filePath);
    });

    registerCommand('visualSourceSafe.refreshCurrentlyCheckedout', function refreshCurrentlyCheckedoutHandler() {
        visualSourceSafe.refreshCurrentlyCheckedout();
    });

    registerCommand('visualSourceSafe.getLatestFile', function getLatestFileHandler(args) {
        var filePath;

        if (!!args && !!args.fsPath) {
            filePath = tidyFilePath(args.fsPath);
        }

        visualSourceSafe.getLatestFile(filePath);
    });

    registerCommand('visualSourceSafe.undoCheckout', function undoCheckoutHandler(args) {
        var filePath;

        if (!!args && !!args.fsPath) {
            filePath = tidyFilePath(args.fsPath);
        }

        visualSourceSafe.undoCheckout(filePath);
    });

    registerCommand('visualSourceSafe.checkInCurrent', function checkInCurrentHandler(args) {
        var filePath;

        if (!!args && !!args.fsPath) {
            filePath = tidyFilePath(args.fsPath);
        }

        visualSourceSafe.checkInFile(filePath);
    });

    vscode.workspace.onDidChangeTextDocument(function documentChangeHandler(event) {
        if (event.document.uri.path.endsWith('settings.json')) {
            return;
        }

        visualSourceSafe.debouncedCheckOutFile(tidyFilePath(event.document.uri.fsPath));
    });
}

function registerCommand(commandName, funcHandler) {
    vsCodeContext.subscriptions.push(vscode.commands.registerCommand(commandName, funcHandler));
}

function deactivate() {}

module.exports = { activate, deactivate };