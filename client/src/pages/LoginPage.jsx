import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const { login, signup } = useAuth();
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        displayName: ''
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                await signup(formData.email, formData.password, formData.displayName || formData.email.split('@')[0]);
            } else {
                await login(formData.email, formData.password);
            }
            navigate('/explore');
        } catch (err) {
            let msg = 'Authentication failed';
            if (err.code === 'auth/user-not-found') msg = 'No account found. Sign up first!';
            else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') msg = 'Invalid email or password';
            else if (err.code === 'auth/email-already-in-use') msg = 'Email already registered. Sign in instead!';
            else if (err.code === 'auth/weak-password') msg = 'Password must be at least 6 characters';
            else if (err.code === 'auth/invalid-email') msg = 'Invalid email address';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-screen">
            <div className="login-brand">
                <h1>NexusCampus</h1>
                <p>Campus Event Management Platform</p>
            </div>

            <div className="login-mode-toggle">
                <button className={!isSignUp ? 'active' : ''} onClick={() => setIsSignUp(false)}>Sign In</button>
                <button className={isSignUp ? 'active' : ''} onClick={() => setIsSignUp(true)}>Sign Up</button>
            </div>

            <div className="login-cards-row">
                <div className="login-card">
                    <div className="login-card-icon-single">
                        <div className="brand-icon-large">N</div>
                    </div>
                    <h3>{isSignUp ? 'Create Your Account' : 'Welcome Back'}</h3>
                    <p className="login-subtitle">{isSignUp ? 'Join the campus community' : 'Sign in to continue'}</p>
                    <form className="login-form" onSubmit={handleSubmit}>
                        {isSignUp && (
                            <input
                                type="text"
                                className="login-input"
                                placeholder="Display Name"
                                value={formData.displayName}
                                onChange={(e) => handleChange('displayName', e.target.value)}
                            />
                        )}
                        <input
                            type="email"
                            className="login-input"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            className="login-input"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            required
                        />
                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
                        </button>
                        {error && <p className="login-error">{error}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
}
