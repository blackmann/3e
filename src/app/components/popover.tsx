import * as ReactDOM from 'react-dom'
import React from 'react'
import styles from './popover.module.css'

interface Props extends React.PropsWithChildren {
  trigger: React.ReactNode
}

function Popover({ children, trigger }: Props) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLElement>()

  const [[top, left], setPosition] = React.useState([0, 0])

  React.useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        e.stopPropagation()
      }
    }

    window.addEventListener('keydown', fn)

    return () => window.removeEventListener('keydown', fn)
  }, [])

  React.useEffect(() => {
    const { bottom, left } = triggerRef.current!.getBoundingClientRect()
    setPosition([bottom, left])
  }, [])

  return (
    <>
      {React.cloneElement(trigger, {
        onClick: () => setOpen(true),
        ref: triggerRef,
      })}

      {open && (
        <>
          <div className={styles.popover} style={{ left, top }}>
            {children}
          </div>

          {ReactDOM.createPortal(
            <div className={styles.portal} onClick={() => setOpen(false)} />,
            document.querySelector('#app')!
          )}
        </>
      )}
    </>
  )
}

export default Popover
