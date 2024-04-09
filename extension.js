const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');

function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.optimizeCss', function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const document = editor.document;
        const text = document.getText();
        const regex = /import\s+.*\s+from\s+['"](.*\.module\.css)['"]/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            const cssPath = match[1];
            const fullPath = path.join(path.dirname(document.uri.fsPath), cssPath);
            if (fs.existsSync(fullPath)) {
                let cssContent = fs.readFileSync(fullPath, 'utf8');
                const minifiedCss = new CleanCSS({
                    level: {
                        2: {
                            mergeAdjacentRules: true,
                            mergeIntoShorthands: true,
                            mergeMedia: true,
                            mergeNonAdjacentRules: true,
                            mergeSemantically: true,
                            overrideProperties: true,
                            removeEmpty: true,
                            reduceNonAdjacentRules: true,
                            removeDuplicateFontRules: true,
                            removeDuplicateMediaBlocks: true,
                            removeDuplicateRules: true,
                            removeUnusedAtRules: true,
                            restructureRules: false,
                            skipProperties: [],
                        },
                    },
                }).minify(cssContent).styles;
                const minifiedPath = fullPath.replace(/\.module\.css$/, '.minified.module.css');
                fs.writeFileSync(minifiedPath, minifiedCss, 'utf8');
                console.log(`Minified CSS written to: ${minifiedPath}`);
                vscode.window.showInformationMessage(`Minified CSS for: ${cssPath}`);
            } else {
                vscode.window.showInformationMessage('CSS Not Found');
            }
        }

        vscode.window.showInformationMessage('CSS optimization complete');
    });

    context.subscriptions.push(disposable);
}

exports.activate = activate;
