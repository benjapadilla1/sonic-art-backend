import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import admin, { db } from "../config/firebase";
import { SamplePack } from "../models/firestore";
import { getSignedUrlFromKey } from "../utils/getSignedUrlFromKet";
import { uploadFile } from "./upload.controller";

const samplePackCollection = db.collection("samplePacks");
const ordersCollection = db.collection("orders");

export const getAllSamplePacks = async (_req: Request, res: Response) => {
  try {
    const snapshot = await samplePackCollection
      .orderBy("createdAt", "desc")
      .get();

    const samplePacks: SamplePack[] = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const samplePack = doc.data() as SamplePack;

        if (samplePack.coverImageUrl) {
          samplePack.coverImageUrl = await getSignedUrlFromKey(
            samplePack.coverImageUrl
          );
        }

        if (samplePack.downloadUrl) {
          samplePack.downloadUrl = await getSignedUrlFromKey(
            samplePack.downloadUrl
          );
        }

        if (
          samplePack.previewTracks &&
          Array.isArray(samplePack.previewTracks)
        ) {
          samplePack.previewTracks = await Promise.all(
            samplePack.previewTracks.map((p) => getSignedUrlFromKey(p))
          );
        }

        return {
          id: doc.id,
          ...samplePack,
          createdAt:
            samplePack.createdAt instanceof admin.firestore.Timestamp
              ? samplePack.createdAt.toDate().toISOString()
              : samplePack.createdAt,
        };
      })
    );

    res.json(samplePacks);
  } catch (error) {
    console.error("Error fetching sample packs:", error);
    res.status(500).json({ message: "Error fetching sample packs", error });
  }
};

export const getSamplePackById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const snapshot = await samplePackCollection
      .where("id", "==", req.params.id)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "Sample pack not found" });
    }

    const doc = snapshot.docs[0];
    const samplePack = doc.data() as SamplePack;

    if (samplePack.coverImageUrl) {
      samplePack.coverImageUrl = await getSignedUrlFromKey(
        samplePack.coverImageUrl
      );
    }

    if (samplePack.downloadUrl) {
      samplePack.downloadUrl = await getSignedUrlFromKey(
        samplePack.downloadUrl
      );
    }

    if (samplePack.previewTracks && Array.isArray(samplePack.previewTracks)) {
      samplePack.previewTracks = await Promise.all(
        samplePack.previewTracks.map((p) => getSignedUrlFromKey(p))
      );
    }

    res.json({ id: doc.id, ...samplePack });
  } catch (error) {
    console.error("Error fetching sample pack:", error);
    res.status(500).json({ message: "Error fetching sample pack", error });
  }
};

export const getPurchasedSamplePackById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId, id } = req.params;

    const snapshot = await ordersCollection.where("userId", "==", userId).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    let found = false;

    for (const doc of snapshot.docs) {
      const orderData = doc.data();

      if (orderData.items && Array.isArray(orderData.items)) {
        const exists = orderData.items.some(
          (item: any) => item.type === "samplePack" && item.id === id
        );

        if (exists) {
          found = true;
          break;
        }
      }
    }

    if (!found) {
      return res
        .status(404)
        .json({ message: "Sample pack not found for this user" });
    }

    const samplePack = await fetchSamplePackById(id);
    if (!samplePack) {
      return res
        .status(404)
        .json({ message: "Sample pack document not found" });
    }

    return res.json(samplePack);
  } catch (error) {
    console.error("Error fetching purchased sample pack:", error);
    return res
      .status(500)
      .json({ message: "Error fetching purchased sample pack", error });
  }
};

async function fetchSamplePackById(id: string): Promise<SamplePack | null> {
  const snapshot = await samplePackCollection.where("id", "==", id).get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const samplePack = doc.data() as SamplePack;

  if (samplePack.coverImageUrl) {
    samplePack.coverImageUrl = await getSignedUrlFromKey(
      samplePack.coverImageUrl
    );
  }

  if (samplePack.downloadUrl) {
    samplePack.downloadUrl = await getSignedUrlFromKey(samplePack.downloadUrl);
  }

  if (samplePack.previewTracks && Array.isArray(samplePack.previewTracks)) {
    samplePack.previewTracks = await Promise.all(
      samplePack.previewTracks.map((p) => getSignedUrlFromKey(p))
    );
  }

  return { id: doc.id, ...samplePack };
}

