import * as vscode from 'vscode'
import Doc from './doc'
import Outliner from './outliner'
import getUri from './lib/get-uri'

class EditorProvider implements vscode.CustomEditorProvider<Doc> {
  private extensionUri: vscode.Uri

  private active?: [vscode.WebviewPanel, Doc]

  constructor(extensionUri: vscode.Uri) {
    this.extensionUri = extensionUri
  }

  private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<
    vscode.CustomDocumentEditEvent<Doc>
  >()

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
    return (async () => {
      const buffer = new Uint8Array(await vscode.workspace.fs.readFile(uri))
      const doc = new Doc(uri, buffer)

      return doc
    })()
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

    // ? we've created this webview just now, so it must be active
    Outliner.instance?.refresh(document)
    this.active = [webviewPanel, document]

    webviewPanel.webview.onDidReceiveMessage(async (e) => {
      switch (e.type) {
        case 'ready': {
          webviewPanel.webview.postMessage({
            blob: document.buffer,
            type: 'glb',
          })
        }
      }
    })

    webviewPanel.onDidChangeViewState((e) => {
      if (e.webviewPanel.active) {
        this.active = [e.webviewPanel, document]
        Outliner.instance?.refresh(document)
      } else {
        if (e.webviewPanel === this.active?.[0]) {
          this.active = undefined
          Outliner.instance?.refresh(undefined)
        }
      }
    })
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
