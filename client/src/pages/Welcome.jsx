import "../styles/Welcome.css";
import { Link } from "react-router-dom";

export default function Welcome() {
    return (
        <div className="welcome-wrapper">
            <nav className="navbar">
                <div className="brand">PassKeep</div>
                <Link to="/login" className="login-btn">
                    Login
                </Link>
            </nav>
            <div className="welcome-container">
                <div className="title">
                    <h1>Simpler Sign-in.</h1>
                    <h1>
                        <b>Safer Passwords.</b>
                    </h1>
                </div>
                <p>
                    PassKeep securely saves your passwords
                    <br />
                    and helps you sign in faster
                </p>
                <Link to="/features" className="goto-features">
                    Explore Features
                </Link>
            </div>
        </div>
    );
}
