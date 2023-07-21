import context, { activate as activateContext } from '../lib/context'
import AnimationController from '../lib/animation-controller'
import Header from './header'
import React from 'react'
import Timeline from './timeline'
import Viewer from './viewer'
import { activate as activateCamera } from '../lib/camera'
import styles from './editor.module.css'
import { vscode } from '../lib/vscode'

function Editor() {
  const { controller } = context.value

  React.useEffect(() => {
    const dispose = [activateContext(), activateCamera()]
    vscode.postMessage({ type: 'ready' })

    return () => {
      context.peek().controller?.dispose()
      dispose.forEach((fn) => fn?.())
    }
  }, [])

  console.log('controller [animation] is, ', controller)

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
