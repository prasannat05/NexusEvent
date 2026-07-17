import { useState, useEffect } from 'react';
import { getMyTickets, cancelTicket } from '../services/api';

export default function TicketsPage() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = async () => {
        try {
            const res = await getMyTickets();
            setTickets(res.data);
        } catch (err) {
            console.error('Failed to fetch tickets:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTickets(); }, []);

    const handleCancel = async (eventId) => {
        try {
            await cancelTicket(eventId);
            fetchTickets();
        } catch (err) {
            alert(err.response?.data?.error || 'Cancel failed');
        }
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div><p>Loading passes...</p></div>;

    return (
        <section className="view-section">
            <div className="view-header">
                <div>
                    <h2>My Event Passes</h2>
                    <p className="view-subtitle">Your active gate passes and registration records.</p>
                </div>
            </div>
            <div className="cards-grid">
                {tickets.length === 0 ? (
                    <p style={{ color: 'var(--text-dimmed)', fontSize: '0.9rem' }}>No entries found in active credential storage.</p>
                ) : (
                    tickets.map(ticket => {
                        const event = ticket.eventId;
                        if (!event) return null;
                        return (
                            <div className="ui-card" key={ticket._id}>
                                <span className="ui-card-badge">✓ Confirmed RSVP</span>
                                <div>
                                    <h3>{event.title}</h3>
                                    <div className="ui-card-meta">📅 {new Date(event.date).toLocaleString()}</div>
                                    <div className="ui-card-meta">📍 {event.location}</div>
                                    <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-dimmed)' }}>
                                        PASS ID: {ticket.passId}
                                    </p>
                                </div>
                                <button className="btn btn-danger" style={{ marginTop: '1.5rem' }} onClick={() => handleCancel(event._id)}>
                                    Cancel RSVP
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
}
