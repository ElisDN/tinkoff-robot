import { MoneyValue, Quotation } from '../sdk/contracts/common'

export function quotationToFloat(quotation: Quotation): number {
  return quotation.units + Math.abs(quotation.nano / 1000_000_000)
}

export function moneyToFloat(moneyValue: MoneyValue): number {
  return quotationToFloat({ units: moneyValue.units, nano: moneyValue.nano })
}
