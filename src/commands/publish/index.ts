import * as vscode from "vscode";

import start from "./start";
import * as path from "path";
import * as cp from "child_process";

import { registerCommand, showInformationMessage } from "../../utils";

export class PublishCommands {

  private _resove: any;

  constructor (private readonly _context: vscode.ExtensionContext) {
    const { subscriptions } = this._context;

    subscriptions.push(
      registerCommand("mybricks.publish.start", this.start.bind(this))
    );
  }

  async start () {
    if (this._resove) {
      showInformationMessage("组件库正在发布中，请稍后再试...");
      return;
    }

    const config = await start();

    if (config) {
      const { docPath, configName } = config;

      vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `组件库发布(${configName})`,
        cancellable: true
      }, (progress, token) => {
        const child = cp.fork(vscode.Uri.joinPath(this._context.extensionUri, "_scripts", "comlib-publish.js").path, [docPath, configName], {
          silent: true
        });

        token.onCancellationRequested(() => {
          // 手动取消？
          cp.spawn("kill", [String(child.pid)]);
          this.stop();
        });
  
        const rstPromise = new Promise<void>(resolve => {
          this._resove = resolve;

          child.on("message", (obj: {
            code: -1 | 0 | 1;
            message: string;
            relativePath: string;
          }) => {
            const { code, message, relativePath } = obj;

            switch (code) {
              case -1:
                // error
                vscode.window.showWarningMessage(message);
                this.stop();
                break;
              case 0:
                // loading
                progress.report({message: typeof message === 'string' ? message : JSON.stringify(message)});
                break;
              case 1:
                // success
                vscode.window.showInformationMessage(message);
                vscode.workspace.openTextDocument(vscode.Uri.joinPath(vscode.Uri.file(path.join(docPath, relativePath)))).then((document) => {
                  vscode.window.showTextDocument(document);
                });
                this.stop();
                break;
              default:
                break;
            }
          });
        });
  
        return rstPromise;
      });
    }
  }

  async stop () {
    this._resove();

    this._resove = null;
  }
}
