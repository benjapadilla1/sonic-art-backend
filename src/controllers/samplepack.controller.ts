import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import admin, { db } from "../config/firebase";
import { SamplePack } from "../models/firestore";

const samplePackCollection = db.collection("samplePacks");

export const getAllSamplePacks = async (_req: Request, res: Response) => {
  try {
    const snapshot = await samplePackCollection
      .orderBy("createdAt", "desc")
      .get();
    const samplePacks: SamplePack[] = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as SamplePack)
    );
    res.json(samplePacks);
  } catch (error) {
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
      return res.status(404).json({ message: "Sample Pack not found" });
    }
    const doc = snapshot.docs[0];
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ message: "Error fetching sample pack", error });
  }
};

export const createSamplePack = async (req: Request, res: Response) => {
  try {
    const samplePackData: SamplePack = {
      ...req.body,
      id: uuidv4(),
      createdAt: admin.firestore.Timestamp.now(),
    };
    const newDoc = await samplePackCollection.add(samplePackData);
    res.status(201).json({ id: newDoc.id });
  } catch (error) {
    res.status(500).json({ message: "Error creating sample pack", error });
  }
};

export const updateSamplePack = async (req: Request, res: Response) => {
  try {
    await samplePackCollection.doc(req.params.id).update(req.body);
    res.status(200).json({ message: "Sample Pack updated successfully" });
  } catch (error) {
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
