import axios from 'axios'

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  withCredentials: true, // send cookies when cross-domain requests
  headers: {
    'Accept': 'text/json',
    'Content-Type': 'application/json'
  },
})


service.interceptors.response.use(

  response => {
    const res = response?.data
    return res?.data || res
  }
)

export default service
