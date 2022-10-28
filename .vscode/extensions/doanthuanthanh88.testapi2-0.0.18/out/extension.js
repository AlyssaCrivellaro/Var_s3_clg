"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const node_fetch_1 = require("node-fetch");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
let chOut;
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        // Use the console to output diagnostic information (console.log) and errors (console.error)
        // This line of code will only be executed once when your extension is activated
        console.log('Congratulations, your extension "testapi2" is now active!');
        // The command has been defined in the package.json file
        // Now provide the implementation of the command with registerCommand
        // The commandId parameter must match the command field in package.json
        // Setting yaml config
        const res = yield node_fetch_1.default('https://raw.githubusercontent.com/doanthuanthanh88/api-testing-doc/v5/.vscode/settings.json', {
            method: 'GET'
        });
        const tmp = yield res.text();
        let yamlConfig = {};
        try {
            eval(`yamlConfig = ${tmp || '{}'}`);
        }
        catch (err) {
            vscode.window.showErrorMessage(err.message);
            throw err;
        }
        vscode.workspace.getConfiguration();
        try {
            const conf = vscode.workspace.getConfiguration();
            yield conf.update('yaml.customTags', yamlConfig['yaml.customTags'], vscode.ConfigurationTarget.Workspace);
            yield conf.update('yaml.schemas', {
                "https://raw.githubusercontent.com/doanthuanthanh88/api-testing-doc/v5/schema.json": "*.yaml"
            }, vscode.ConfigurationTarget.Workspace);
        }
        catch (err) {
            vscode.window.showErrorMessage('Please install YAML Language support first');
            throw err;
        }
        // Listen event
        const disposable = vscode.commands.registerCommand('testapi2.run', () => __awaiter(this, void 0, void 0, function* () {
            // The code you place here will be executed every time your command is executed
            var _a, _b;
            for (let k in require.cache) {
                k.startsWith(require.resolve('testapi2/'));
                delete require.cache[k];
            }
            delete require.cache[require.resolve('testapi2/dist/global_config')];
            const { main, InputYamlFile, InputYamlText } = require('testapi2/dist/main');
            const { Pause } = require('testapi2/dist/tags/Pause');
            Pause.prototype.pause = function () {
                return new Promise(r => {
                    vscode.window.showInformationMessage('Paused!', 'Continue').then(vl => {
                        r(vl);
                    });
                });
            };
            const { Input } = require('testapi2/dist/tags/Input');
            Input.prototype.question = function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const inp = vscode.window.createInputBox();
                    inp.placeholder = this.title;
                    inp.show();
                    return new Promise(r => {
                        inp.onDidAccept(() => {
                            inp.hide();
                            r(inp.value);
                        });
                    });
                });
            };
            const { globalConfig } = require('testapi2/dist/global_config');
            if (!chOut)
                chOut = vscode.window.createOutputChannel(`testapi2`);
            chOut.clear();
            chOut.show(true);
            globalConfig.event.on('log', (msg) => {
                chOut.appendLine(msg);
            });
            try {
                let tc;
                const content = [];
                if (vscode.window.activeTextEditor) {
                    for (const s of vscode.window.activeTextEditor.selections) {
                        const tmp = vscode.window.activeTextEditor.document.getText(s);
                        if (tmp && tmp.trim().length > 0) {
                            content.push(tmp);
                        }
                    }
                }
                if (content.length > 0) {
                    tc = yield main(new InputYamlText(content.join('\n'), (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.uri.fsPath));
                }
                else {
                    tc = yield main(new InputYamlFile((_b = vscode.window.activeTextEditor) === null || _b === void 0 ? void 0 : _b.document.uri.fsPath));
                }
                if (tc.result.failed) {
                    vscode.window.showErrorMessage('Failed ❌');
                }
                else {
                    vscode.window.showInformationMessage('Passed ✔️');
                }
            }
            catch (err) {
                vscode.window.showErrorMessage('Error: ' + err.message + ' ❌❌❌');
                chOut.appendLine(err.message);
                chOut.appendLine(err.stack);
            }
        }));
        context.subscriptions.push(disposable);
    });
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    if (chOut) {
        chOut.dispose();
        chOut = undefined;
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map