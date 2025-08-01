import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import admin, { db } from "../config/firebase";
import { Course } from "../models/firestore";

const coursesCollection = db.collection("courses");

export const getAllCourses = async (_req: Request, res: Response) => {
  try {
    const snapshot = await coursesCollection.orderBy("createdAt", "desc").get();
    const courses: Course[] = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Course)
    );
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching courses", error });
  }
};

export const getCourseById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const snapshot = await coursesCollection
      .where("id", "==", req.params.id)
      .get();
    if (snapshot.empty) {
      return res.status(404).json({ message: "Course not found" });
    }
    const doc = snapshot.docs[0];
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ message: "Error fetching course", error });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const courseData: Course = {
      ...req.body,
      id: uuidv4(),
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };
    const newDoc = await coursesCollection.add(courseData);

    res.status(201).json({ id: newDoc.id });
  } catch (error) {
    res.status(500).json({ message: "Error creating course", error });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const snapshot = await coursesCollection
      .where("id", "==", req.params.id)
      .get();
    if (snapshot.empty) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    await snapshot.docs[0].ref.update({
      ...req.body,
      updatedAt: admin.firestore.Timestamp.now(),
    });

    res.status(200).json({ message: "Course updated successfully" });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error updating course", error });
    return;
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const snapshot = await coursesCollection
      .where("id", "==", req.params.id)
      .get();

    if (snapshot.empty) {
      res.status(404).json({ message: "No se encontró el curso" });
      return;
    }

    const batch = admin.firestore().batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting course", error });
  }
};
