import { getAvatar } from '../lib/userAppearance'
import type { CSSProperties } from 'react'

type UserAvatarProps = {
  avatarKey?: string | null
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

const avatarPaths: Record<string, string[]> = {
  dog: ['M7 10 5 6l4 2M17 10l2-4-4 2', 'M6 11a6 6 0 0 0 12 0v4a6 6 0 0 1-12 0z', 'M9 13h.01M15 13h.01', 'M10 17c1.2.8 2.8.8 4 0'],
  cat: ['M6 10 5 5l4 3M18 10l1-5-4 3', 'M6 11a6 6 0 0 0 12 0v3a6 6 0 0 1-12 0z', 'M9 13h.01M15 13h.01', 'M12 15v1M9 17h6'],
  fox: ['M4 7l5 2 3-4 3 4 5-2-2 8a6 6 0 0 1-12 0z', 'M9 13h.01M15 13h.01', 'M11 17h2'],
  owl: ['M6 8a6 6 0 0 1 12 0v5a6 6 0 0 1-12 0z', 'M8 10h3v3H8zM13 10h3v3h-3z', 'M10 16l2 2 2-2'],
  rocket: ['M12 3c4 2 6 6 5 11l-5 5-5-5C6 9 8 5 12 3Z', 'M10 14l-4 4M14 14l4 4', 'M12 8h.01'],
  robot: ['M7 8h10v9H7z', 'M9 5h6v3', 'M10 12h.01M14 12h.01', 'M10 16h4'],
  planet: ['M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0', 'M3 15c3 2 12 0 18-6', 'M4 9c4 4 12 6 17 4'],
  coffee: ['M6 8h10v6a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4z', 'M16 10h1a3 3 0 0 1 0 6h-1', 'M9 4v1M13 4v1'],
  pixel: ['M6 6h4v4H6zM14 6h4v4h-4zM6 14h4v4H6zM14 14h4v4h-4z'],
  spark: ['M12 3l2.2 6 5.8 3-5.8 3L12 21l-2.2-6L4 12l5.8-3z'],
  aura: ['M12 4a8 8 0 1 0 8 8', 'M12 8a4 4 0 1 0 4 4', 'M18 4h.01'],
  mint: ['M5 15c8 0 12-4 14-10-6 1-12 3-14 10Z', 'M5 15c3 1 6 1 9-1'],
  rose: ['M12 8c2-3 6-1 5 2-.5 4-5 5-5 5s-4.5-1-5-5c-1-3 3-5 5-2Z', 'M12 15v5'],
  sun: ['M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z', 'M12 3v2M12 19v2M3 12h2M19 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19'],
  violet: ['M12 4c3 3 6 5 6 9a6 6 0 0 1-12 0c0-4 3-6 6-9Z', 'M9 13c1.4 1 4.6 1 6 0'],
  graphite: ['M5 8l7-4 7 4v8l-7 4-7-4z', 'M8 10l4-2 4 2M8 14l4 2 4-2'],
}

export default function UserAvatar({ avatarKey, label = 'Użytkownik', size = 'md' }: UserAvatarProps) {
  const avatar = getAvatar(avatarKey)
  const paths = avatarPaths[avatar.key] || avatarPaths.dog

  return (
    <span
      data-user-avatar="true"
      data-user-avatar-size={size}
      style={{ '--avatar-color': avatar.color } as CSSProperties}
      aria-hidden="true"
      title={label}
    >
      <svg viewBox="0 0 24 24" focusable="false">
        {paths.map((path) => (
          <path
            key={path}
            d={path}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        ))}
      </svg>
    </span>
  )
}
