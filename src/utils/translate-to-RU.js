
const messages = [
  {
    en: 'The password is invalid or the user does not have a password.',
    ru: 'Пароль не верный или отстутствует.'
  },
  {
    en: 'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.',
    ru: 'Доступ к этой учетной записи был временно отключен из-за множества неудачных попыток входа в систему. Вы можете немедленно восстановить его, сбросив пароль, или можете повторить попытку позже.'
  },
  {
    en: 'There is no user record corresponding to this identifier. The user may have been deleted.',
    ru: 'Такого пользователя не существует или он был удалён ранее.'
  }
]

export function translateToRussian(mess) {
  const obj = messages.find(item => item.en === mess)
  return obj
    ? obj.ru
    : null
}
