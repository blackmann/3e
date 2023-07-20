import { signal } from "@preact/signals-react";

type PlaybackStatus = 'paused' | 'playing'

const animationState = signal({
  frame: 0,
  status: <PlaybackStatus>'paused',
  track: <string | undefined>undefined,
})

export default animationState
