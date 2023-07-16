import * as vscode from 'vscode'

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
  private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<vscode.CustomDocumentEditEvent>()
  onDidChangeCustomDocument = this._onDidChangeCustomDocument.event

  saveCustomDocument(document: Doc, cancellation: vscode.CancellationToken): Thenable<void> {
    throw new Error('Method not implemented.')
  }
  saveCustomDocumentAs(document: Doc, destination: vscode.Uri, cancellation: vscode.CancellationToken): Thenable<void> {
    throw new Error('Method not implemented.')
  }
  revertCustomDocument(document: Doc, cancellation: vscode.CancellationToken): Thenable<void> {
    throw new Error('Method not implemented.')
  }
  backupCustomDocument(document: Doc, context: vscode.CustomDocumentBackupContext, cancellation: vscode.CancellationToken): Thenable<vscode.CustomDocumentBackup> {
    throw new Error('Method not implemented.')
  }
  openCustomDocument(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext, token: vscode.CancellationToken): Doc | Thenable<Doc> {
    const doc = new Doc(uri)
    return doc
  }
  resolveCustomEditor(document: Doc, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): void | Thenable<void> {
    webviewPanel.webview.html = '<p>Hello world</p>'
  }

  private static readonly viewType = '3e.editor'

  static register(ctx: vscode.ExtensionContext): vscode.Disposable {
    const provider = new EditorProvider()
    return vscode.window.registerCustomEditorProvider(EditorProvider.viewType, provider)
  }
}

export default EditorProvider
