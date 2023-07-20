import context, { activate as activateContext } from '../lib/context'
import Header from './header'
import React from 'react'
import Timeline from './timeline'
import Viewer from './viewer'
import { activate as activateCamera } from '../lib/camera'
import styles from './editor.module.css'
import { vscode } from '../lib/vscode'

function Editor() {
  const { glb } = context.value

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

      {Boolean(glb?.animations?.length) && (
        <Timeline animations={glb!.animations} />
      )}
    </div>
  )
}

export default Editor
