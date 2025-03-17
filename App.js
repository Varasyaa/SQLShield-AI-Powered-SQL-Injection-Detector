import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [sqlQuery, setSqlQuery] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [queryHistory, setQueryHistory] = useState([]);

    const handleInputChange = (event) => {
        setSqlQuery(event.target.value);
    };

    const handleDetectSQL = async () => {
        if (!sqlQuery.trim()) return;
        setLoading(true);
        try {
            const response = await axios.post('http://127.0.0.1:5000/detect_sql', {
                query: sqlQuery,
            });
            setResult(response.data);
            setQueryHistory([...queryHistory, { query: sqlQuery, status: response.data.status }]);
        } catch (error) {
            console.error('Error detecting SQL injection:', error);
            setResult({ query: sqlQuery, status: 'Error connecting to server' });
        }
        setLoading(false);
    };

    const clearHistory = () => {
        setQueryHistory([]);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
            <h1 className="text-3xl font-bold mb-4">AI-Based SQL Injection Detection</h1>
            <textarea
                className="w-full max-w-lg p-2 border rounded"
                rows="6"
                placeholder="Enter SQL query here..."
                value={sqlQuery}
                onChange={handleInputChange}
            ></textarea>
            <button onClick={handleDetectSQL} className="bg-blue-500 text-white px-4 py-2 mt-4 rounded">
                {loading ? 'Detecting...' : 'Detect SQL Injection'}
            </button>
            {result && (
                <div className="mt-4 p-4 bg-white shadow-md rounded w-full max-w-lg">
                    <p><strong>Query:</strong> {result.query}</p>
                    <p><strong>Status:</strong> {result.status}</p>
                    {result.error && <p className="text-red-500">Error: {result.error}</p>}
                </div>
            )}
            <div className="mt-6 w-full max-w-lg">
                <h2 className="text-xl font-bold mb-2">Query History</h2>
                <ul className="bg-white p-4 shadow-md rounded">
                    {queryHistory.length > 0 ? (
                        queryHistory.map((entry, index) => (
                            <li key={index} className="border-b py-2">
                                <strong>Query:</strong> {entry.query} <br />
                                <strong>Status:</strong> {entry.status}
                            </li>
                        ))
                    ) : (
                        <p className="text-gray-500">No queries submitted yet.</p>
                    )}
                </ul>
                <button onClick={clearHistory} className="bg-red-500 text-white px-3 py-1 mt-3 rounded">
                    Clear History
                </button>
            </div>
        </div>
    );
}

export default App;
