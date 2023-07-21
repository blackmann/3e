import AnimationController, { ALL_CLIPS } from '../lib/animation-controller'
import {
  VSCodeButton,
  VSCodeDropdown,
  VSCodeOption,
} from '@vscode/webview-ui-toolkit/react'
import React from 'react'
import clsx from 'clsx'
import styles from './timeline.module.css'

interface CursorProps {
  position: number
  label: string
}

function Cursor({ label, position }: CursorProps) {
  return (
    <div className={styles.cursor} style={{ left: position }}>
      <div className={styles.cursorHandle}>{label}</div>
      <div className={styles.cursorTail} />
    </div>
  )
}

interface PadProps {
  inactive?: boolean
  width: number
  label: string
}

function Pad({ inactive, label, width }: PadProps) {
  return (
    <div
      className={clsx(styles.pad, { [styles.inactive]: inactive })}
      style={{ minWidth: width, width }}
    >
      <div className={styles.padLabel}>{label}</div>
    </div>
  )
}

interface SheetProps {
  controller: AnimationController
}

const GAP = 5
const START_OFFSET = 2
const END_OFFSET = 3
const MIN_PAD_WIDTH = 50
const SEGMENTS = 25
const MIN_SHEET_WIDTH = MIN_PAD_WIDTH * SEGMENTS

function Sheet({ controller }: SheetProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [padWidth, setPadWidth] = React.useState(MIN_PAD_WIDTH)

  React.useEffect(() => {
    const resizeSheet = () => {
      const sheetWidth = ref.current!.clientWidth
      if (sheetWidth <= MIN_SHEET_WIDTH) {
        setPadWidth(MIN_PAD_WIDTH)
        return
      }

      setPadWidth(sheetWidth / SEGMENTS)
    }

    const resizeObserver = new ResizeObserver(resizeSheet)
    resizeObserver.observe(ref.current!)

    resizeSheet()

    return () => resizeObserver.disconnect()
  }, [])

  const { currentTime, duration } = controller.state.value
  const timeFraction = currentTime / duration
  const space = padWidth * (SEGMENTS - START_OFFSET - END_OFFSET)
  const position = START_OFFSET * padWidth + timeFraction * space

  return (
    <div className={styles.sheet} ref={ref}>
      <div className={styles.pads}>
        {Array.from({ length: SEGMENTS }).map((_, index) => (
          <Pad
            inactive={index < START_OFFSET || index > SEGMENTS - END_OFFSET}
            key={index}
            label={(GAP * (index - START_OFFSET)).toString()}
            width={padWidth}
          />
        ))}
      </div>

      <Cursor label={Math.trunc(currentTime).toString()} position={position} />
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

          <VSCodeButton
            appearance="icon"
            disabled={controller.state.value.clip === ALL_CLIPS}
            onClick={() =>
              navigator.clipboard.writeText(controller.state.peek().clip)
            }
            title="Copy clip name"
          >
            <span className="codicon codicon-copy" />
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
              <span className="codicon codicon-debug-reverse-continue" />
            </VSCodeButton>

            <VSCodeButton
              appearance="icon"
              className={clsx(styles.playbackControl, {
                [styles.active]: controller.state.value.playing,
              })}
              onClick={() => controller.togglePlay()}
            >
              <span className="codicon codicon-play" />
            </VSCodeButton>

            <VSCodeButton
              appearance="icon"
              className={clsx(styles.playbackControl, {
                [styles.active]: controller.state.value.loop,
              })}
              onClick={() => controller.toggleLoop()}
              title="Loop"
            >
              <span className="codicon codicon-debug-restart" />
            </VSCodeButton>
          </div>
        </div>

        <div className={styles.timeInfo}>
          <div className={styles.time}>
            <span>{Math.trunc(controller.state.value.currentTime)}</span>
            <span>{Math.trunc(controller.state.value.duration)}</span>
          </div>
        </div>
      </header>

      <Sheet controller={controller} />
    </div>
  )
}

export default Timeline
