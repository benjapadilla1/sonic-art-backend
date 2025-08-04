import axios from "axios";
import { Request, Response } from "express";
import FormData from "form-data";

export const uploadPhoto = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).send("No file uploaded.");
      return;
    }
    const form = new FormData();
    form.append("file", file.buffer, file.originalname);
    form.append("requireSignedURLs", "false");
    console.log("form", form);

    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_STREAM_ACCOUNT_ID}/stream`,
      form,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN}`,
          ...form.getHeaders(),
        },
      }
    );
    res.status(200).json(response.data);
    return;
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while uploading the file.");
    return;
  }
};

export const uploadVideo = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).send("No file uploaded.");
      return;
    }

    const form = new FormData();
    form.append("file", file.buffer, file.originalname);
    form.append("requireSignedURLs", "false");
    console.log("form", form);

    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_STREAM_ACCOUNT_ID}/stream`,
      form,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN}`,
          ...form.getHeaders(),
        },
      }
    );

    res.status(200).json(response.data);
    return;
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while uploading the file.");
    return;
  }
};
