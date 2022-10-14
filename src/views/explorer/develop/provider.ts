import * as vscode from "vscode";
import { uuid } from "../../../utils";

export default class Provider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly _context: vscode.ExtensionContext) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    const { subscriptions } = this._context;
    
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._context.extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.action) {
        // 停止调试
        case 'dev': 
        case 'check':
          vscode.commands.executeCommand("mybricks.debugger.stop");
          break;
        // 构建
        case 'debug':
          vscode.commands.executeCommand("mybricks.debugger.start");
          break;
        // 发布
        case 'publish': 
          vscode.commands.executeCommand("mybricks.publish.start");
        default:
          break;
      }
    }, null, subscriptions);

    webviewView.onDidDispose(() => {
      //
    },
    null,
    subscriptions);
  }

  get webview () {
    return (this._view as vscode.WebviewView).webview;
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._context.extensionUri, "dist", "views/explorerDevelop.js")
    );
    const nonce = uuid();
    const debuggerStatus = this._context.globalState.get('debuggerStatus') || "dev";

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
        <body>
            <div id="root"></div>
            <script nonce="${nonce}">
              const vscode = acquireVsCodeApi();
              vscode.setState({debuggerStatus: "${debuggerStatus}"});
            </script>
            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
	    </html>`;
  }
}
