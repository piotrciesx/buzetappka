'use client'

import { MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'

export const usePressHoldDndSensors = () => {
  return useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 560,
        tolerance: 18,
      },
    })
  )
}
