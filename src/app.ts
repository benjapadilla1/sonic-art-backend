import express from 'express';
import kajabiRoutes from './routes/kajabi.routes';

const app = express();

app.use(express.json());
app.use('/kajabi', kajabiRoutes);

export default app;
