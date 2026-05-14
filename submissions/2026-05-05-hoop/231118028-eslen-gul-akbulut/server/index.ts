import express from 'express';
import cors from 'cors';
import { StreamVideoClient } from '@stream-io/video-react-native-sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 8787;

app.use(cors());
app.use(express.json());

const apiKey = process.env.STREAM_API_KEY || 'rrvqhuxd9yt6';
const apiSecret = process.env.STREAM_API_SECRET || 'uxuxxxeqhrkej347ckqcg59tnps2hps6xdr5tst7n3ckrcksd4nu94v9dzmf2kjt';

// Initialize Stream Client (Server-side)
const serverClient = StreamVideoClient.create({
  apiKey,
  apiSecret,
});

app.get('/health', (req, res) => {
  res.send('OK');
});

app.get('/token', (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).send('Missing user_id');
  
  // Generate token valid for 1 hour
  const token = serverClient.generateUserToken({ 
    user_id: user_id as string,
    validity_in_seconds: 3600 
  });
  
  res.json({ token });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Nokta Token Server running at http://0.0.0.0:${port}`);
});
