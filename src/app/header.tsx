import React from 'react'
import styles from './header.module.css'
import {
  VSCodeButton,
  VSCodeDropdown,
  VSCodeOption,
} from '@vscode/webview-ui-toolkit/react'
import Wireframe from './svgs/Wireframe'
import Archive from './svgs/Archive'

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.appearance}>
        <VSCodeButton aria-label="Show wireframe" appearance="icon">
          <Wireframe />
        </VSCodeButton>

        <VSCodeDropdown>
          <VSCodeOption>Normal Material</VSCodeOption>
          <VSCodeOption>Basic Material</VSCodeOption>
          <VSCodeOption>Basic Material (Randomized)</VSCodeOption>
          <VSCodeOption>Textured</VSCodeOption>
          <VSCodeOption>None</VSCodeOption>
        </VSCodeDropdown>

        <VSCodeDropdown>
          <VSCodeOption>Studio light 1</VSCodeOption>
          <VSCodeOption>Sun</VSCodeOption>
        </VSCodeDropdown>
      </div>

      <div>
        <VSCodeButton appearance="icon" aria-label="Export to JSX">
          <Archive />
        </VSCodeButton>
      </div>
    </header>
  )
}

export default Header
