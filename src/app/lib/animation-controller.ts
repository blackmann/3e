import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Group,
  LoopOnce,
  LoopRepeat,
} from 'three'
import { signal } from '@preact/signals-react'

const ALL_CLIPS = 'degreat.3e:all' // attempt to avoid clashing with other names

class AnimationController {
  private loadedClips: [AnimationClip, AnimationAction][] = []
  private mixer: AnimationMixer

  private dirty = true

  animations: AnimationClip[]
  state = signal({
    clip: ALL_CLIPS,
    duration: 0,
    loop: false,
    playing: false,
  })

  private currentTime = 0

  constructor(animations: AnimationClip[], scene: Group) {
    this.animations = animations
    this.mixer = new AnimationMixer(scene)
  }

  togglePlay() {
    const playing = !this.state.peek().playing

    if (playing) {
      if (this.dirty) {
        this.mixer.setTime(0)
        this.mixer.update(1)

        this.loadedClips.length = 0
        const loop = !this.state.peek().loop

        for (const [clip] of this.loadedClips) {
          this.mixer.uncacheClip(clip)
        }

        let duration = 0
        for (const clip of this.animations) {
          const selectedClip = this.state.peek().clip
          if (selectedClip === ALL_CLIPS || selectedClip === clip.name) {
            const action = this.mixer.clipAction(clip).play()
            this.loadedClips.push([clip, action])

            duration = Math.max(duration, clip.duration)
          }
        }

        this.state.value = { ...this.state.value, duration }
        this.mixer.setTime(Math.min(duration, this.currentTime))

        this.dirty = false
      }
    }

    this.state.value = { ...this.state.value, playing: playing }
  }

  forward(time: number) {
    if (!this.state.peek().playing) {
      return
    }

    this.mixer.update(time)
  }

  toggleLoop() {
    const loop = !this.state.peek().loop

    this.state.value = { ...this.state.value, loop }
  }

  setClip(name: string) {
    this.state.value = { ...this.state.value, clip: name, playing: false }
    this.dirty = true
  }
}

export default AnimationController
export { ALL_CLIPS }
