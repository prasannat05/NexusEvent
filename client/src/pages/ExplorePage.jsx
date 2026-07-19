import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEvents, registerForEvent } from '../services/api';

export default function ExplorePage() {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState('');
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

    const handleRegister = async (eventId) => {
        try {
            await registerForEvent(eventId);
            fetchEvents();
        } catch (err) {
            alert(err.response?.data?.error || 'Registration failed');
        }
    };

    const filtered = events.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.location.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="loading-screen"><div className="spinner"></div><p>Loading events...</p></div>;

    return (
        <section className="view-section">
            <div className="view-header">
                <div>
                    <h2>Campus Event Bulletin</h2>
                    <p className="view-subtitle">Discover and RSVP to upcoming club events, fests, and technical symposia.</p>
                </div>
                <input
                    type="text"
                    id="search-bar"
                    placeholder="Search events, clubs, or venues..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="cards-grid">
                {filtered.length === 0 ? (
                    <p style={{ color: 'var(--text-dimmed)', fontSize: '0.9rem', padding: '1rem' }}>No matching event entries found.</p>
                ) : (
                    filtered.map(event => {
                        const booked = event.attendees.length;
                        const percent = Math.min((booked / event.maxCapacity) * 100, 100);
                        const isRegistered = event.attendees.includes(user?.uid);
                        const isFull = booked >= event.maxCapacity;

                        return (
                            <div className="ui-card" key={event._id}>
                                <div>
                                    <h3>{event.title}</h3>
                                    <div className="ui-card-meta">{new Date(event.date).toLocaleString()}</div>
                                    <div className="ui-card-meta">{event.location}</div>
                                    <div className="capacity-tracker">
                                        <div className="capacity-text">
                                            <span>Roster Capacity</span>
                                            <span>{booked} / {event.maxCapacity} Students</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${percent}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                                {isRegistered ? (
                                    <button className="btn btn-primary" disabled>✓ Confirmed</button>
                                ) : isFull ? (
                                    <button className="btn btn-danger" disabled>Capacity Exhausted</button>
                                ) : (
                                    <button className="btn btn-primary" onClick={() => handleRegister(event._id)}>Request Registration</button>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
}
