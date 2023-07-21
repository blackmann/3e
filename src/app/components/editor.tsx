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
  const { glb } = context.value
  const controller = React.useMemo(() => {
    if (!glb?.animations?.length) {
      return
    }

    return new AnimationController(glb.animations, glb.scene)
  }, [glb])

  React.useEffect(() => {
    const dispose = [activateContext(), activateCamera()]
    vscode.postMessage({ type: 'ready' })

    return () => dispose.forEach((fn) => fn?.())
  }, [])

  React.useEffect(() => {
    return () => {
      controller?.dispose()
    }
  }, [controller])

  return (
    <div className={styles.editor}>
      <Header />

      <div className={styles.viewer}>
        <Viewer controller={controller} />
      </div>

      {controller && <Timeline controller={controller} />}
    </div>
  )
}

export default Editor
