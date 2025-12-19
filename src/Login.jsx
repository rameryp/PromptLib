import { signInWithGoogle } from './firebase-config';
import './Login.css';

const Login = () => {
    const handleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            alert("Failed to login: " + error.message);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-logo">Prompt Library</div>
                <h1>Welcome Back</h1>
                <p>Sign in with your Google account to access your prompts.</p>

                <button className="btn-google" onClick={handleLogin}>
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google logo"
                    />
                    Sign in with Google
                </button>

                <div className="login-footer">
                    Powered by Antigravity
                </div>
            </div>
        </div>
    );
};

export default Login;
