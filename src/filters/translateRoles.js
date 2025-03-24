
export function translateRoles(roles) {
  return roles.map(role => {
    switch (role) {
      case 'user': return 'Пользователь'
      case 'admin': return 'Администратор'
      case 'agent': return 'Посредник'
      case 'engineer': return 'Инженер'
      case 'leadEngineer': return 'Ведущий инженер'
      case 'financier': return 'Финансист'
      case 'superFinancier': return 'Супер-финансист'
      case 'manager': return 'Менеджер'
      case 'serviceManager': return 'Сервис менеджер'
      case 'crm': return 'CRM'
      case 'nom': return 'Номенклатура'
      case 'snEditor': return 'Редактор Серийных Номеров'
      case 'limitedFinancier': return 'Финансист (с ограничениями)'
      default: {
        return 'роль не описана'
      }
    }
  }).join(', ')
}
