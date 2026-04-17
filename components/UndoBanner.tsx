import { CSSProperties, useState } from 'react'

type Props = {
  label: string
  onUndo: () => Promise<void>
  styles: Record<string, CSSProperties>
}

export default function UndoBanner(props: Props) {
  const { label, onUndo, styles } = props
  const [isUndoing, setIsUndoing] = useState(false)

  return (
    <div style={styles.topPanel}>
      <div style={styles.sectionTitle}>Ostatnia akcja</div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={styles.infoBox}>{label}</div>
        <button
          type="button"
          style={styles.secondaryButton}
          disabled={isUndoing}
          onClick={async () => {
            if (isUndoing) {
              return
            }

            setIsUndoing(true)

            try {
              await onUndo()
            } finally {
              setIsUndoing(false)
            }
          }}
        >
          {isUndoing ? 'Cofanie...' : 'Cofnij ostatnią akcję'}
        </button>
      </div>
    </div>
  )
}
