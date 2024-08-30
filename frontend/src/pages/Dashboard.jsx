import { useNavigate } from "react-router-dom";
import {Appbar} from "../components/Appbar";
import {Users} from "../components/Users";

export const Dashboard = () => {
    const navigate = useNavigate();

    // const handleBalanceAndHistoryClick = () => {
    //     navigate("/balance-history");
    // };

    return (
        <div>
            <Appbar />
            <div className="m-8">
                <button
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
                    onClick={() => {
                    navigate("/balance-history");
                    }}
                >
                    View Balance & History
                </button>
                <Users />
            </div>
        </div>
    );
};
