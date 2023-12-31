import context, { activate as activateContext } from '../lib/context'
import Header from './header'
import React from 'react'
import Timeline from './timeline'
import Viewer from './viewer'
import { activate as activateAppearance } from '../lib/appearance'
import { activate as activateCamera } from '../lib/camera'
import styles from './editor.module.css'
import { vscode } from '../lib/vscode'

function Editor() {
  const { controller } = context.value

  React.useEffect(() => {
    const dispose = [activateContext(), activateCamera(), activateAppearance()]
    vscode.postMessage({ type: 'ready' })

    return () => {
      context.peek().controller?.dispose()
      dispose.forEach((fn) => fn?.())
    }
  }, [])

  return (
    <div className={styles.editor}>
      <Header />

      <div className={styles.viewer}>
        <Viewer />
      </div>

      {controller && <Timeline controller={controller} />}
    </div>
  )
}

export default Editor
