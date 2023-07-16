import { Uri, Webview } from "vscode";

function getUri(webview: Webview, extensionUri: Uri, ...pathList: string[]) {
  return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList))
}

export default getUri
