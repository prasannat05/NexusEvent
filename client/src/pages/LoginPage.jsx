import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const { login, signup } = useAuth();
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        student: { email: '', password: '', displayName: '' },
        organizer: { email: '', password: '', displayName: '' },
        admin: { email: '', password: '', displayName: '' }
    });

    const roles = [
        { key: 'student', icon: '🎓', title: 'Student Portal', subtitle: 'Browse events, RSVP, and manage your passes', redirect: '/explore' },
        { key: 'organizer', icon: '🎪', title: 'Club Organizer', subtitle: 'Create events and manage student rosters', redirect: '/organizer' },
        { key: 'admin', icon: '🛡️', title: 'Campus Admin', subtitle: 'Full oversight of all campus activities', redirect: '/admin' }
    ];

    const handleChange = (role, field, value) => {
        setFormData(prev => ({
            ...prev,
            [role]: { ...prev[role], [field]: value }
        }));
        setErrors(prev => ({ ...prev, [role]: '' }));
    };

    const handleSubmit = async (e, roleInfo) => {
        e.preventDefault();
        const data = formData[roleInfo.key];
        setErrors(prev => ({ ...prev, [roleInfo.key]: '' }));

        try {
            if (isSignUp) {
                await signup(data.email, data.password, data.displayName || data.email.split('@')[0], roleInfo.key);
            } else {
                await login(data.email, data.password);
            }
            navigate(roleInfo.redirect);
        } catch (err) {
            let msg = 'Authentication failed';
            if (err.code === 'auth/user-not-found') msg = 'No account found. Sign up first!';
            else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') msg = 'Invalid email or password';
            else if (err.code === 'auth/email-already-in-use') msg = 'Email already registered. Sign in instead!';
            else if (err.code === 'auth/weak-password') msg = 'Password must be at least 6 characters';
            else if (err.code === 'auth/invalid-email') msg = 'Invalid email address';
            setErrors(prev => ({ ...prev, [roleInfo.key]: msg }));
        }
    };

    return (
        <div className="login-screen">
            <div className="login-brand">
                <h1>NexusCampus</h1>
                <p>Choose your portal to continue</p>
            </div>

            <div className="login-mode-toggle">
                <button className={!isSignUp ? 'active' : ''} onClick={() => setIsSignUp(false)}>Sign In</button>
                <button className={isSignUp ? 'active' : ''} onClick={() => setIsSignUp(true)}>Sign Up</button>
            </div>

            <div className="login-cards-row">
                {roles.map((roleInfo) => (
                    <div className="login-card" key={roleInfo.key}>
                        <div className={`login-card-icon ${roleInfo.key}`}>{roleInfo.icon}</div>
                        <h3>{roleInfo.title}</h3>
                        <p className="login-subtitle">{roleInfo.subtitle}</p>
                        <form className="login-form" onSubmit={(e) => handleSubmit(e, roleInfo)}>
                            {isSignUp && (
                                <input
                                    type="text"
                                    className="login-input"
                                    placeholder="Display Name"
                                    value={formData[roleInfo.key].displayName}
                                    onChange={(e) => handleChange(roleInfo.key, 'displayName', e.target.value)}
                                />
                            )}
                            <input
                                type="email"
                                className="login-input"
                                placeholder="Email address"
                                value={formData[roleInfo.key].email}
                                onChange={(e) => handleChange(roleInfo.key, 'email', e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                className="login-input"
                                placeholder="Password"
                                value={formData[roleInfo.key].password}
                                onChange={(e) => handleChange(roleInfo.key, 'password', e.target.value)}
                                required
                            />
                            <button type="submit" className="login-btn">
                                {isSignUp ? `Sign Up as ${roleInfo.title.split(' ')[0]}` : `Sign In as ${roleInfo.title.split(' ')[0]}`}
                            </button>
                            {errors[roleInfo.key] && <p className="login-error">{errors[roleInfo.key]}</p>}
                        </form>
                    </div>
                ))}
            </div>
        </div>
    );
}
