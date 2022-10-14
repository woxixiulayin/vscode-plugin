import * as vscode from "vscode";
import { registerCommand } from "../../utils";
import { start, initLaunchJson } from "./start";

export { initLaunchJson };

export class DebuggerCommands {

  status = 'dev';
  mybricksComlibSession: vscode.DebugSession | undefined;
  
  constructor (private readonly _context: vscode.ExtensionContext) {
    const { subscriptions } = this._context;

    subscriptions.push(
      registerCommand("mybricks.debugger.start", this.start.bind(this)),
      registerCommand("mybricks.debugger.stop", this.stop.bind(this)),
      vscode.debug.onDidChangeActiveDebugSession((e) => {
        // TODO 目前只有组件库调试
        if (!e) {
          this.stopStatus();
        } else if (e.name === 'Mybrick Comlib' && !this.mybricksComlibSession) {
          vscode.commands.executeCommand("mybricks.debugger.debug");
          vscode.window.showInformationMessage("开始调试");
          this.mybricksComlibSession = e;
        }
      })
    );
  }

  async start () {
    this.status = 'check';

    const mybricksComlibCfg = await start();

    if (mybricksComlibCfg && this.status === 'check') {
      vscode.debug.startDebugging(undefined, mybricksComlibCfg);
    } else {
      vscode.commands.executeCommand("mybricks.debugger.dev");
    }
  }

  stop () {
    if (this.mybricksComlibSession) {
      vscode.debug.stopDebugging(this.mybricksComlibSession);
    } else {
      this.stopStatus();
    }
  }

  stopStatus () {
    this.status = 'dev';
    this.mybricksComlibSession = undefined;
    vscode.commands.executeCommand("mybricks.debugger.dev");
    vscode.window.showInformationMessage("结束调试");
  }
}
