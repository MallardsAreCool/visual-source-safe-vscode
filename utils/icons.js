const vscode = require('vscode');
const path = require('path');

const icons = {
    MODIFY: {
      badge: '✔',
      tooltip: 'Currently checked out',
      color: new vscode.ThemeColor('terminalCommandDecoration.successBackground')
    },
    LOCKED: {
        badge: '✖',
        tooltip: 'Checked out by another user',
        color: new vscode.ThemeColor('list.errorForeground')
    }
};

class IconFileDecorationProvider {
    constructor() {
        this.decorations = new Map();
        this._onDidChangeFileDecorations = new vscode.EventEmitter();
        this.onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;
        this.cachedDecorations = [];
    }
  
    addDecoration(uri, iconKey) {
        var currentDecoration;

        this.cachedDecorations.push(uri.fsPath);

        currentDecoration = this.decorations.get(uri.fsPath);
        if (currentDecoration == icons[iconKey]) {
            return;
        }

        this.decorations.set(uri.fsPath, icons[iconKey]);
        this._onDidChangeFileDecorations.fire(uri);
    }
  
    removeDecoration(uri) {
        var cacheIndex;

        cacheIndex = this.cachedDecorations.indexOf(uri.fsPath);
        if (cacheIndex !== -1) {
            this.cachedDecorations.splice(index, 1);
        }

        this.decorations.delete(uri.fsPath);
        this._onDidChangeFileDecorations.fire(uri);
    }

    clearCache() {
        this.cachedDecorations = [];
    }

    clearOldDecorations() {
        for (const fsPath of this.decorations.keys()) {
            var pathIndex
            ,   uri
            ;

            pathIndex = this.cachedDecorations.indexOf(fsPath);
            if (pathIndex === -1) {
                uri = vscode.Uri.file(fsPath);
                this.removeDecoration(uri);
            }
        }
    }
  
    provideFileDecoration(uri) {
        return this.decorations.get(uri.fsPath);
    }
}

const iconProvider = new IconFileDecorationProvider();

module.exports = {
    iconProvider
};