import * as stdlib from 'three-stdlib'
import * as vscode from 'vscode'
import Doc from './doc'

class Item extends vscode.TreeItem {
  doc?: Doc
  ref?: THREE.Mesh

  constructor(
    label: string | vscode.TreeItemLabel,
    doc?: Doc,
    ref?: any,
    collapsibleState?: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState)
    this.doc = doc
    this.ref = ref
  }
}

class Outliner implements vscode.TreeDataProvider<Item> {
  static instance: Outliner
  static treeDataType = '3e.outline'

  private activeDoc?: Doc
  private readonly _onDidChangeTreeData = new vscode.EventEmitter<
    Item | undefined
  >()

  onDidChangeTreeData = this._onDidChangeTreeData.event

  getTreeItem(element: Item): Item | Thenable<Item> {
    return element
  }

  getChildren(element?: Item | undefined): vscode.ProviderResult<Item[]> {
    if (element?.ref) {
      const material = new Item(element.ref.material.type || 'Unknown Material')
      // add animation and maybe other relevant info

      return [material]
    }

    if (!this.activeDoc) {
      return []
    }

    let doc = this.activeDoc
    const loader = new stdlib.GLTFLoader()
    return (async () => {
      const {
        scene: { children },
      } = await new Promise((res, rej) =>
        loader.parse(doc.buffer.buffer, '', res, rej)
      )

      return children.map(
        (child) =>
          new Item(
            child.name,
            doc,
            child,
            vscode.TreeItemCollapsibleState.Collapsed
          )
      )
    })()
  }

  refresh(doc?: Doc) {
    this.activeDoc = doc
    this._onDidChangeTreeData.fire(undefined)
  }

  static register(ctx: vscode.ExtensionContext): vscode.Disposable {
    const outliner = new Outliner()
    Outliner.instance = outliner

    return vscode.window.registerTreeDataProvider(
      Outliner.treeDataType,
      outliner
    )
  }
}

export default Outliner
