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

class Obj extends vscode.TreeItem {}

class EditorProvider
  implements vscode.CustomEditorProvider<Doc>, vscode.TreeDataProvider<Obj>
{
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

    const css = getUri(
      webviewPanel.webview,
      this.extensionUri,
      'out',
      'app/index.css'
    )

    webviewPanel.webview.html = html({ css, js })

    webviewPanel.webview.onDidReceiveMessage(async (e) => {
      switch (e.type) {
        case 'ready': {
          const blob = new Uint8Array(
            await vscode.workspace.fs.readFile(document.uri)
          )
          webviewPanel.webview.postMessage({
            blob,
            type: 'glb',
          })
        }

        case 'symbols': {
        }
      }
    })
  }

  getTreeItem(element: Obj): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element
  }

  getChildren(element?: Obj | undefined): vscode.ProviderResult<Obj[]> {
    return Promise.resolve([new Obj('box geo')])
  }

  private static readonly viewType = '3e.editor'
  private static readonly outlineType = '3e.outline'

  static register(ctx: vscode.ExtensionContext): vscode.Disposable[] {
    const provider = new EditorProvider(ctx.extensionUri)
    return [
      vscode.window.registerCustomEditorProvider(
        EditorProvider.viewType,
        provider
      ),
      vscode.window.registerTreeDataProvider(
        EditorProvider.outlineType,
        provider
      ),
    ]
  }
}

function html({ css, js }: Record<string, vscode.Uri>) {
  return /* html */ `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial-scale=1.0">
      <link rel="stylesheet" href="${css}" />
    </head>
    <body>
      <div id="app"></div>
      <script src="${js}"></script>
    </body>
  </html>
      `
}

export default EditorProvider
