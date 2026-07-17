import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
    const { userProfile, role, logout } = useAuth();
    const navigate = useNavigate();

    const roleLabels = { student: 'Student', organizer: 'Club Organizer', admin: 'Campus Admin' };
    const avatarEmojis = { student: '🎓', organizer: '🎪', admin: '🛡️' };

    const navLinks = {
        student: [
            { to: '/explore', label: '🔍  Browse Registry' },
            { to: '/tickets', label: '🎫  My Passes' }
        ],
        organizer: [
            { to: '/organizer', label: '📋  Management Desk' },
            { to: '/explore', label: '🔍  Browse Registry' }
        ],
        admin: [
            { to: '/admin', label: '📊  System Overview' },
            { to: '/explore', label: '🔍  Browse Registry' }
        ]
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const links = navLinks[role] || navLinks.student;

    return (
        <aside className="sidebar">
            <div className="brand">
                <div className="brand-icon">N</div>
                <span className="logo-text">NexusCampus</span>
            </div>

            <div className="user-info-badge">
                <div className={`user-avatar ${role}`}>{avatarEmojis[role] || '🎓'}</div>
                <div className="user-info-text">
                    <span className="user-info-name">{userProfile?.displayName || 'User'}</span>
                    <span className="user-info-role">{roleLabels[role] || 'Student'}</span>
                </div>
            </div>

            <nav>
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
                    >
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            <button className="logout-btn" onClick={handleLogout}>
                ← Sign Out
            </button>
        </aside>
    );
}
