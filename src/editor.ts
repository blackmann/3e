import * as vscode from 'vscode'
import Doc from './doc'
import Outliner from './outliner'
import { exec } from 'child_process'
import getUri from './lib/get-uri'

class EditorProvider implements vscode.CustomEditorProvider<Doc> {
  private context: vscode.ExtensionContext

  private active?: [vscode.WebviewPanel, Doc]

  constructor(context: vscode.ExtensionContext) {
    this.context = context
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
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, 'out'),
      ],
    }

    const js = [
      getUri(
        webviewPanel.webview,
        this.context.extensionUri,
        'out',
        'app/index.js'
      ),
    ]

    const css = [
      getUri(
        webviewPanel.webview,
        this.context.extensionUri,
        'out',
        'app/index.css'
      )
    ]

    webviewPanel.webview.html = html({ css, js })

    // ? we've created this webview just now, so it must be active
    this.active = [webviewPanel, document]
    this.refreshOutliner(webviewPanel, document)

    webviewPanel.webview.onDidReceiveMessage(
      async (eventData: { type: string; [key: string]: any }) => {
        const { type, ...data } = eventData

        switch (type) {
          case 'ready': {
            const previousState = this.context.workspaceState.get(
              document.uri.path
            )
            webviewPanel.webview.postMessage({
              state: previousState,
              type: 'restore-state',
            })

            webviewPanel.webview.postMessage({
              blob: document.buffer,
              type: 'glb',
            })

            break
          }

          case 'scene': {
            Outliner.instance?.setScene(document.uri.path, data.scene)
            break
          }

          case 'export': {
            // when user switches to .js, we'll export as that
            const defaultDestination = vscode.Uri.parse(
              document.uri.path.replace('.glb', '.tsx')
            )

            // the UX for file save on Windows is terrible
            // investigate later
            vscode.window
              .showSaveDialog({
                defaultUri: defaultDestination,
                filters: {
                  TypeScript: ['.ts', '.tsx'],
                  JavaScript: ['.js', '.jsx'],
                },
              })
              .then((destination) => {
                if (!destination) {
                  return
                }

                const parts = [
                  'npx --yes gltfjsx',
                  document.uri.fsPath,
                  '-o',
                  destination.fsPath,
                ]

                if (/\.tsx?$/.test(destination.path)) {
                  parts.push('--types')
                }

                exec(parts.join(' '))
              })

            break
          }

          case 'save-state': {
            const stateKey = document.uri.path
            const previousState =
              this.context.workspaceState.get(stateKey) || {}
            const newState = { ...previousState, ...data }
            this.context.workspaceState.update(stateKey, newState)
          }
        }
      }
    )

    webviewPanel.onDidChangeViewState((e) => {
      this.refreshOutliner(e.webviewPanel, document)
    })
  }

  private refreshOutliner(webviewPanel: vscode.WebviewPanel, doc: Doc) {
    if (webviewPanel.active) {
      this.active = [webviewPanel, doc]
      Outliner.instance?.refresh(doc.uri.path)
      Outliner.instance?.setActiveWebview(webviewPanel)
    } else if (webviewPanel === this.active?.[0]) {
      this.active = undefined
      Outliner.instance?.refresh(undefined)
    }
  }

  static readonly viewType = '3e.editor'

  static register(ctx: vscode.ExtensionContext): vscode.Disposable {
    const provider = new EditorProvider(ctx)
    return vscode.window.registerCustomEditorProvider(
      EditorProvider.viewType,
      provider
    )
  }
}

function html({ css, js }: Record<string, vscode.Uri[]>) {
  const allCss = css.map((c) => `<link rel="stylesheet" href="${c}" />`).join('\n')
  const allJs = js.map((j) => `<script src="${j}"></script>`).join('\n')

  return /* html */ `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial-scale=1.0">
      ${allCss}
    </head>
    <body>
      <div id="app"></div>
      ${allJs}
    </body>
  </html>
      `
}

export default EditorProvider
