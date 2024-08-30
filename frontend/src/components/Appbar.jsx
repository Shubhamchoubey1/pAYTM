import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

export const Appbar = () => {
    const navigate = useNavigate();

    // Retrieve firstName from localStorage
    const firstName = localStorage.getItem("firstName");

    const handleLogout = useCallback(() => {
        // Remove token and firstName from localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("firstName");

        // Redirect to the signin page
        navigate("/signin");
    }, [navigate]); // Dependency array with navigate

    return (
        <div className="shadow h-14 flex justify-between">
            <div className="flex flex-col justify-center h-full ml-4">
                PayTM App
            </div>
            <div className="flex">
                <div className="flex flex-col justify-center h-full mr-4">
                    Hello, {firstName || "Guest"}  {/* Display firstName or 'Guest' */}
                </div>
                <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mt-1 mr-2">
                    <div className="flex flex-col justify-center h-full text-xl">
                        {firstName ? firstName.charAt(0) : "U"} {/* Display the first letter of the firstName */}
                    </div>
                </div>
                <button
                    className="ml-4 flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};
