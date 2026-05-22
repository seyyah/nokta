import axios from 'axios';

// IMPORTANT: For Android emulator, use 10.0.2.2. For physical device or iOS, use actual physical IP.
// The Token Server is hosted on port 3000.
// Replace with the Cloudflare Tunnel URL if you run via cloudflared.
export const API_URL = 'http://127.0.0.1:3000';

export const mascotChat = async (messages) => {
    const { data } = await axios.post(\`\${API_URL}/mascot/chat\`, { messages });
  return data;
};

export const fetchToken = async (userId) => {
  const { data } = await axios.post(\`\${API_URL}/token\`, { userId });
  return data.token;
};

export const createEscalation = async (userId, topic) => {
  const { data } = await axios.post(\`\${API_URL}/escalations\`, { userId, topic });
  return data;
};

export const getPendingEscalations = async () => {
  const { data } = await axios.get(\`\${API_URL}/escalations\`);
  return data;
};

export const acceptEscalation = async (id, mentorId) => {
  const { data } = await axios.post(\`\${API_URL}/escalations/\${id}/accept\`, { mentorId });
  return data;
};

export const resolveEscalation = async (id) => {
  const { data } = await axios.post(\`\${API_URL}/escalations/\${id}/resolve\`);
  return data;
};

export const getTranscript = async (callType, callId) => {
  const { data } = await axios.get(\`\${API_URL}/calls/\${callType}/\${callId}/transcript\`);
  return data;
};
