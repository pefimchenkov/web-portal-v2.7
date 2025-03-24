import { validateArt } from './utils.js'
export {
  reference,
  exportFileName,
  templateHeaders,
  legPersType,
  dialogItems,
  dialogOptions,
  projects,
  project_short
}

const reference = 'clientsTable'
const exportFileName = 'clients_list.xls'
const legPersType = ['ООО', 'ЗАО', 'ОАО', 'ПАО', 'АО', 'ИП']

const projects = [
  { PROJECT: 'КЛИЕНТЫ', TYPE_TABLE: 'client', SPEC_TABLE: 'not', SHORT_PROJ: 'КЛ', GROUP: null, ZAKUPKA: null },
  { PROJECT: 'ПАРТНЁРЫ', TYPE_TABLE: 'partner', SPEC_TABLE: 'not', SHORT_PROJ: 'ПАР', GROUP: null, ZAKUPKA: null },
  { PROJECT: 'ДИСТРИБЬЮТОРЫ', TYPE_TABLE: 'dealer', SPEC_TABLE: 'not', SHORT_PROJ: 'ДИC', GROUP: null, ZAKUPKA: null },
  { PROJECT: 'Поставщик', TYPE_TABLE: 'client', SPEC_TABLE: 'not', SHORT_PROJ: 'Пос', GROUP: null, ZAKUPKA: 1 },
  { PROJECT: 'ИНВЕНТ', TYPE_TABLE: 'client', SPEC_TABLE: 'not', SHORT_PROJ: 'Инв', GROUP: '10910', ZAKUPKA: null },
  { PROJECT: 'ИНДАСТРИ', TYPE_TABLE: 'client', SPEC_TABLE: 'not', SHORT_PROJ: 'Инд', GROUP: '10911', ZAKUPKA: null }
]

const project_short = ['КЛ', 'ПАР', 'ДИС', 'Пос', 'Инв', 'Инд']

const dialogItems = [
  {
    type: 'customInput',
    label: 'Бренд',
    value: 'NAME',
    visible: true,
    rules: {
      required: true,
      length: [3, 25]
    }
  },
  {
    type: 'customSelect',
    label: 'Тип Юрлица',
    value: 'LP_TYPE',
    visible: true,
    options: legPersType,
    rules: {
      required: true
    }
  },
  {
    type: 'customInput',
    label: 'Наименование Юрлица',
    value: 'LP_NAME',
    visible: true,
    rules: {
      required: true
    }
  },
  {
    type: 'customInput',
    label: 'Юрлицо Атлас',
    value: 'LEGPERS_ATLAS',
    visible: true,
    rules: {
      required: false
    }
  },
  {
    type: 'customInput',
    label: 'Код Юрлица по 1С',
    value: 'ART_1C',
    visible: true,
    rules: {
      required: true,
      validator: validateArt
    }
  },
  {
    type: 'customSelect',
    label: 'Тип контрагента',
    value: 'PROJECT',
    visible: true,
    options: projects.map(i => i.PROJECT),
    rules: {
      required: true
    }
  },
]
const dialogOptions = {
  labelWidth: '200px',
  add: 'Добавление клиента',
  update: 'Редактирование клиента',
}

const templateHeaders = [
  { text: 'ID', value: 'ID' },
  { text: 'Бренд', value: 'NAME' },
  { text: 'Юрлица', value: 'LEGPERS' },
  { text: 'Юрлица Атлас', value: 'LEGPERS_ATLAS' },
  { text: 'Куратор', value: 'HEAD_MANAGER' },
  { text: 'Менеджер', value: 'MANAGER' },
  { text: 'План', value: 'PLAN', width: '170' },
  { text: 'Маржа План', value: 'MARJA_PLAN', width: '170' },
  { text: 'Факт', value: 'FACT', width: '170' },
  { text: 'Маржа Факт', value: 'MARJA_FACT', width: '170' },
  { text: 'Факт без плана', value: 'marker' },
  { text: 'Прогресс', value: 'PERCENT' },
  { text: 'ОМ Продажи (новое)', value: 'OM_SALE' },
  { text: 'ОМ Продажи (склад)', value: 'OM_SALE_ZIP' },
  { text: 'ОМ Сервис', value: 'OM_SERV' },
  { text: 'ОМ IT', value: 'OM_IT' },
  { text: 'Тип', value: 'PROJECT' },
  { text: 'Статус CRM', value: 'CRM', align: 'center' },
  { text: 'Jira', value: 'Jira' },
  { text: 'Действия', value: 'actions', align: 'center' },
]
