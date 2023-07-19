import Header from './header'
import React from 'react'
import Viewer from './viewer'
import { activate as activateCamera } from '../lib/camera'
import { activate as activateContext } from '../lib/context'
import styles from './editor.module.css'
import { vscode } from '../lib/vscode'

function Editor() {
  React.useEffect(() => {
    const dispose = [activateContext(), activateCamera()]

    vscode.postMessage({ type: 'ready' })

    return () => dispose.forEach((fn) => fn?.())
  }, [])

  return (
    <div className={styles.editor}>
      <Header />

      <div className={styles.viewer}>
        <Viewer />
      </div>
    </div>
  )
}

export default Editor
