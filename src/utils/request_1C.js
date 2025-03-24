import axios from 'axios'

const service = axios.create({
  baseURL: process.env.VUE_APP_1C_API,
  changeOrigin: true,
  mode: 'no-cors',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  credentials: 'same-origin'
})

export default service
