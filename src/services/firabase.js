import config from '@/config/fb'
// IMPORTANT just import firebase
import firebase from 'firebase/app'

// import package
import 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/storage'

const fb = firebase.initializeApp(config)
fb.auth().languageCode = 'ru'

export default fb
