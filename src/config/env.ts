import dotenv from 'dotenv';
dotenv.config();

export const config = {
  kajabiApiKey: process.env.KAJABI_API_KEY!,
  kajabiBaseUrl: process.env.KAJABI_BASE_URL!,
  port: process.env.PORT || 3001
};
