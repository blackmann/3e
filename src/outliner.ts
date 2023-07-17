import * as vscode from 'vscode'

class ItemUnion extends vscode.TreeItem {
  tree?: Scene
  props?: MeshRep

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

  getChildren(
    element?: ItemUnion | undefined
  ): vscode.ProviderResult<ItemUnion[]> {
    if (!this.activeDocPath || !this.scenes[this.activeDocPath]) {
      return []
    }

    if (element?.props) {
      const { material } = element.props
      const items: ItemUnion[] = []

      if (material.name) {
        const item = new ItemUnion(element.props.material.name || '[default]')

        item.description = element.props.material.type
        items.push(item)
      }

      // add animation and maybe other relevant info

      return items
    }

    const scene = this.scenes[this.activeDocPath]

    return scene.nodes.map(
      (node) =>
        new ItemUnion(
          node.name,
          undefined,
          node,
          vscode.TreeItemCollapsibleState.Collapsed
        )
    )
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
