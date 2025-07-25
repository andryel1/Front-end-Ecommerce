import axios from "axios";
import {useEffect}from "react";

const Api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com/',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true 

})

export function App() {
  useEffect(() => {
    Api.get("todos/1")
      .then(res => console.log(res.data));
  }, []);

  return (
    <div>
      <p></p>
    </div>
  );
}


