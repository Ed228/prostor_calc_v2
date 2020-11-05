interface IkeyValString {
  [k: string] : string
}

export interface IMultiLangItem extends IkeyValString{
  "uk": string
  "ru": string
  "en": string
}

export class MultiLang {
  private multiLangItems: IMultiLangItem[]
  private readonly lang: keyof IMultiLangItem

  constructor(multiLangItems: IMultiLangItem[], currentLang: string) {
    this.multiLangItems = multiLangItems
    this.lang = currentLang
  }

  translate(string: string): string {
    let searchItem = this.multiLangItems
      .filter((item: IMultiLangItem) => {
        return Object.values(item)
          .some(s => s.toLowerCase() === string.toLowerCase())
      })[0]
    if(!searchItem) throw new Error('MultiLang Error. No strings matches to translate')
    return searchItem[this.lang]
  }
}