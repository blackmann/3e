import Header from './header'
import React from 'react'
import Viewer from './viewer'
import { activate } from '../lib/context'
import styles from './editor.module.css'

function Editor() {
  React.useEffect(() => activate(), [])

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
