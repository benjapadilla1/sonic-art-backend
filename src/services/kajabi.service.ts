import axios from 'axios';
import { config } from '../config/env';

export const getKajabiOffers = async () => {
  const response = await axios.get(`${config.kajabiBaseUrl}/offers`, {
    headers: {
      Authorization: `Bearer ${config.kajabiApiKey}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

export async function getAccessToken() {
  const response = await axios.post('https://api.kajabi.com/v1/oauth/token', {
    grant_type: 'client_credentials',
    client_id: process.env.KAJABI_API_KEY,
    client_secret: process.env.KAJABI_API_SECRET
  });

  return response.data.access_token;
}