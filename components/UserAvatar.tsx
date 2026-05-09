import { getAvatar } from '../lib/userAppearance'
import type { CSSProperties } from 'react'

type UserAvatarProps = {
  avatarKey?: string | null
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function UserAvatar({ avatarKey, label = 'Użytkownik', size = 'md' }: UserAvatarProps) {
  const avatar = getAvatar(avatarKey)
  const initials = (label.trim()[0] || avatar.initials || 'U').toUpperCase()

  return (
    <span
      data-user-avatar="true"
      data-user-avatar-size={size}
      style={{ '--avatar-color': avatar.color } as CSSProperties}
      aria-hidden="true"
      title={label}
    >
      {initials}
    </span>
  )
}
