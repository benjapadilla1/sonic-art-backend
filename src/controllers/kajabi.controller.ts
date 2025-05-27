import axios from 'axios';
import { Request, Response } from 'express';
import { getAccessToken, getKajabiOffers } from '../services/kajabi.service';

const baseURL = 'https://api.kajabi.com/v1';

export const getOffers = async (_req: Request, res: Response) => {
  try {
    const offers = await getKajabiOffers();
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ofertas', error });
  }
};

export async function getCourses() {
  const token = await getAccessToken();

  const response = await axios.get(`${baseURL}/courses`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return response.data;
}

async function createProduct(productData: any) {
  const token = await getAccessToken();
  const response = await axios.post(`${baseURL}/products`, productData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}