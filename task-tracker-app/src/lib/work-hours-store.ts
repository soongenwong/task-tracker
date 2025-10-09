import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp,
  where 
} from 'firebase/firestore';
import { db } from './firebase';

export interface WorkLog {
  id: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  description: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkLogFirestore {
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const WORK_LOGS_COLLECTION = 'work_logs';

// Convert Firestore timestamp to Date
const convertTimestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

// Convert Date to Firestore timestamp
const convertDateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// Calculate total hours worked
export const calculateHours = (startTime: string, endTime: string): number => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;
  
  let diffMinutes = endTotalMinutes - startTotalMinutes;
  
  // Handle case where end time is next day
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60;
  }
  
  return diffMinutes / 60; // Convert to hours
};

// Format hours for display
export const formatHours = (hours: number): string => {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  return `${wholeHours}h ${minutes}m`;
};

// Add a new work log
export const addWorkLog = async (
  date: string,
  startTime: string,
  endTime: string,
  description: string,
  userId: string
): Promise<string> => {
  try {
    const now = new Date();
    const workLogData: WorkLogFirestore = {
      date,
      startTime,
      endTime,
      description: description.trim(),
      userId,
      createdAt: convertDateToTimestamp(now),
      updatedAt: convertDateToTimestamp(now),
    };

    const docRef = await addDoc(collection(db, WORK_LOGS_COLLECTION), workLogData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding work log:', error);
    throw error;
  }
};

// Delete a work log
export const deleteWorkLog = async (id: string): Promise<void> => {
  try {
    const workLogRef = doc(db, WORK_LOGS_COLLECTION, id);
    await deleteDoc(workLogRef);
  } catch (error) {
    console.error('Error deleting work log:', error);
    throw error;
  }
};

// Get all work logs for a user (one-time fetch)
export const getWorkLogs = async (userId: string): Promise<WorkLog[]> => {
  try {
    const q = query(
      collection(db, WORK_LOGS_COLLECTION), 
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      orderBy('startTime', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as WorkLogFirestore;
      return {
        id: doc.id,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        description: data.description,
        userId: data.userId,
        createdAt: convertTimestampToDate(data.createdAt),
        updatedAt: convertTimestampToDate(data.updatedAt),
      } as WorkLog;
    });
  } catch (error) {
    console.error('Error getting work logs:', error);
    throw error;
  }
};

// Subscribe to real-time work log updates for a user
export const subscribeToWorkLogs = (userId: string, callback: (workLogs: WorkLog[]) => void): () => void => {
  const q = query(
    collection(db, WORK_LOGS_COLLECTION), 
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    orderBy('startTime', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const workLogs = querySnapshot.docs.map(doc => {
      const data = doc.data() as WorkLogFirestore;
      return {
        id: doc.id,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        description: data.description,
        userId: data.userId,
        createdAt: convertTimestampToDate(data.createdAt),
        updatedAt: convertTimestampToDate(data.updatedAt),
      } as WorkLog;
    });
    
    callback(workLogs);
  }, (error) => {
    console.error('Error in work logs subscription:', error);
  });
};
