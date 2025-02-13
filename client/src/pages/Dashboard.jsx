import { useState, useEffect } from "react";
import Axios from "axios";
import "../styles/App.css";

function Dashboard() {
    const [website, setWebsite] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordList, setPasswordList] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState({});
    const [loadingPasswords, setLoadingPasswords] = useState({});

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (userId) {
            Axios.get(`http://localhost:5001/showpasswords/${userId}`).then(
                (response) => {
                    setPasswordList(response.data);
                }
            );
        }
    }, [refresh]);

    const addPassword = (e) => {
        e.preventDefault();
        const userId = localStorage.getItem("userId");

        Axios.post("http://localhost:5001/addpassword", {
            userId: userId,
            email: email,
            password: password,
            website: website,
        })
            .then(() => {
                setRefresh(!refresh);
            })
            .finally(() => {
                setEmail("");
                setWebsite("");
                setPassword("");
            });
    };

    const decryptPassword = (encryption) => {
        setLoadingPasswords((prev) => ({
            ...prev,
            [encryption.id]: true, // Set loading state
        }));

        Axios.post("http://localhost:5001/decryptpassword", {
            password: encryption.password,
            iv: encryption.iv,
        })
            .then((response) => {
                setIsPasswordVisible((prev) => ({
                    ...prev,
                    [encryption.id]: response.data, // Store decrypted password
                }));

                setLoadingPasswords((prev) => ({
                    ...prev,
                    [encryption.id]: false, // Remove loading state
                }));
            })
            .catch(() => {
                setLoadingPasswords((prev) => ({
                    ...prev,
                    [encryption.id]: false, // Remove loading state on error
                }));
            });
    };

    const togglePasswordVisibility = (pwd) => {
        if (!isPasswordVisible[pwd.id]) {
            decryptPassword(pwd);
        } else {
            setIsPasswordVisible((prev) => ({
                ...prev,
                [pwd.id]: null, // Hide password on second click
            }));
        }
    };

    return (
        <div className="main-container">
            <nav className="sidebar">
                <h1>PassKeep</h1>
                <p>Home</p>
                <p>Dashboard</p>
                <p>Logout</p>
            </nav>
            <div className="form-container">
                <form onSubmit={addPassword}>
                    <input
                        value={website.trimStart()}
                        onChange={(e) => setWebsite(e.target.value)}
                        type="text"
                        required
                        placeholder="Enter website name"
                    />
                    <input
                        value={email.trimStart()}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        required
                        placeholder="Enter your email"
                    />
                    <input
                        value={password.trimStart()}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        required
                        placeholder="Enter your password"
                    />
                    <button type="submit">Add Password</button>
                </form>
            </div>

            <div className="password-list">
                {passwordList.map((pwd, key) => (
                    <div key={key} className="password-item">
                        {pwd.website_name}:{" "}
                        {loadingPasswords[pwd.id] ? (
                            <span>Loading...</span>
                        ) : isPasswordVisible[pwd.id] ? (
                            isPasswordVisible[pwd.id]
                        ) : (
                            "********"
                        )}
                        <div onClick={() => togglePasswordVisibility(pwd)}>
                            reveal
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;
