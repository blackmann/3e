import React from 'react'
import Header from './header'
import styles from './editor.module.css'
import Viewer from './viewer'

function Editor() {
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
