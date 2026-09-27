import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { workshopReviews, StudentReview } from "@/components/TestimonialsSection";
import { allSessions, WorkshopSession } from "@/pages/Reviews";

const SESSIONS_COLLECTION = "workshop_sessions";
const REVIEWS_COLLECTION = "workshop_reviews";

/**
 * Sync initial Monti International session and 28 student reviews to Firestore DB
 * if they do not exist yet.
 */
export async function syncSeedSessionsToDb(): Promise<void> {
  try {
    const montiDocRef = doc(db, SESSIONS_COLLECTION, "monti-mba-2026");
    const docSnap = await getDoc(montiDocRef);

    if (!docSnap.exists()) {
      const montiSession = allSessions[0];
      await setDoc(montiDocRef, {
        id: "monti-mba-2026",
        institution: montiSession.institution,
        shortName: montiSession.shortName,
        location: montiSession.location,
        audience: montiSession.audience,
        topic: montiSession.topic,
        date: "September 22 - 25, 2026",
        trainers: montiSession.trainers,
        satisfactionRate: montiSession.satisfactionRate,
        mindsetShiftRate: montiSession.mindsetShiftRate,
        toolsCovered: montiSession.toolsCovered,
        reviewsCount: workshopReviews.length,
        createdAt: serverTimestamp(),
      });

      // Seed reviews in batch/parallel
      for (const rev of workshopReviews) {
        const revRef = doc(db, REVIEWS_COLLECTION, `monti_${rev.id}`);
        await setDoc(revRef, {
          ...rev,
          sessionId: "monti-mba-2026",
          createdAt: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    console.warn("Notice: Firestore sync using fallback local records if offline:", error);
  }
}

/**
 * Fetch all workshop sessions from Firestore DB
 */
export async function getWorkshopSessionsFromDb(): Promise<WorkshopSession[]> {
  try {
    const sessionsCol = collection(db, SESSIONS_COLLECTION);
    const snap = await getDocs(sessionsCol);

    if (!snap.empty) {
      const sessions: WorkshopSession[] = [];
      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        sessions.push({
          id: data.id || docSnap.id,
          institution: data.institution || "Institution",
          shortName: data.shortName || data.institution || "Session",
          location: data.location || "India",
          audience: data.audience || "Students",
          topic: data.topic || "AI Tools",
          date: data.date || "2024",
          trainers: data.trainers || ["Prajwal N", "Mayur P"],
          satisfactionRate: data.satisfactionRate || "100%",
          mindsetShiftRate: data.mindsetShiftRate || "100%",
          reviewsCount: data.reviewsCount || 0,
          toolsCovered: data.toolsCovered || ["NotebookLM", "Gamma", "ChatGPT"],
          reviews: [],
        });
      }
      return sessions;
    }
  } catch (err) {
    console.warn("Firestore fetch error, falling back to local sessions:", err);
  }

  return allSessions;
}

/**
 * Fetch reviews for a specific session (or all) from Firestore DB
 */
export async function getSessionReviewsFromDb(sessionId: string): Promise<StudentReview[]> {
  try {
    const reviewsCol = collection(db, REVIEWS_COLLECTION);
    const q = query(reviewsCol, where("sessionId", "==", sessionId));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const dbReviews: StudentReview[] = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: d.id || docSnap.id,
          name: d.name,
          role: d.role,
          institution: d.institution,
          rating: d.rating || 5,
          usefulness: d.usefulness || "Very Useful",
          engagement: d.engagement || "Very Engaging",
          confidence: d.confidence || "Very Confident",
          primaryTool: d.primaryTool || "ChatGPT",
          activity: d.activity || "Workshop Activity",
          quote: d.quote,
          trainerFeedback: d.trainerFeedback || "",
          beforePerception: d.beforePerception || "",
          afterPerception: d.afterPerception || "",
          verdict: d.verdict || "Excellent",
          finalMessage: d.finalMessage || "",
          category: d.category || "mindset",
          avatar: d.avatar || d.name?.substring(0, 2).toUpperCase() || "ST",
        };
      });
      return dbReviews;
    }
  } catch (err) {
    console.warn("Firestore reviews fetch error, falling back to local records:", err);
  }

  // Fallback to local verified list for Monti
  if (sessionId === "monti-mba-2026" || sessionId === "monti-mba-2024") {
    return workshopReviews;
  }
  return [];
}

/**
 * Add a new future workshop session to Firestore DB
 */
export async function addWorkshopSessionToDb(
  sessionData: Omit<WorkshopSession, "reviews">
): Promise<string> {
  const docRef = doc(db, SESSIONS_COLLECTION, sessionData.id);
  await setDoc(docRef, {
    ...sessionData,
    createdAt: serverTimestamp(),
  });
  return sessionData.id;
}

/**
 * Add a new student review to Firestore DB for any session
 */
export async function addStudentReviewToDb(
  sessionId: string,
  review: Omit<StudentReview, "id"> & { id?: string }
): Promise<string> {
  const revId = review.id || `rev_${Date.now()}`;
  const docRef = doc(db, REVIEWS_COLLECTION, `${sessionId}_${revId}`);
  await setDoc(docRef, {
    ...review,
    id: revId,
    sessionId,
    createdAt: serverTimestamp(),
  });
  return revId;
}
