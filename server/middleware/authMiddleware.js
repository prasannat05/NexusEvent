const admin = require('firebase-admin');

// Initialize Firebase Admin with Application Default Credentials
// For production, use a service account key file
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'nexuscampus-pras'
    });
}

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decoded = await admin.auth().verifyIdToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = { verifyToken, admin };
