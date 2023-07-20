import AnimationController, { ALL_CLIPS } from '../lib/animation-controller'
import {
  VSCodeButton,
  VSCodeDropdown,
  VSCodeOption,
} from '@vscode/webview-ui-toolkit/react'
import React from 'react'
import clsx from 'clsx'
import styles from './timeline.module.css'

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

interface SheetProps {
  controller: AnimationController
}

function Sheet({ controller }: SheetProps) {
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

interface Props {
  controller: AnimationController
}

function Timeline({ controller }: Props) {
  const animations = controller.animations

  return (
    <div className={styles.timeline}>
      <header className={styles.header}>
        <div>
          <VSCodeDropdown
            onChange={(e) =>
              controller.setClip((e.target as HTMLSelectElement).value)
            }
            value={controller.state.value.clip}
          >
            <VSCodeOption value={ALL_CLIPS}>All clips</VSCodeOption>
            {animations.map((clip) => (
              <VSCodeOption key={clip.name} value={clip.name}>
                {clip.name}
              </VSCodeOption>
            ))}
          </VSCodeDropdown>

          <VSCodeButton appearance="icon" title="Copy clip name">
            <span className="codicon codicon-copy"></span>
          </VSCodeButton>
        </div>

        <div className={styles.playbackControls}>
          <div className={styles.controls}>
            <VSCodeButton
              appearance="icon"
              className={styles.button}
              onClick={() => controller.seekToStart()}
              title="Move to start"
            >
              <span className="codicon codicon-debug-reverse-continue"></span>
            </VSCodeButton>

            <VSCodeButton
              appearance="icon"
              className={clsx(styles.playbackControl, {
                [styles.active]: controller.state.value.playing,
              })}
              onClick={() => controller.togglePlay()}
            >
              <span className="codicon codicon-play"></span>
            </VSCodeButton>

            <VSCodeButton
              appearance="icon"
              className={clsx(styles.playbackControl, {
                [styles.active]: controller.state.value.loop,
              })}
              onClick={() => controller.toggleLoop()}
              title="Loop"
            >
              <span className="codicon codicon-debug-restart"></span>
            </VSCodeButton>
          </div>
        </div>

        <div className={styles.timeInfo}>
          {Math.ceil(controller.state.value.duration)}
        </div>
      </header>

      <Sheet controller={controller} />
    </div>
  )
}

export default Timeline
