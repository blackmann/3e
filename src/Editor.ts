import * as vscode from 'vscode'
import getUri from './lib/get-uri'

class Doc implements vscode.CustomDocument {
  uri: vscode.Uri

  constructor(uri: vscode.Uri) {
    this.uri = uri
  }

  dispose(): void {
    //
  }
}

class EditorProvider implements vscode.CustomEditorProvider<Doc> {
  private extensionUri: vscode.Uri

  constructor(extensionUri: vscode.Uri) {
    this.extensionUri = extensionUri
  }

  private readonly _onDidChangeCustomDocument =
    new vscode.EventEmitter<vscode.CustomDocumentEditEvent>()
  onDidChangeCustomDocument = this._onDidChangeCustomDocument.event

  saveCustomDocument(
    document: Doc,
    cancellation: vscode.CancellationToken
  ): Thenable<void> {
    return Promise.resolve()
  }

  saveCustomDocumentAs(
    document: Doc,
    destination: vscode.Uri,
    cancellation: vscode.CancellationToken
  ): Thenable<void> {
    throw new Error('Method not implemented.')
  }

  revertCustomDocument(
    document: Doc,
    cancellation: vscode.CancellationToken
  ): Thenable<void> {
    throw new Error('Method not implemented.')
  }

  backupCustomDocument(
    document: Doc,
    context: vscode.CustomDocumentBackupContext,
    cancellation: vscode.CancellationToken
  ): Thenable<vscode.CustomDocumentBackup> {
    throw new Error('Method not implemented.')
  }

  openCustomDocument(
    uri: vscode.Uri,
    openContext: vscode.CustomDocumentOpenContext,
    token: vscode.CancellationToken
  ): Doc | Thenable<Doc> {
    const doc = new Doc(uri)
    return doc
  }

  resolveCustomEditor(
    document: Doc,
    webviewPanel: vscode.WebviewPanel,
    token: vscode.CancellationToken
  ): void | Thenable<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'out')],
    }

    const js = getUri(
      webviewPanel.webview,
      this.extensionUri,
      'out',
      'app/index.js'
    )

    webviewPanel.webview.html = /* html */ `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
  </head>
  <body>
    <div id="app"></div>
    <script src="${js}"></script>
  </body>
</html>
    `
  }

  private static readonly viewType = '3e.editor'

  static register(ctx: vscode.ExtensionContext): vscode.Disposable {
    const provider = new EditorProvider(ctx.extensionUri)
    return vscode.window.registerCustomEditorProvider(
      EditorProvider.viewType,
      provider
    )
  }
}

export default EditorProvider
