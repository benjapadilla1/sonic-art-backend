import axios from "axios";
import { getAccessToken } from "../services/payhip.service";

const baseURL = "https://api.kajabi.com/admin/api";

export async function getCourses() {
  console.log("Entering getCourses function");
  const token = await getAccessToken();

  const response = await axios.get(`${baseURL}/courses`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
}

export const getAllProducts = async () => {
  try {
    const response = await axios.get(`${baseURL}/products`, {
      headers: {
        Authorization: `Bearer ${process.env.KAJABI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("first response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching products from Kajabi:", error);
    throw error;
  }
};

async function createProduct(productData: any) {
  const token = await getAccessToken();
  const response = await axios.post(`${baseURL}/products`, productData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
