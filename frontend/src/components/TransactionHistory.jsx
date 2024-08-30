import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const TransactionHistory = ({ userId }) => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/v1/account/history/${userId}`);
                setTransactions(response.data);
            } catch (error) {
                console.error("Error fetching transaction history", error);
            }
        };

        fetchTransactions();
    }, [userId]);

    return (
        <div className="transaction-history p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Transaction History</h2>
            <ul className="space-y-4">
                {transactions.map(transaction => (
                    <li key={transaction._id} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-semibold text-gray-600">Amount:</p>
                            <p className={`text-lg font-bold ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {transaction.amount < 0 ? `-Rs ${Math.abs(transaction.amount)}` : `+Rs ${transaction.amount}`}
                            </p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-semibold text-gray-600">Status:</p>
                            <p className={`text-lg font-bold ${transaction.status === 'successful' ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-semibold text-gray-600">Date:</p>
                            <p className="text-lg text-gray-700">{new Date(transaction.date).toLocaleDateString()}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};