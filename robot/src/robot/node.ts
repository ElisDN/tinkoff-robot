import { v4 } from 'uuid'
import None from '../criterias/None'
import Static from '../criterias/Static'
import { Criteria } from './criteria'
import { AvailableCriterias } from './availableCriterias'
import { Data, Result } from './trading'

export class Param {
  public readonly type: string
  public readonly value: number

  constructor(type: string, value: number) {
    this.type = type
    this.value = value || 0
  }

  toJSON(): JsonParamView {
    return { type: this.type, value: this.value }
  }

  static fromJSON(data: JsonParamView) {
    return new Param(data.type, data.value || 0)
  }
}

export class Params {
  private readonly params: Param[]

  constructor(params: Param[]) {
    this.params = params
  }

  static blank(): Params {
    return new Params([])
  }

  get(type: string): number {
    return this.getParam(type).value
  }

  getParam(type: string): Param {
    return this.params.find((param) => param.type === type) || new Param(type, 0)
  }

  toJSON(): JsonParamView[] {
    return this.params.map((param) => param.toJSON())
  }

  static fromJSON(data: JsonParamView[]) {
    return new Params(data.map((row) => Param.fromJSON(row)))
  }
}

export class Input {
  public readonly type: string
  public readonly value: Node

  constructor(type: string, value: Node) {
    this.type = type
    this.value = value
  }

  toJSON(): JsonInputView {
    return { type: this.type, value: this.value.toJSON() }
  }

  static forStatic(id: string, type: string, value: number) {
    return new Input(type, Node.forStatic(id, value))
  }
}

export class Inputs {
  private readonly inputs: Input[]

  constructor(inputs: Input[]) {
    this.inputs = inputs
  }

  static blank() {
    return new Inputs([])
  }

  get(type: string, data: Data): Result {
    return this.getInput(type).value.eval(data)
  }

  getInput(type: string): Input {
    return this.inputs.find((input) => input.type === type) || new Input(type, Node.forNone())
  }

  remove(id: string): Inputs {
    return new Inputs(this.inputs.map((input) => new Input(input.type, input.value.remove(id))))
  }

  replace(id: string, criteria: Criteria, params: Params): Inputs {
    return new Inputs(this.inputs.map((input) => new Input(input.type, input.value.replace(id, criteria, params))))
  }

  wrap(id: string, criteria: Criteria): Inputs {
    return new Inputs(this.inputs.map((input) => new Input(input.type, input.value.wrap(id, criteria))))
  }

  toJSON(): JsonInputView[] {
    return this.inputs.map((input) => input.toJSON())
  }

  static fromJSON(data: JsonInputView[], criterias: AvailableCriterias) {
    return new Inputs(data.map((input) => new Input(input.type, Node.fromJSON(input.value, criterias))))
  }
}

export type JsonNodeView = {
  id: string
  type: string
  params: JsonParamView[]
  inputs: JsonInputView[]
}

export type JsonParamView = {
  type: string
  value: number | null
}

export type JsonInputView = {
  type: string
  value: JsonNodeView | null
}

export class Node {
  private readonly id: string
  private readonly criteria: Criteria
  private readonly params: Params
  private readonly inputs: Inputs

  constructor(id: string, criteria: Criteria, params: Params, inputs: Inputs) {
    this.id = id
    this.criteria = criteria
    this.params = new Params(criteria.getSchema().params.map((param) => params.getParam(param.type)))
    this.inputs = new Inputs(criteria.getSchema().inputs.map((input) => inputs.getInput(input.type)))
  }

  remove(id: string): Node {
    if (this.id === id) {
      return this.inputs.getInput('one').value
    }
    return new Node(this.id, this.criteria, this.params, this.inputs.remove(id))
  }

  replace(id: string, criteria: Criteria, params: Params): Node {
    if (this.id === id) {
      return new Node(v4(), criteria, params, this.inputs)
    }
    return new Node(this.id, this.criteria, this.params, this.inputs.replace(id, criteria, params))
  }

  wrap(id: string, criteria: Criteria) {
    if (this.id === id) {
      return new Node(v4(), criteria, Params.blank(), new Inputs([new Input('one', this)]))
    }
    return new Node(this.id, this.criteria, this.params, this.inputs.wrap(id, criteria))
  }

  toJSON(): JsonNodeView {
    return {
      id: this.id,
      type: this.criteria.getSchema().type,
      params: this.params.toJSON(),
      inputs: this.inputs.toJSON(),
    }
  }

  eval(data: Data): Result {
    return this.criteria.eval(this.id, data, this.params, this.inputs)
  }

  static forStatic(id: string, value: number) {
    return new Node(id, new Static(), new Params([new Param('value', value)]), new Inputs([]))
  }

  static forNone() {
    return new Node(v4(), new None(), new Params([]), new Inputs([]))
  }

  static fromJSON(data: JsonNodeView | null, criterias: AvailableCriterias): Node {
    if (!data) {
      return new Node(v4(), new None(), new Params([]), new Inputs([]))
    }

    return new Node(
      data.id,
      criterias.get(data.type),
      Params.fromJSON(data.params),
      Inputs.fromJSON(data.inputs, criterias)
    )
  }
}
