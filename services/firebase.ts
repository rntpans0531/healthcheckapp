import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, UserCredential, Auth } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, Timestamp, Firestore, doc, setDoc } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { FullReport, User } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyC6ePLlSCPkj1FrjVhcYBj1v3gEPJhrYS0",
  authDomain: "healthcare-hr.firebaseapp.com",
  projectId: "healthcare-hr",
  storageBucket: "healthcare-hr.firebasestorage.app",
  messagingSenderId: "141517627100",
  appId: "1:141517627100:web:d1eff21ed27c77043e9e19",
  measurementId: "G-KY35CTPCF1"
};

// Initialize Firebase
// Using a singleton pattern to ensure we use the existing app if already initialized
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize services
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const analytics: Analytics = getAnalytics(app);

export { auth, db, analytics };

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    const u = userCredential.user;
    return {
      uid: u.uid,
      email: u.email,
      displayName: u.displayName
    };
  },
  signup: async (email: string, password: string, name: string): Promise<User> => {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    const u = userCredential.user;
    await updateProfile(u, { displayName: name });
    return {
      uid: u.uid,
      email: u.email,
      displayName: name
    };
  },
  logout: () => signOut(auth)
};

export const dbService = {
  saveReport: async (report: FullReport) => {
    try {
      const reportsRef = collection(db, 'reports');
      
      // Check if report exists for this date and user
      const q = query(
        reportsRef, 
        where("userId", "==", report.userId),
        where("date", "==", report.date)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // Update existing document
        const docId = snapshot.docs[0].id;
        const docRef = doc(db, 'reports', docId);
        await setDoc(docRef, {
            ...report,
            updatedAt: Timestamp.now()
        }, { merge: true });
        return { success: true, id: docId };
      } else {
        // Create new document
        const docRef = await addDoc(reportsRef, {
            ...report,
            createdAt: Timestamp.now()
        });
        return { success: true, id: docRef.id };
      }
    } catch (error) {
      console.error("Error saving document: ", error);
      throw error;
    }
  },
  fetchReportByDate: async (userId: string, date: string): Promise<FullReport | null> => {
    try {
        const reportsRef = collection(db, 'reports');
        const q = query(
            reportsRef,
            where("userId", "==", userId),
            where("date", "==", date)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data();
            return {
                id: doc.id,
                userId: data.userId,
                date: data.date,
                dailyLog: data.dailyLog,
                painRecords: data.painRecords
            } as FullReport;
        }
        return null;
    } catch (error) {
        console.error("Error fetching report by date:", error);
        return null;
    }
  },
  fetchHistory: async (userId: string): Promise<FullReport[]> => {
    try {
      const reportsRef = collection(db, 'reports');
      const q = query(reportsRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
      
      const querySnapshot = await getDocs(q);
      const reports: FullReport[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reports.push({
            id: doc.id,
            userId: data.userId,
            date: data.date,
            dailyLog: data.dailyLog,
            painRecords: data.painRecords
        });
      });
      return reports;
    } catch (error) {
      console.error("Error fetching documents: ", error);
      return [];
    }
  },
  fetchRecentReports: async (userId: string, startDate: string): Promise<FullReport[]> => {
    try {
      const reportsRef = collection(db, 'reports');
      // String comparison works for ISO dates (YYYY-MM-DD)
      const q = query(
        reportsRef, 
        where("userId", "==", userId),
        where("date", ">=", startDate)
      );
      
      const querySnapshot = await getDocs(q);
      const reports: FullReport[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reports.push({
            id: doc.id,
            userId: data.userId,
            date: data.date,
            dailyLog: data.dailyLog,
            painRecords: data.painRecords
        });
      });
      return reports;
    } catch (error) {
      console.error("Error fetching recent reports: ", error);
      return [];
    }
  }
};