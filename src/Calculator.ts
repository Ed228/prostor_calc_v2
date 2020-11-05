import { ShowTypes } from './ShowTypes'

interface ICalcItem {
  propertyCategory: string
  propertyName: string
  propertyValue: number
  type: 'radio' | 'number'
  selector?: string
}

export default class Calculator {
  private items: ICalcItem[] = []

  constructor() {}

  set setItem(item: ICalcItem) {
    this.items = this.items
      .filter(i => i.propertyCategory !== item.propertyCategory)
    this.items.push(item)
  }

  get maxRate() {
    return this.getSumRate * 1440
  }

  get minRate() {
    return this.getSumRate * 1200
  }

  get calculateCost(): [ShowTypes, string] {
    if (this.getSumRate < 6) {
      return ['message', 'Пропонуємо звернутися в наш офіс за індивідуальним разрахунком']
    }

    let inputNumbers = this.items
      .filter(item => item.type === 'number')
    let answer6: ICalcItem[] | number = inputNumbers
      .filter(input => input.selector === 'input-number-6')
    let answer7: ICalcItem[] | number = inputNumbers
      .filter(input => input.selector === 'input-number-7')
    let answer7val = answer7.length ? answer7[0].propertyValue : 0
    let answer6val = answer6.length ? answer6[0].propertyValue : 0
    if (this.getSumRate > 20 || answer6val < 1 || answer6val > 400
      || answer7val < 1 || answer7val > 50) {
      return ['oneValue' , `${this.minRate + answer6val * 50 + answer7val * 400}`]
    }

    return ['twoValues', `${this.minRate + answer6val * 50 + answer7val * 400}` + ' - ' +
    `${this.maxRate + answer6val * 70 + answer7val * 600}`]
  }

  get getSumRate() {
    return this.items
      .filter(item => item.type === 'radio')
      .map(item => item.propertyValue)
      .reduce((rate, acc) => rate + acc)
  }

  get dataFormat() {
    let o: { [key: string]: any } = {}
    this.items.sort((a, b) => {
      return +a.propertyCategory[0] - +b.propertyCategory[0]
    }).forEach(item => {
      if(item.type === 'radio') {
        o[item.propertyCategory] = {
          [item.propertyName]: item.propertyValue
        }
      } else {
        o[item.propertyCategory] = {
          [item.propertyValue]: item.propertyValue
        }
      }
    })
    return o
  }

  get categories() {
    return this.items
      .map(item => item.propertyCategory)
  }

  get isHideTextInMail(): boolean {
    return this.getSumRate < 6
  }
}