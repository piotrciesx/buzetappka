'use client'

import { MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'

type PressHoldDndSensorOptions = {
  mouseDistance?: number
  touchDelay?: number
  touchTolerance?: number
}

export const usePressHoldDndSensors = ({
  mouseDistance = 6,
  touchDelay = 560,
  touchTolerance = 18,
}: PressHoldDndSensorOptions = {}) => {
  return useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: mouseDistance,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: touchDelay,
        tolerance: touchTolerance,
      },
    })
  )
}
