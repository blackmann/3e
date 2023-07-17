import * as vscode from 'vscode'

class ItemUnion extends vscode.TreeItem {
  tree?: Scene
  props?: any


  constructor(
    label: string | vscode.TreeItemLabel,
    tree?: Scene,
    props?: any,
    collapsibleState?: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState)
    this.tree = tree
    this.props = props
  }
}

class Outliner implements vscode.TreeDataProvider<ItemUnion> {
  static instance: Outliner
  static treeDataType = '3e.outline'

  private activeDocPath?: string
  private scenes: Record<string, Scene> = {}

  private readonly _onDidChangeTreeData = new vscode.EventEmitter<
    ItemUnion | undefined
  >()

  onDidChangeTreeData = this._onDidChangeTreeData.event

  getTreeItem(element: ItemUnion): ItemUnion | Thenable<ItemUnion> {
    return element
  }

  getChildren(element?: ItemUnion | undefined): vscode.ProviderResult<ItemUnion[]> {
    if (!this.activeDocPath || !this.scenes[this.activeDocPath]) {
      return []
    }

    if (element?.props) {
      const material = new ItemUnion(element.props.material.type || 'Unknown Material')
      // add animation and maybe other relevant info

      return [material]
    }

    const scene = this.scenes[this.activeDocPath]

    return [new ItemUnion('Mesh' + this.activeDocPath.length)]
  }

  refresh(path?: string) {
    this.activeDocPath = path
    this._onDidChangeTreeData.fire(undefined)
  }

  setScene(path: string, scene: Scene) {
    this.scenes[path] = scene
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