export const getPurchasedSamplePacks = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id: userId } = req.params;

    const ordersSnapshot = await db
      .collection("orders")
      .where("userId", "==", userId)
      .where("status", "==", "COMPLETED")
      .get();

    if (ordersSnapshot.empty) {
      return res
        .status(404)
        .json({ message: "No completed orders found for this user" });
    }

    const purchasedSamplePackIds: string[] = [];

    for (const doc of ordersSnapshot.docs) {
      const orderData = doc.data();

      if (orderData.items && Array.isArray(orderData.items)) {
        orderData.items.forEach((item: any) => {
          if (item.type === "samplePack" && item.id) {
            purchasedSamplePackIds.push(item.id);
          }
        });
      }
    }

    if (purchasedSamplePackIds.length === 0) {
      return res
        .status(404)
        .json({ message: "No sample packs found in orders" });
    }

    const samplePackBatches = [];
    for (let i = 0; i < purchasedSamplePackIds.length; i += 10) {
      const batchIds = purchasedSamplePackIds.slice(i, i + 10);
      const snapshot = await db
        .collection("samplePacks")
        .where("id", "in", batchIds)
        .get();
      samplePackBatches.push(
        ...snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    }

    if (samplePackBatches.length === 0) {
      return res.status(404).json({
        message: "No sample packs found (they may have been deleted)",
      });
    }

    res.json(samplePackBatches);
  } catch (error) {
    console.error("Error fetching sample packs:", error);
    res.status(500).json({ message: "Error fetching sample packs", error });
  }
};

export const createSamplePack = async (req: Request, res: Response) => {
  try {
    const { title, description, price } = req.body;

    const files = req.files as Express.Multer.File[];
    const getFileByField = (fieldname: string) =>
      files.find((f) => f.fieldname === fieldname);

    let coverImageUrl = "";
    const coverImageFile = getFileByField("coverImage");
    if (coverImageFile) {
      const key = `samplepacks/cover-${uuidv4()}-${
        coverImageFile.originalname
      }`;
      coverImageUrl = await uploadFile({ key, file: coverImageFile });
    }

    // Subir archivo ZIP
    let downloadUrl = "";
    const zipFile = getFileByField("zipFile");
    if (zipFile) {
      const key = `samplepacks/zips/${uuidv4()}-${zipFile.originalname}`;
      downloadUrl = await uploadFile({ key, file: zipFile });
    }

    // Subir previews (pueden ser 1 o más)
    const previews: string[] = [];
    files
      .filter((f) => f.fieldname.startsWith("preview"))
      .forEach(async (previewFile) => {
        const key = `samplepacks/previews/${uuidv4()}-${
          previewFile.originalname
        }`;
        const uploadedUrl = await uploadFile({ key, file: previewFile });
        previews.push(uploadedUrl);
      });

    const samplePackData = {
      id: uuidv4(),
      title,
      description,
      price,
      coverImageUrl,
      downloadUrl,
      previews,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };

    const newDoc = await samplePackCollection.add(samplePackData);

    res.status(201).json({ id: newDoc.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating sample pack", error });
  }
};

export const updateSamplePack = async (req: Request, res: Response) => {
  try {
    const snapshot = await samplePackCollection
      .where("id", "==", req.params.id)
      .get();

    if (snapshot.empty) {
      res.status(404).json({ message: "Sample Pack not found" });
      return;
    }

    let dataToUpdate = { ...req.body };

    if (req.body.coverImageUrl) {
      dataToUpdate.coverImageUrl = await getSignedUrlFromKey(
        req.body.coverImageUrl
      );
    }
    if (req.body.downloadUrl) {
      dataToUpdate.downloadUrl = await getSignedUrlFromKey(
        req.body.downloadUrl
      );
    }

    await snapshot.docs[0].ref.update({
      ...dataToUpdate,
      updatedAt: admin.firestore.Timestamp.now(),
    });

    res.status(200).json({ message: "Sample Pack updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating sample pack", error });
  }
};

export const deleteSamplePack = async (req: Request, res: Response) => {
  try {
    const snapshot = await samplePackCollection
      .where("id", "==", req.params.id)
      .get();

    if (snapshot.empty) {
      res.status(404).json({ message: "No se encontró el sample Pack" });
      return;
    }

    const batch = admin.firestore().batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    res.status(200).json({ message: "Sample Pack deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting sample pack", error });
  }
};
