import { ShowTypes } from './ShowTypes'

type ICalcItem = {
  propertyCategory: string
  propertyName: string
  propertyValue: number
  type: 'radio' | 'number' | 'checkbox'
  selector?: string
}

export default class Calculator {
  private items: ICalcItem[] = []

  constructor() {
    this.deleteItemType = this.deleteItemType.bind(this)
  }

  set setItem(item: ICalcItem) {
    this.items = this.items
      .filter(i => i.propertyCategory !== item.propertyCategory)
    this.items.push(item)
  }

  private get maxRate() {
    return this.getSumRate * 1440
  }

  private get minRate() {
    return this.getSumRate * 1200
  }

  get calculateCost(): [ShowTypes, string[]] {
    if (this.getSumRate < 6) {
      return ['message', ['Пропонуємо звернутися в наш офіс за індивідуальним разрахунком']]
    }

    let inputNumbers = this.items
      .filter(item => item.type === 'number')
    let answer6: ICalcItem[] | number = inputNumbers
      .filter(input => input.selector === 'input-number-6')
    let answer7: ICalcItem[] | number = inputNumbers
      .filter(input => input.selector === 'input-number-7')
    let answer7val = answer7.length ? answer7[0].propertyValue : 0
    let answer6val = answer6.length ? answer6[0].propertyValue : 0

    return ['twoValues', [`${this.minRate + answer6val * 60 + answer7val * 480}`,
      `${this.maxRate + answer6val * 60 + answer7val * 480}`]]
  }

  get getSumRate() {
    return this.items
      .filter(item => item.type === 'radio' || item.type === 'checkbox')
      .map(item => item.propertyValue)
      .reduce((rate, acc) => rate + acc)
  }

  get dataFormat() {
    let o: { [key: string]: any } = {}
    this.items.sort((a, b) => {
      return +a.propertyCategory[0] - +b.propertyCategory[0]
    }).forEach(item => {
      if(item.type === 'radio' || item.type === 'checkbox') {
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

  deleteItemType(itemType: 'radio' | 'number' | 'checkbox') {
    this.items = this.items
      .filter(i =>
        i.type !== itemType)
  }

  get categories() {
    return this.items
      .map(item => item.propertyCategory)
  }

  get isHideTextInMail(): boolean {
    return this.getSumRate < 6
  }
}