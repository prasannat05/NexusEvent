import { useState, useEffect } from 'react';
import { getEvents, deleteEvent, getOrganizerRequests, approveRequest, rejectRequest } from '../services/api';

export default function AdminPage() {
    const [events, setEvents] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = async () => {
        try {
            const res = await getEvents();
            setEvents(res.data);
        } catch (err) {
            console.error('Failed to fetch events:', err);
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await getOrganizerRequests();
            setRequests(res.data);
        } catch (err) {
            console.error('Failed to fetch requests:', err);
        }
    };

    useEffect(() => {
        Promise.all([fetchEvents(), fetchRequests()]).finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id) => {
        try {
            await deleteEvent(id);
            fetchEvents();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete');
        }
    };

    const handleApprove = async (id) => {
        try {
            await approveRequest(id);
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to approve');
        }
    };

    const handleReject = async (id) => {
        try {
            await rejectRequest(id);
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to reject');
        }
    };

    const totalRegs = events.reduce((acc, e) => acc + e.attendees.length, 0);
    const pendingRequests = requests.filter(r => r.status === 'pending');

    if (loading) return <div className="loading-screen"><div className="spinner"></div><p>Loading admin panel...</p></div>;

    return (
        <section className="view-section">
            <div className="view-header">
                <div>
                    <h2>Admin Dashboard</h2>
                    <p className="view-subtitle">Manage events, users, and organizer approvals.</p>
                </div>
            </div>

            <div className="metrics-row">
                <div className="metric-card">
                    <h4>Active Events</h4>
                    <p>{events.length}</p>
                </div>
                <div className="metric-card">
                    <h4>Total Registrations</h4>
                    <p>{totalRegs}</p>
                </div>
                <div className="metric-card">
                    <h4>Pending Approvals</h4>
                    <p>{pendingRequests.length}</p>
                </div>
            </div>

            {/* Organizer Requests Section */}
            {requests.length > 0 && (
                <div className="admin-table-wrapper">
                    <h3>Organizer Requests</h3>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Requested On</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req._id}>
                                    <td><strong>{req.displayName}</strong></td>
                                    <td>{req.email}</td>
                                    <td>
                                        <span className={`status-badge status-${req.status}`}>
                                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                        </span>
                                    </td>
                                    <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        {req.status === 'pending' ? (
                                            <div className="action-btns">
                                                <button className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleApprove(req._id)}>Approve</button>
                                                <button className="btn btn-danger" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleReject(req._id)}>Reject</button>
                                            </div>
                                        ) : (
                                            <span style={{ color: 'var(--text-dimmed)', fontSize: '0.8rem' }}>Resolved</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Events Table */}
            <div className="admin-table-wrapper">
                <h3>All Events</h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Event Name</th>
                            <th>Date</th>
                            <th>Venue</th>
                            <th>Registrations</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map(event => (
                            <tr key={event._id}>
                                <td><strong>{event.title}</strong></td>
                                <td>{new Date(event.date).toLocaleDateString()}</td>
                                <td>{event.location}</td>
                                <td>{event.attendees.length} / {event.maxCapacity}</td>
                                <td>
                                    <button className="btn btn-danger" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleDelete(event._id)}>Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
