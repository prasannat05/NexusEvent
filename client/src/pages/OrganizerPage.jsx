import { useState, useEffect } from 'react';
import { getEvents, createEvent, deleteEvent } from '../services/api';

export default function OrganizerPage() {
    const [events, setEvents] = useState([]);
    const [form, setForm] = useState({ title: '', date: '', location: '', maxCapacity: '' });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createEvent(form);
            setForm({ title: '', date: '', location: '', maxCapacity: '' });
            fetchEvents();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create event');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteEvent(id);
            fetchEvents();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete event');
        }
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div><p>Loading dashboard...</p></div>;

    return (
        <section className="view-section">
            <div className="view-header">
                <div>
                    <h2>Club Representative Control Panel</h2>
                    <p className="view-subtitle">Create new campus events and manage student rosters.</p>
                </div>
            </div>
            <div className="organizer-workspace">
                <form className="custom-form" onSubmit={handleSubmit}>
                    <h3>Host New Event</h3>
                    <div className="form-group">
                        <label>Event Title</label>
                        <input type="text" required placeholder="e.g., National Hackathon 2026" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Date & Time</label>
                            <input type="datetime-local" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Registration Limit</label>
                            <input type="number" min="1" required placeholder="e.g., 150" value={form.maxCapacity} onChange={e => setForm({...form, maxCapacity: e.target.value})} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Venue / Lab Room / Seminar Hall</label>
                        <input type="text" required placeholder="e.g., Main Auditorium" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
                    </div>
                    <button type="submit" className="btn btn-primary">Publish to Bulletin</button>
                </form>
                <div className="organizer-management">
                    <h3>Your Club's Events</h3>
                    <div className="list-container">
                        {events.length === 0 ? (
                            <p style={{ color: 'var(--text-dimmed)', fontSize: '0.9rem' }}>No active events.</p>
                        ) : (
                            events.map(event => (
                                <div className="item-row" key={event._id}>
                                    <div>
                                        <strong style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-intense)' }}>{event.title}</strong>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dimmed)', marginTop: '0.15rem' }}>👥 Registered: {event.attendees.length}</div>
                                    </div>
                                    <button className="btn btn-danger" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleDelete(event._id)}>Remove</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
