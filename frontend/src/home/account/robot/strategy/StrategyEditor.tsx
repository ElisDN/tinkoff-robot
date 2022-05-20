import React, { useEffect, useState } from 'react'
import Block, { Criteria } from './Block'
import useAuth from '../../../../auth/useAuth'
import api from '../../../../api/api'

type Props = {
  accountId: string
  robotId: string
}

export type Strategy = {
  sell: Criteria
  buy: Criteria
}

function StrategyEditor({ accountId, robotId }: Props) {
  const { getToken } = useAuth()

  const [strategy, setStrategy] = useState<Strategy | null>(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getToken()
      .then((token) => {
        api(`/api/accounts/${accountId}/robots/${robotId}/strategy`, {
          headers: { Authorization: 'Bearer ' + token },
        })
          .then((data) => setStrategy(data))
          .catch((error) => setError(error.message || error.statusText))
      })
      .catch(() => null)
  }, [])

  return (
    <div className="card my-3">
      <div className="card-header">Стратегия</div>
      {error ? <div className="alert alert-danger my-0">{error}</div> : null}
      {strategy !== null ? (
        <div>
          <Block criteria={strategy.sell} />
        </div>
      ) : null}
      {strategy !== null ? (
        <div>
          <Block criteria={strategy.buy} />
        </div>
      ) : null}
    </div>
  )
}

export default StrategyEditor
