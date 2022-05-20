import React, { useEffect, useState } from 'react'
import Block, { Criteria, Schema } from './Block'
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

  const [schemas, setSchemas] = useState<Schema[]>([])
  const [strategy, setStrategy] = useState<Strategy | null>(null)
  const [error, setError] = useState(null)

  const loadCriterias = () => {
    setError(null)
    getToken()
      .then((token) => {
        api('/api/criterias', {
          headers: { Authorization: 'Bearer ' + token },
        })
          .then((data) => setSchemas(data))
          .catch((error) => setError(error.message || error.statusText))
      })
      .catch(() => null)
  }

  const loadStrategy = () => {
    setError(null)
    getToken()
      .then((token) => {
        api(`/api/accounts/${accountId}/robots/${robotId}/strategy`, {
          headers: { Authorization: 'Bearer ' + token },
        })
          .then((data) => setStrategy(data))
          .catch((error) => setError(error.message || error.statusText))
      })
      .catch(() => null)
  }

  useEffect(() => {
    loadCriterias()
    loadStrategy()
  }, [])

  const removeCriteria = (id: string) => {
    setError(null)
    getToken()
      .then((token) => {
        api(`/api/accounts/${accountId}/robots/${robotId}/strategy/${id}`, {
          method: 'DELETE',
          headers: { Authorization: 'Bearer ' + token },
        })
          .then(() => loadStrategy())
          .catch((error) => setError(error.message || error.statusText))
      })
      .catch(() => null)
  }

  const replaceCriteria = (id: string, type: string) => {
    setError(null)
    getToken()
      .then((token) => {
        api(`/api/accounts/${accountId}/robots/${robotId}/strategy/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify({ type }),
        })
          .then(() => loadStrategy())
          .catch((error) => setError(error.message || error.statusText))
      })
      .catch(() => null)
  }

  return (
    <div className="card my-3">
      <div className="card-header">Стратегия</div>
      {error ? <div className="alert alert-danger my-0">{error}</div> : null}
      {strategy !== null ? (
        <div className="card-body">
          <p>Продать:</p>
          <Block schemas={schemas} criteria={strategy.sell} remove={removeCriteria} replace={replaceCriteria} />
        </div>
      ) : null}
      {strategy !== null ? (
        <div className="card-body">
          <p>Купить:</p>
          <Block schemas={schemas} criteria={strategy.buy} remove={removeCriteria} replace={replaceCriteria} />
        </div>
      ) : null}
    </div>
  )
}

export default StrategyEditor
