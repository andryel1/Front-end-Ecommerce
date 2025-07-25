import axios from "axios";
import {useEffect}from "react";

const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com/',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true 

})

useEffect(() => {

api.get("todos/1")
.then(res =>{
return res
})
.catch(error =>{
    return error
})
});
