import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { submitOrganizerRequest, getMyRequestStatus } from '../services/api';

export default function Sidebar() {
    const { userProfile, role, logout, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [requestStatus, setRequestStatus] = useState(null);
    const [requestLoading, setRequestLoading] = useState(false);
    const [checked, setChecked] = useState(false);

    const roleLabels = { student: 'Student', organizer: 'Organizer', admin: 'Admin' };

    const navLinks = {
        student: [
            { to: '/explore', label: 'Browse Events' },
            { to: '/tickets', label: 'My Passes' }
        ],
        organizer: [
            { to: '/organizer', label: 'Management Desk' },
            { to: '/explore', label: 'Browse Events' },
            { to: '/tickets', label: 'My Passes' }
        ],
        admin: [
            { to: '/admin', label: 'Admin Dashboard' },
            { to: '/explore', label: 'Browse Events' }
        ]
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const checkRequestStatus = async () => {
        if (checked) return;
        try {
            const res = await getMyRequestStatus();
            setRequestStatus(res.data?.status || null);
        } catch {
            setRequestStatus(null);
        }
        setChecked(true);
    };

    // Check status on mount for students
    if (role === 'student' && !checked) {
        checkRequestStatus();
    }

    const handleRequestOrganizer = async () => {
        setRequestLoading(true);
        try {
            await submitOrganizerRequest();
            setRequestStatus('pending');
        } catch (err) {
            if (err.response?.status === 400) {
                setRequestStatus('pending');
            }
        } finally {
            setRequestLoading(false);
        }
    };

    const links = navLinks[role] || navLinks.student;
    const initials = (userProfile?.displayName || 'U').charAt(0).toUpperCase();

    return (
        <aside className="sidebar">
            <div className="brand">
                <div className="brand-icon">N</div>
                <span className="logo-text">NexusCampus</span>
            </div>

            <div className="user-info-badge">
                <div className={`user-avatar ${role}`}>{initials}</div>
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

            {role === 'student' && (
                <div className="organizer-request-section">
                    {requestStatus === 'pending' && (
                        <div className="request-status pending">Organizer request pending</div>
                    )}
                    {requestStatus === 'approved' && (
                        <div className="request-status approved">Approved! Refresh to update.</div>
                    )}
                    {requestStatus === 'rejected' && (
                        <div className="request-status rejected">Organizer request rejected</div>
                    )}
                    {!requestStatus && (
                        <button
                            className="btn btn-request-organizer"
                            onClick={handleRequestOrganizer}
                            disabled={requestLoading}
                        >
                            {requestLoading ? 'Sending...' : 'Become an Organizer'}
                        </button>
                    )}
                </div>
            )}

            <button className="logout-btn" onClick={handleLogout}>
                Sign Out
            </button>
        </aside>
    );
}
