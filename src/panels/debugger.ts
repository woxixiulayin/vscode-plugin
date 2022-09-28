/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mybricks@126.com
 */

import * as vscode from 'vscode';

import * as path from 'path'
import * as fse from 'fs-extra';

import { updateStatusBar } from '../statusBar';
import { WORKSPACE_STATUS } from '../constants';

import { build, tempPath, startServer } from '../scripts/_comlib-build';

export class DebuggerPanelProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {

  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      console.log("onDidReceiveMessage", data);
      switch (data.action) {

        //停止调试
        case 'dev': {
          break;
        }

        //构建
        case 'build': {
          // 当前选中的文件路径
          const wsFolders = vscode.workspace.workspaceFolders;

          if (wsFolders) {
            updateStatusBar(WORKSPACE_STATUS.BUILD);
            const docPath = wsFolders[0].uri.fsPath;
            const configName = 'mybricks.json';
            const { id, editJS } = build(docPath, configName);
            const editJSPath = path.join(tempPath, `${id.replace(/@|\//gi, '_')}.js`);

            fse.writeFileSync(editJSPath, editJS);

            await startServer(editJSPath);
          }
        }
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, '_assets', 'panel-debugger.js')
    );

    const styleViewUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, '_assets', 'view.css')
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleViewUri}" rel="stylesheet">
			</head>
			<body>
				
        <button class="button-new" style="display: block;" data-type='dev'>调试</button>
				<button class="button-new" style="display: none;" data-type='build'>构建中</button>
				<button class="button-new" style="display: none;" data-type='debug'>调试中</button>

        <script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}

function getNonce() {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
