'use client'
import axios from "axios";
import { useState, useEffect } from "react";


export default function Home() {

  const [data, setData] = useState([]);

  const fetchQuestions = async () => {
    try {
      const endpoint = "https://examencivicabackend-production.up.railway.app/api/question/";
      const headers = {
        'Content-Type': 'application/json'
      }
      const response = await axios.get(endpoint, { headers });
      
      setData(response.data)

    } catch (error) {
      console.log(error)
    }
};

useEffect(()=> {
  fetchQuestions();
},[]);

console.log(data)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
    </main>
  );
}
