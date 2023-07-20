import {
  VSCodeButton,
  VSCodeDropdown,
  VSCodeOption,
} from '@vscode/webview-ui-toolkit/react'
import { AnimationClip } from 'three'
import React from 'react'
import clsx from 'clsx'
import styles from './timeline.module.css'

interface Props {
  animations: AnimationClip[]
}

function Cursor() {
  return (
    <div className={styles.cursor}>
      <div className={styles.cursorHandle}>0</div>
      <div className={styles.cursorTail}></div>
    </div>
  )
}

interface PadProps {
  width: number
  label: string
}

function Pad({ label, width }: PadProps) {
  return (
    <div className={styles.pad} style={{ minWidth: width, width }}>
      <div className={styles.padLabel}>{label}</div>
    </div>
  )
}

function Sheet() {
  return (
    <div className={styles.sheet}>
      <div className={styles.pads}>
        {Array.from({ length: 24 }).map((_, index) => (
          <Pad key={index} label={'20'} width={50} />
        ))}
      </div>

      <Cursor />
    </div>
  )
}

function Timeline({ animations }: Props) {
  return (
    <div className={styles.timeline}>
      <header className={styles.header}>
        <div>
          <VSCodeDropdown>
            <VSCodeOption>All clips</VSCodeOption>
            <VSCodeOption>CylinderAction</VSCodeOption>
            <VSCodeOption>ConeAction</VSCodeOption>
          </VSCodeDropdown>
          <VSCodeButton appearance="icon" title="Copy clip name">
            <span className="codicon codicon-copy"></span>
          </VSCodeButton>
        </div>

        <div className={styles.playbackControls}>
          <div className={styles.controls}>
            <VSCodeButton appearance="icon" className={styles.button}>
              <span className="codicon codicon-debug-reverse-continue"></span>
            </VSCodeButton>

            <VSCodeButton
              appearance="icon"
              className={clsx(styles.playbackControl, styles.active)}
            >
              <span className="codicon codicon-play"></span>
            </VSCodeButton>

            <VSCodeButton
              appearance="icon"
              className={styles.button}
              title="Loop"
            >
              <span className="codicon codicon-debug-restart"></span>
            </VSCodeButton>
          </div>
        </div>

        <div className={styles.timeInfo}>320s</div>
      </header>

      <Sheet />
    </div>
  )
}

export default Timeline
