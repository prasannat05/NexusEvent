import { useState, useEffect } from 'react';
import { getEvents, deleteEvent } from '../services/api';

export default function AdminPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = async () => {
        try {
            const res = await getEvents();
            setEvents(res.data);
        } catch (err) {
            console.error('Failed to fetch events:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, []);

    const handleDelete = async (id) => {
        try {
            await deleteEvent(id);
            fetchEvents();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete');
        }
    };

    const totalRegs = events.reduce((acc, e) => acc + e.attendees.length, 0);

    if (loading) return <div className="loading-screen"><div className="spinner"></div><p>Loading admin panel...</p></div>;

    return (
        <section className="view-section">
            <div className="view-header">
                <div>
                    <h2>Dean / Admin Master Panel</h2>
                    <p className="view-subtitle">Global oversight of all departmental and club activities.</p>
                </div>
            </div>
            <div className="metrics-row">
                <div className="metric-card">
                    <h4>Active Event Approvals</h4>
                    <p>{events.length}</p>
                </div>
                <div className="metric-card">
                    <h4>Total Student RSVPs</h4>
                    <p>{totalRegs}</p>
                </div>
            </div>
            <div className="admin-table-wrapper">
                <h3>Master College Event Directory</h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Event / Fest Name</th>
                            <th>Date</th>
                            <th>Allotted Venue</th>
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
                                    <button className="btn btn-danger" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleDelete(event._id)}>Terminate</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
