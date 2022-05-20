import React from 'react'
import styles from './Block.module.scss'

type Props = {
  schemas: Schema[]
  criteria: Criteria
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

function Block({ schemas, criteria }: Props) {
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
                    const criteriaParam = criteria.params.find(
                      (criteriaParam) => criteriaParam.type === schemaParam.type
                    )
                    const value = criteriaParam?.value?.toString()

                    return (
                      <div key={'criteria-' + criteria.id + '-param-' + schemaParam.type} className={styles.param}>
                        <label>{schemaParam.name}</label>
                        <input type="number" name={schemaParam.type} value={value} />
                      </div>
                    )
                  })}
                </div>
              ) : null}
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
                  {criteriaInput?.value ? <Block schemas={schemas} criteria={criteriaInput.value} /> : null}
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
