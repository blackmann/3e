import {
  VSCodeButton,
  VSCodeDropdown,
  VSCodeOption,
} from '@vscode/webview-ui-toolkit/react'
import appearance, { toggleWireframe } from '../lib/appearance'
import Archive from '../svgs/Archive'
import React from 'react'
import Wireframe from '../svgs/Wireframe'
import clsx from 'clsx'
import styles from './header.module.css'

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.appearance}>
        <VSCodeButton
          appearance="icon"
          className={clsx(styles.iconButton, {
            [styles.active]: appearance.value.wireframe,
          })}
          onClick={() => toggleWireframe()}
          title="Show wireframe"
        >
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
        <VSCodeButton appearance="icon" title="Export to JSX">
          <Archive />
        </VSCodeButton>
      </div>
    </header>
  )
}

export default Header
