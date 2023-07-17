import * as vscode from 'vscode'

class Doc implements vscode.CustomDocument {
  uri: vscode.Uri
  buffer: Uint8Array

  constructor(uri: vscode.Uri, buffer: Uint8Array) {
    this.uri = uri
    this.buffer = buffer
  }

  dispose(): void {
    //
  }
}

export default Doc
