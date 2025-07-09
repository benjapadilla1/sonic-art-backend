import axios from 'axios';


export async function getAccessToken() {
  const response = await axios.post('https://api.kajabi.com/oauth/token', {
    grant_type: 'client_credentials',
    client_id: process.env.KAJABI_CLIENT_ID,
    client_secret: process.env.KAJABI_CLIENT_SECRET
  });

  return response.data.access_token;
}