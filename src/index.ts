import IMask from "imask";
import { MultiLang } from './MultiLang'
import { multiLangItems } from './MultiLangItems'
import Calculator from "./Calculator";
import { ShowTypes } from './ShowTypes'

const query = <T extends Element>(selector: string): T => {
  return document.querySelector(selector) as T
}

const queryAll = (selector: string) => {
  return Array.from(document.querySelectorAll(selector))
}

const radioButtons = queryAll(`.input-group input[type='radio']`)
const inputsNumber = queryAll(`.input-group input[type='number']`)
const inputs = queryAll('#calc-form input:required')
const fieldSets = queryAll('fieldset')

let phoneMask = IMask(
  query<HTMLElement>(`#phone`), {
    mask: '+{38}(000)000-00-00'
  }
)

const inputEvents = ['input', 'keyup', 'keypress', 'change']
const regexMail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

document.addEventListener('DOMContentLoaded', () => {
  radioButtons.forEach((radio: HTMLInputElement) => radio.checked = false)
  queryAll('.input-group')
    .forEach((f) => (f.children[1].children[0].children[0] as HTMLElement).click())
})
const lang = document.querySelector('html').getAttribute('lang').split('-').length ?
  query<HTMLElement>('html').getAttribute('lang').split('-')[0] :
  query<HTMLElement>('html').getAttribute('lang')

const calculator = new Calculator()
const multiLangObj = new MultiLang(multiLangItems, lang)

const printResult = (selector: string, [showMethod, data]:[ShowTypes, string], multiLang: MultiLang) => {
  switch (showMethod) {
    case "message":
      query<HTMLElement>('.price-text-cost').style.display = 'none'
      query<HTMLElement>(selector).innerText = data
      break
    case "twoValues":
      query<HTMLElement>('.price-text-cost').style.display = 'block'
      query<HTMLElement>(selector).innerText =
        `${multiLang.translate('Від')} ${data} ${multiLang.translate('до')} ${multiLang.translate('тис. грн.')}`
     break
    case "oneValue":
      query<HTMLElement>('.price-text-cost').style.display = 'block'
      query<HTMLElement>(selector).innerText =
        `${multiLang.translate("Від")} ${data} ${multiLang.translate('тис. грн.')}`
      break
  }
}

radioButtons.forEach(radio => {
  radio.addEventListener('change', (e) => {
    let radio = e.currentTarget as HTMLElement
    let propertyName = radio.getAttribute('data-name').trim()
    let propertyValue = radio.getAttribute('data-value').trim()
    let propertyCategory = radio.getAttribute('data-category').trim()
    calculator.setItem = {
      propertyCategory: propertyCategory,
      propertyName: propertyName,
      propertyValue: parseInt(propertyValue),
      type: "radio"
    }
    console.log("Баллы", calculator.getSumRate)
    printResult('.result-calc #result', calculator.calculateCost, multiLangObj)
  })
});

inputsNumber.forEach(inputNumber => {
  inputEvents.forEach((eventType) => {
    inputNumber.addEventListener(eventType, (e: KeyboardEvent) => {
      let inputNumber = e.currentTarget as HTMLInputElement
      let propertyValue = +inputNumber.value
      let propertyCategory = inputNumber.getAttribute('data-category').trim()
      calculator.setItem = {
        propertyCategory: propertyCategory,
        propertyName: multiLangObj.translate("Кількість"),
        propertyValue: propertyValue,
        type: 'number',
        selector: inputNumber.id
      }
      printResult('.result-calc #result', calculator.calculateCost, multiLangObj)
    })
  })
})

inputsNumber.forEach((input: HTMLInputElement) => {
  input.value = "0"
  calculator.setItem = {
    propertyCategory: input.getAttribute('data-category').trim(),
    propertyName: multiLangObj.translate("Кількість"),
    propertyValue: 0,
    type: 'number',
    selector: input.id
  }
})

query(`#calc-form button[type='submit']`)
  .addEventListener('click', (e) => {
    e.preventDefault()
    const radioButtonsChecked = document.querySelectorAll(`fieldset input[type='radio']:checked`)
    if (inputs.every((input: HTMLInputElement) => input.value !== '')
      && radioButtonsChecked.length === fieldSets.length - inputsNumber.length
      && query<HTMLInputElement>(`#calc-form input[type='checkbox']`).checked === true
      && phoneMask.unmaskedValue.length === 12
      && regexMail.test(query<HTMLInputElement>(`#email`).value)) {
      fetch('/wp-content/themes/UhyProstor/send-mail-calc-2.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          company: query<HTMLInputElement>(`#company`).value,
          name: query<HTMLInputElement>(`#name`).value,
          email: query<HTMLInputElement>(`#email`).value,
          phone: query<HTMLInputElement>(`#phone`).value,
          data: calculator.dataFormat,
          categories: calculator.categories,
          result: query<HTMLElement>(".result-calc #result").innerText,
          lang,
          hiddenResultText: calculator.isHideTextInMail
        })
      })
        .then(res => res.text())
        .then((status)=> {
          if(+status) {
            window.location.href = window.location.origin + multiLangObj.translate("/thank-you-page/")
          } else {
            query('#calc-form p').innerHTML = multiLangObj.translate("Сталася помилка, спробуйте пізніше")
            query('#calc-form p').classList.add('show', 'danger')
          }
        })
    } else {
      query('#calc-form p').innerHTML = multiLangObj.translate("Для відправки заявки корректно заповніть усі поля")
      query('#calc-form p').classList.add('show', 'danger')
      setTimeout(() => {
        query('#calc-form p').classList.remove('show', 'danger')
        query('#calc-form p').innerHTML = ''
      }, 5_000)
    }
  })