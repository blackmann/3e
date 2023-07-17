import {
  VSCodeButton,
  VSCodeDropdown,
  VSCodeOption,
} from '@vscode/webview-ui-toolkit/react'
import appearance, {
  MaterialType,
  selectMaterialType,
  setEnvironmentPreset,
  toggleWireframe,
} from '../lib/appearance'
import Archive from '../svgs/Archive'
import type { PresetsType } from '@react-three/drei/helpers/environment-assets'
import React from 'react'
import Wireframe from '../svgs/Wireframe'
import clsx from 'clsx'
import styles from './header.module.css'

function Header() {
  const { wireframe, materialType } = appearance.value

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

        <VSCodeDropdown
          className={styles.select}
          disabled={wireframe}
          onChange={(e) =>
            selectMaterialType(
              (e.target as HTMLSelectElement).value as MaterialType
            )
          }
          value={materialType}
        >
          <VSCodeOption value="normal">Normal Material</VSCodeOption>
          <VSCodeOption value="basic">Basic Material</VSCodeOption>
          <VSCodeOption value="basic-randomized">
            Basic Material (Randomized)
          </VSCodeOption>
          <VSCodeOption value="textured">Textured</VSCodeOption>
        </VSCodeDropdown>

        <VSCodeDropdown
          className={styles.select}
          disabled={wireframe || materialType !== 'textured'}
          onChange={(e) =>
            setEnvironmentPreset(
              (e.target as HTMLSelectElement).value as PresetsType
            )
          }
          value={appearance.value.environmentPreset}
        >
          <VSCodeOption value="apartment">Apartment</VSCodeOption>
          <VSCodeOption value="city">City</VSCodeOption>
          <VSCodeOption value="dawn">Dawn</VSCodeOption>
          <VSCodeOption value="forest">Forest</VSCodeOption>
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
