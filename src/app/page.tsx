'use client'

import axios from "axios";
import { useState, useEffect } from "react";

export default function Home() {

  const [data, setData] = useState([]);

useEffect(() => {
  axios.get('http://localhost:8000/api/question/')
  .then(response => setData(response.data))
  .catch(error => console.error(error))
}, [])

console.log(data)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <p>{data[0].questionText}</p>
    </main>
  );
}
