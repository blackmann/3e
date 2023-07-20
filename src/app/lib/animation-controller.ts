import { AnimationAction, AnimationClip, AnimationMixer, Group } from 'three'
import { signal } from '@preact/signals-react'

const ALL_CLIPS = 'degreat.3e:all' // attempt to avoid clashing with other names

class AnimationController {
  private clipActions: [AnimationClip, AnimationAction][] = []
  private mixer: AnimationMixer

  private dirty = true

  animations: AnimationClip[]
  state = signal({
    clip: ALL_CLIPS,
    currentTime: 0,
    duration: 0,
    loop: false,
    playing: false,
  })

  constructor(animations: AnimationClip[], scene: Group) {
    this.animations = animations
    this.mixer = new AnimationMixer(scene)

    for (const clip of animations) {
      this.clipActions.push([clip, this.mixer.clipAction(clip)])
    }
  }

  togglePlay() {
    const playing = !this.state.peek().playing

    if (playing) {
      if (this.dirty) {
        this.mixer.setTime(0)

        let duration = 0
        for (const [clip, action] of this.clipActions) {
          const selectedClip = this.state.peek().clip
          const play = selectedClip === ALL_CLIPS || selectedClip === clip.name
          if (play) {
            action.play()
            duration = Math.max(duration, clip.duration)
          } else {
            action.stop()
          }
        }

        this.state.value = { ...this.state.value, duration }

        this.dirty = false
      }
    }

    this.setPlaying(playing)
  }

  seekToStart() {
    this.mixer.setTime(0)
  }

  private setPlaying(playing: boolean) {
    this.state.value = { ...this.state.value, playing: playing }
  }

  forward(delta: number) {
    if (!this.state.peek().playing) {
      return
    }

    // REDO: put check inside if (!loop...)
    const { loop, duration } = this.state.peek()
    const normalizedTime = this.mixer.time % duration
    const ends = normalizedTime + delta > duration

    this.mixer.update(delta)

    if (!loop && ends) {
      this.mixer.setTime(0)
      this.setPlaying(false)
      return
    }

    this.state.value = {
      ...this.state.value,
      currentTime: this.mixer.time % duration,
    }
  }

  toggleLoop() {
    const loop = !this.state.peek().loop

    this.state.value = { ...this.state.value, loop }
  }

  setClip(name: string) {
    this.state.value = { ...this.state.value, clip: name, playing: false }
    this.dirty = true
  }

  dispose() {
    this.mixer.stopAllAction()
  }
}

export default AnimationController
export { ALL_CLIPS }
