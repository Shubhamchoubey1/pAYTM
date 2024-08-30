import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { TransactionHistory } from "../components/TransactionHistory"; // Assume this is already created

export const BalanceAndHistory = () => {
    const [balance, setBalance] = useState(0);
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState('');

    const fetchBalanceAndHistory = useCallback(() => {
        axios.get("http://localhost:3000/api/v1/account/balance", {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token"),
            },
        })
        .then((res) => {
            setBalance(res.data.balance);
            setId(res.data.userId);
        })
        .catch((error) => {
            console.error("Error fetching balance:", error);
        });
    }, []); // No dependencies, so this function won't be recreated unless the component is re-mounted

    const handlePasswordSubmit = useCallback(() => {
        axios.post("http://localhost:3000/api/v1/user/validate-password", { password }, {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token"),
            },
        })
        .then((res) => {
            if (res.data.success) {
                setIsAuthenticated(true);
                fetchBalanceAndHistory();
            } else {
                setError("Invalid password. Please try again.");
            }
        })
        .catch((error) => {
            console.error("Error validating password:", error);
            setError("An error occurred. Please try again later.");
        });
    }, [password]); // Dependencies: password and fetchBalanceAndHistory

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-2xl font-bold mb-4">Balance and Transaction History</h1>
            {!isAuthenticated ? (
                <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                    <div className="text-center mb-4">
                        <div className="text-lg font-bold">Enter your password</div>
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="mt-2 p-2 border rounded w-full"
                    />
                    {error && <div className="text-red-500 mt-2">{error}</div>}
                    <button onClick={handlePasswordSubmit} className="mt-4 p-2 bg-blue-500 text-white rounded w-full">
                        Submit
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg w-full max-w-md h-full">
                    <div className="font-bold text-lg mb-4">Your balance</div>
                    <div className="font-semibold text-lg mb-4">Rs {balance}</div>
                    <div className="flex-grow overflow-auto w-full">
                        <TransactionHistory userId={id} />
                    </div>
                </div>
            )}
        </div>
    );
};