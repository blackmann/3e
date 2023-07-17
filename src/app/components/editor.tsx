import Header from './header'
import React from 'react'
import Viewer from './viewer'
import styles from './editor.module.css'

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
