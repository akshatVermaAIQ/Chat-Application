import axios from 'axios';

const AXIOS = axios.create({
    baseURL : import.meta.env.MODE==="development"? 'http://localhost:8000/api' : "/api",
    withCredentials:true
})

AXIOS.interceptors.request.use((config)=>{

    if(config.data instanceof FormData){
        config.headers['Content-Type']='multipart/form-data'
    }else{
        config.headers['Content-Type']='application/json'
    }
    return config;
},
(error)=>{  
    Promise.reject(error)
})

export default AXIOS