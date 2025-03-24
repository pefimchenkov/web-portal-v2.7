const recipients = [
  { name: 'RRC', color: '#1260ef' },
  { name: 'ЗИПСКЛАД', color: '#51d375' },
  { name: 'ИП ПИВКИН В.С.', color: '#41cf69' },
  { name: 'ИнфоТек и Сервис', color: '#35cb60' },
  { name: 'Ролекс СД', color: '#c9f9d5' },
  { name: 'СОЛВО', color: '#d5fddf' },
  { name: 'Вероян Трейдинг(Досов Руслан)', color: '#61d882' },
  { name: 'Штрих - м(Штрих Элит Сервис)', color: '#73de90' },
  { name: 'КОМПАС - С', color: '#86e4a0' },
  { name: 'КристаллСервисИнтеграция', color: '#97e9ae' },
  { name: 'Вайландт Электроник', color: '#2bc857' },
  { name: 'ZIPSTORE.RU', color: '#aaefbc' },
  { name: 'РСС', color: '#bbf5c9' },
  { name: 'КРЕДИТЫ', color: '#a21718' },
  { name: 'УФК', color: '#ae3130' },
  { name: 'БИОН', color: '#e6b216' },
  { name: 'Икс-Ком Шоп (xcom-shop)', color: '#e7b621' },
  { name: 'Ланит', color: '#eabb2f' },
  { name: 'ОЛДИ', color: '#ecc140' },
  { name: 'ПОС-Магазин', color: '#edc753' },
  { name: 'АГРОПАК (Контейнеры)', color: '#f0ce68' },
  { name: 'Типография Фаворит', color: '#f2d67d' },
  { name: 'УпакЛента', color: '#f6dd93' },
  { name: 'Новая этикетка', color: '#f7e4a8' },
  { name: 'Контур-пак', color: '#faeabb' },
  { name: 'Альфа риббон', color: '#fcf0cc' },
  { name: 'TOPRESALE (АДВАНТРЕЙД)', color: '#ea3535' },
  { name: 'ТОРОС (в ноутбуке)', color: '#e71d1d' },
  { name: 'ИП Белов', color: '#f08a27' },
  { name: 'ABS (ООО ЭйБиЭс)', color: '#ee7d0e' },
  { name: 'АТЛАС-ПРО', color: '#f9bd85' },
  { name: 'Инсенсор', color: '#ac798' },
  { name: 'Рыбников Эдуард Валерьевич', color: '#f7b270' },
  { name: 'ИП Ерохина', color: '#f5a75c' },
  { name: 'ИП Сергеева Е. Л.', color: '#f19336' },
  { name: 'ABS (ИП Уфимцев)', color: '#f8319' },
  { name: 'Ефимченков Павел (223)', color: '#f39c48' },
  { name: 'ТСД-сервис', color: '#999999' },
  { name: 'ИП ВОЛЬНОВ И.В.', color: '#808080' },
  { name: '(М2)', color: '#6f6e6e' },
  { name: 'OCS Distribution (О-Си-Эс-Центр)', color: '#1e68f0' },
  { name: 'MARVEL (Марвел-Дистрибуция)', color: '#2d72f1' },
  { name: 'РайтСкан (СКАНТЕХ)', color: '#3f7ef2' },
  { name: 'Treolan (Группа Компаний ЛАНИТ, АО «ИнфокомЭксим»)', color: '#548bf4' },
  { name: 'АТОЛ', color: '#6b9bf6' },
  { name: 'Чип и Дип', color: '#5518f0' },
  { name: 'Электронщик', color: '#6830f2' },
  { name: 'МПО Электромонтаж', color: '#8354f5' },
  { name: 'Chainway (ОКТРОН)', color: '#6b9bf6' }

]

const costs = [

  { name: 'Закупка обеспечение продаж', color: '#1260ef' },
  { name: 'ЗП', color: '#6f6e6e' },
  { name: 'ЗП_доплаты', color: '#999999' },
  { name: 'Кредит', color: '#e6b216' },
  { name: 'Услуги обеспечение продаж', color: '#a21718' },
  { name: 'Закупка собственные нужды', color: '#ee7d0e' },
  { name: 'Коммандировочные расходы', color: '#2bc857' }

]

const getColorByRecipient = (name) => {
  return recipients.find(obj => obj.name === name)?.color || '#' + Math.floor(Math.random() * 16777215).toString(16)
}

const getColorByCost = (name) => {
  return costs.find(obj => obj.name === name)?.color || '#' + Math.floor(Math.random() * 16777215).toString(16)
}

module.exports = { getColorByRecipient, getColorByCost }
