import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import "../styles/Dashboard.css";

function Dashboard() {
    const [website, setWebsite] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordList, setPasswordList] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState({});
    const [loadingPasswords, setLoadingPasswords] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (userId) {
            Axios.get(`http://localhost:5001/showpasswords/${userId}`).then(
                (response) => {
                    setPasswordList(response.data);
                }
            );
        } else {
            navigate("/login"); // if user is not logged in, they cannot redirect to dashboard until they login
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

    const handleLogout = () => {
        localStorage.clear(); // clear userId to logout
        navigate("/");
    };

    return (
        <div className="main-container">
            <nav className="sidebar">
                <h1>PassKeep</h1>
                <p onClick={() => navigate("/")}>Home</p>
                <p>Dashboard</p>
                <p onClick={handleLogout}>Logout</p>
            </nav>
            <div className="form-container">
                <h1 style={{ textAlign: "center" }}>Add A Password</h1>
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

            <div className="password-list" style={{ textAlign: "left" }}>
                {passwordList.map((pwd, key) => (
                    <div key={key} className="password-item">
                        Website: {pwd.website_name}
                        <br /> Email: {pwd.email}
                        <br />
                        Password:
                        {loadingPasswords[pwd.id] ? (
                            <span>Loading...</span>
                        ) : isPasswordVisible[pwd.id] ? (
                            isPasswordVisible[pwd.id]
                        ) : (
                            "********"
                        )}
                        <div
                            onClick={() => togglePasswordVisibility(pwd)}
                            style={{
                                backgroundColor: "black",
                                color: "white",
                            }}
                        >
                            reveal
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;
