import React, { useEffect, useState } from "react";
import "./Staff.css"; // Uvoz CSS fajla

const Staff = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("https://localhost:7151/api/Auth/GetUsers", {
                    method: "GET",
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch users.");
                }

                const data = await response.json();
                setUsers(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchUsers();
    }, []);

    if (error) {
        return <p className="error">{error}</p>;
    }

    return (
        <div className="staff-page">
        <div className="staff-container">
            <h2>Naš stručni tim</h2>
            <div className="cards-grid">
                {users.map((user) => (
                    <div key={user.id} className="staff-card">
                        <h3 className="staff-name">
                            {user.firstName} {user.lastName}
                        </h3>
                        <p className="staff-email">{user.email}</p>
                    </div>
                ))}
            </div>
        </div>
        </div>
    );
};

export default Staff;
