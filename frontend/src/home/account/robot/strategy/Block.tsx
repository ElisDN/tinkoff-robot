import React from 'react'
import styles from './Block.module.scss'

export type Criteria = {
  type: string
  name: string
}

function Block({ criteria }: { criteria: Criteria | null }) {
  return (
    <div className={styles.area}>
      <div className={styles.block}>
        <div className={styles.card}>
          <div className={styles.name}>{criteria ? criteria.name : 'Нет'}</div>
        </div>
      </div>
    </div>
  )
}

export default Block
