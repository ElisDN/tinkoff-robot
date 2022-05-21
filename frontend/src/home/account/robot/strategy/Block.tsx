import React, { useState } from 'react'
import styles from './Block.module.scss'

type Props = {
  schemas: Schema[]
  criteria: Criteria
  remove: (id: string) => void
  replace: (id: string, type: string, params: CriteriaParam[]) => void
}

export type SchemaParam = {
  type: string
  name: string
}

export type SchemaInput = {
  type: string
  name: string
  multiple: boolean
}

export type Schema = {
  type: string
  name: string
  multiple: boolean
  params: SchemaParam[]
  input: SchemaInput[]
}

export type Criteria = {
  id: string
  type: string
  params: CriteriaParam[]
  input: CriteriaInput[]
}

export type CriteriaParam = {
  type: string
  value: number | null
}

export type CriteriaInput = {
  type: string
  value: Criteria | null
}

function Block({ schemas, criteria, remove, replace }: Props) {
  const [paramsFormData, setParamsFormData] = useState<CriteriaParam[]>(criteria.params)

  const handleParamChange = (event: React.FormEvent<HTMLInputElement>) => {
    setParamsFormData(
      paramsFormData.map((data) => {
        if (data.type === event.currentTarget.name) {
          return { ...data, value: parseFloat(event.currentTarget.value) }
        }
        return data
      })
    )
  }

  const handleParamReady = () => {
    replace(criteria.id, criteria.type, paramsFormData)
  }

  const handleTypeChange = (event: React.FormEvent<HTMLSelectElement>) => {
    replace(criteria.id, event.currentTarget.value, criteria.params)
  }

  const schema = schemas.find((schema) => schema.type === criteria.type)

  return (
    <div className={styles.area}>
      {!schema ? <div className="alert alert-danger my-0">{criteria.type}</div> : null}
      {schema ? (
        <>
          <div className={styles.block}>
            <div className={styles.card}>
              <div className={styles.name}>{schema.name}</div>
              {schema.params ? (
                <div className={styles.params}>
                  {schema.params.map((schemaParam) => {
                    const formParam = paramsFormData.find((field) => field.type === schemaParam.type)

                    return (
                      <div key={'criteria-' + criteria.id + '-param-' + schemaParam.type} className={styles.param}>
                        <label>{schemaParam.name}</label>
                        <input
                          type="number"
                          name={schemaParam.type}
                          value={formParam?.value?.toString()}
                          onChange={handleParamChange}
                          onBlur={handleParamReady}
                        />
                      </div>
                    )
                  })}
                </div>
              ) : null}
              <div className={styles.actions}>
                <button type="button" title="Удалить" onClick={() => remove(criteria.id)}>
                  x
                </button>
                <select name="type" value={criteria.type} onChange={handleTypeChange}>
                  {schemas.map((schema) => (
                    <option key={'criteria-' + criteria.id + '-type-' + schema.type} value={schema.type}>
                      {schema.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className={styles.inputs}>
            {schema.input.map((schemaInput) => {
              const criteriaInput = criteria.input.find((criteriaInput) => criteriaInput.type === schemaInput.type)
              return (
                <div key={'criteria-' + criteria.id + '-input-' + schemaInput.type} className={styles.input}>
                  <div className={styles.inputCard}>
                    <div className={styles.inputName}>{schemaInput.name}</div>
                  </div>
                  {criteriaInput?.value ? (
                    <Block schemas={schemas} criteria={criteriaInput.value} remove={remove} replace={replace} />
                  ) : null}
                </div>
              )
            })}
          </div>
        </>
      ) : null}
    </div>
  )
}

export default Block
