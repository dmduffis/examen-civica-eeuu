import axios from "axios";
import { useState, useEffect } from "react";

export default function fetchQuestions() {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        
        setLoading(true);

        try {

            const endpoint = 'http://localhost:8000/api/question/';

            const headers = {
                'Content-Type': 'application/json',
            };

            const response = await axios.get(endpoint, {headers});
            const questions = response.data

            setData(questions)

            setLoading(false);
            
        } catch (error) {
            setError(error)

        } finally{
            setLoading(false);
        }
    }

    useEffect(()=> {
        fetchData();
    }, []);

    const refetch = ()=> {
        setLoading(true);
        fetchData();
    }

    return {data, loading, error, refetch}

};

