import { Request, Response } from "express";
import { Timestamp } from "firebase-admin/firestore";
import { v4 as uuidv4 } from "uuid";
import admin, { db } from "../config/firebase";
import { Course } from "../models/firestore";
import { getSignedUrlFromKey } from "../utils/getSignedUrlFromKet";
import { uploadFile } from "./upload.controller";

const coursesCollection = db.collection("courses");
const ordersCollection = db.collection("orders");

export const getAllCourses = async (_req: Request, res: Response) => {
  try {
    const snapshot = await coursesCollection.orderBy("createdAt", "desc").get();

    const courses: Course[] = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const course = doc.data() as Course;

        if (course.coverImageUrl) {
          course.coverImageUrl = await getSignedUrlFromKey(
            course.coverImageUrl
          );
        }

        return {
          id: doc.id,
          ...course,
          createdAt:
            course.createdAt instanceof Timestamp
              ? course.createdAt.toDate().toISOString()
              : course.createdAt,
        };
      })
    );

    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
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
    const course = doc.data();

    if (course.coverImageUrl) {
      course.coverImageUrl = await getSignedUrlFromKey(course.coverImageUrl);
    }

    if (course.modules && Array.isArray(course.modules)) {
      for (const module of course.modules) {
        if (module.chapters && Array.isArray(module.chapters)) {
          for (const chapter of module.chapters) {
            if (chapter.videoUrl) {
              chapter.videoUrl = await getSignedUrlFromKey(chapter.videoUrl);
            }
          }
        }
      }
    }

    res.json({ id: doc.id, ...course });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ message: "Error fetching course", error });
  }
};

export const getPurchasedCourses = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const snapshot = await ordersCollection
      .where("userId", "==", req.params.id)
      .get();

    if (snapshot.empty) {
      return res
        .status(404)
        .json({ message: "No courses found for this user" });
    }

    let allCourses: any[] = [];

    for (const doc of snapshot.docs) {
      const orderData = doc.data();

      if (orderData.items && Array.isArray(orderData.items)) {
        for (const item of orderData.items) {
          if (item.type === "course") {
            allCourses.push({
              ...item,
              orderId: doc.id,
            });
          }
        }
      }
    }

    res.json(allCourses);
  } catch (error) {
    console.error("Error fetching purchased courses:", error);
    res
      .status(500)
      .json({ message: "Error fetching purchased courses", error });
  }
};

export const getPurhcarsedCourseById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const ordersSnapshot = await ordersCollection
      .where("userId", "==", req.params.userId)
      .get();

    if (ordersSnapshot.empty) {
      return res
        .status(404)
        .json({ message: "No courses found for this user" });
    }

    let courseFound: any = null;

    for (const orderDoc of ordersSnapshot.docs) {
      const orderData = orderDoc.data();

      if (orderData.items && Array.isArray(orderData.items)) {
        for (const item of orderData.items) {
          if (item.type === "course" && item.id === req.params.courseId) {
            courseFound = {
              ...item,
              orderId: orderDoc.id,
            };
            break;
          }
        }
      }

      if (courseFound) break;
    }

    if (!courseFound) {
      return res
        .status(404)
        .json({ message: "Course not found for this user" });
    }

    const courseSnapshot = await coursesCollection
      .where("id", "==", req.params.courseId)
      .get();

    if (courseSnapshot.empty) {
      return res.status(404).json({ message: "Course details not found" });
    }

    const courseDoc = courseSnapshot.docs[0];
    const courseData = courseDoc.data();

    if (courseData.coverImageUrl) {
      courseData.coverImageUrl = await getSignedUrlFromKey(
        courseData.coverImageUrl
      );
    }

    if (courseData.modules && Array.isArray(courseData.modules)) {
      for (const module of courseData.modules) {
        if (module.chapters && Array.isArray(module.chapters)) {
          for (const chapter of module.chapters) {
            if (chapter.videoUrl) {
              chapter.videoUrl = await getSignedUrlFromKey(chapter.videoUrl);
            }
          }
        }
      }
    }

    res.json({ id: courseDoc.id, ...courseData });
  } catch (error) {
    console.error("Error fetching purchased course:", error);
    res.status(500).json({ message: "Error fetching purchased course", error });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const { title, description, price, duration } = req.body;
    const rawModules = req.body.modules;
    const modulesParsed = JSON.parse(rawModules);

    const files = req.files as Express.Multer.File[];

    const getFileByField = (fieldname: string) =>
      files.find((f) => f.fieldname === fieldname);

    for (let m = 0; m < modulesParsed.length; m++) {
      const module = modulesParsed[m];
      for (let c = 0; c < module.chapters.length; c++) {
        const chapter = module.chapters[c];
        const file = getFileByField(chapter.videoUrl);
        if (file) {
          const key = `videos/${uuidv4()}-${file.originalname}`;
          chapter.videoUrl = await uploadFile({ key, file });
        }
      }
    }

    const coverImageFile = getFileByField("coverImage");
    let coverImageUrl = "";
    if (coverImageFile) {
      const key = `cursos/${uuidv4()}-${coverImageFile.originalname}`;
      coverImageUrl = await uploadFile({ key, file: coverImageFile });
    }

    const courseData = {
      id: uuidv4(),
      title,
      description,
      price,
      duration,
      coverImageUrl,
      modules: modulesParsed,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };

    const newDoc = await coursesCollection.add(courseData);

    res.status(201).json({ id: newDoc.id });
  } catch (error) {
    console.error(error);
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

    let dataToUpdate = { ...req.body };
    if (req.body.coverImageUrl) {
      const signedUrl = await getSignedUrlFromKey(req.body.coverImageUrl);
      dataToUpdate.coverImageUrl = signedUrl;
    }

    await snapshot.docs[0].ref.update({
      ...dataToUpdate,
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
