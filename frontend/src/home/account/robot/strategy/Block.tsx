import React from 'react'
import styles from './Block.module.scss'

export type Criteria = {
  type: string
  name: string
}

function Block({ criteria }: { criteria: Criteria }) {
  return (
    <div className={styles.area}>
      <div className={styles.block}>
        <div className={styles.card}>
          <div className={styles.name}>{criteria.name}</div>
        </div>
      </div>
    </div>
  )
}

export default Block
