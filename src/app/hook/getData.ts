import { useState } from "react";

export default function Data() {
    
    const [data, setData] = useState([]);

async function getData() {
    const res = await fetch('https://examencivicabackend-production.up.railway.app/api/question/', {cache: 'no-store'});
    const questions = await res.json()
    setData (questions);
}

return { data }
}
