import axios from 'axios';
import { auth } from '../firebase';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE
});

// Attach Firebase token to every request
api.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Auth ──
export const registerUser = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');

// ── Events ──
export const getEvents = () => api.get('/events');
export const getEvent = (id) => api.get(`/events/${id}`);
export const createEvent = (data) => api.post('/events', data);
export const deleteEvent = (id) => api.delete(`/events/${id}`);

// ── Tickets ──
export const registerForEvent = (eventId) => api.post(`/tickets/register/${eventId}`);
export const cancelTicket = (eventId) => api.delete(`/tickets/cancel/${eventId}`);
export const getMyTickets = () => api.get('/tickets/my');

// -- Organizer Requests --
export const submitOrganizerRequest = () => api.post('/organizer-requests');
export const getMyRequestStatus = () => api.get('/organizer-requests/my-status');
export const getOrganizerRequests = () => api.get('/organizer-requests');
export const approveRequest = (id) => api.patch(`/organizer-requests/${id}/approve`);
export const rejectRequest = (id) => api.patch(`/organizer-requests/${id}/reject`);

export default api;
