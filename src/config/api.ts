// Central API URL — set NEXT_PUBLIC_API_URL in Vercel environment variables
// to point to your Render backend (e.g. https://gvb-back-1.onrender.com)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default API_URL;
