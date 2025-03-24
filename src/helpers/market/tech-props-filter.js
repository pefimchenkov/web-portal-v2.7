import store from '@/store'

async function init() {
  await store.dispatch('fetchTechProperties')
  await store.dispatch('fetchTechPropertiesFit')
  await store.dispatch('fetchTechPropertiesValues')

  const tp = store.getters.techProperties
  const tpv = store.getters.techPropertiesValues
  const tpf = store.getters.techPropertiesFit

  return { tp, tpv, tpf }
}

async function createTechProps() {
  const { tpf } = await init()

  const new_arr = tpf
    .sort((a, b) => {
      return a.zip - b.zip
    })
    .map(function(item, index, array) {
      function calc() {
        const ids = []
        const duplicates = array.filter(elem => elem.zip === item.zip)
        duplicates.forEach(element => {
          ids.push(element.th)
        })
        return { zip: item.zip, ids }
      }

      const prev = array[index - 1]
      const cur = array[index]

      if (prev && cur['zip'] === prev['zip']) return
      return calc()
    })
  return [...new Set(new_arr)].filter(item => item)
}
async function getTechProps(obj) {
  const { tp } = await init()
  if (obj && obj.name) {
    return tp.filter(item => item.types.includes(obj.name))
  }
  return []
}
async function getTechPropsVal(obj) {
  const { tpv } = await init()

  // console.log(tpv)
  // console.log(obj)

  return obj.map(el => {
    return { name: el.name, values: tpv.filter(item => item.parent_id === el.id) }
  })
}

export { createTechProps, getTechProps, getTechPropsVal }
