import { 
  collection, 
  addDoc, 
  updateDoc, 
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

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface TaskItemFirestore {
  title: string;
  completed: boolean;
  dueDate?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
}

const TASKS_COLLECTION = 'tasks';

// Convert Firestore timestamp to Date
const convertTimestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

// Convert Date to Firestore timestamp
const convertDateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// Add a new task
export const addTask = async (title: string, userId: string, dueDate?: Date): Promise<string> => {
  try {
    const now = new Date();
    const taskData: TaskItemFirestore = {
      title: title.trim(),
      completed: false,
      userId,
      createdAt: convertDateToTimestamp(now),
      updatedAt: convertDateToTimestamp(now),
    };

    if (dueDate) {
      taskData.dueDate = convertDateToTimestamp(dueDate);
    }

    const docRef = await addDoc(collection(db, TASKS_COLLECTION), taskData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};

// Update a task
export const updateTask = async (
  id: string, 
  updates: Partial<Pick<TaskItem, 'title' | 'completed' | 'dueDate'>>
): Promise<void> => {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, id);
    const updateData: Partial<TaskItemFirestore> = {
      updatedAt: convertDateToTimestamp(new Date()),
    };

    if (updates.title !== undefined) {
      updateData.title = updates.title.trim();
    }

    if (updates.completed !== undefined) {
      updateData.completed = updates.completed;
    }

    if (updates.dueDate !== undefined) {
      updateData.dueDate = updates.dueDate ? convertDateToTimestamp(updates.dueDate) : undefined;
    }

    await updateDoc(taskRef, updateData);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (id: string): Promise<void> => {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, id);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Get all tasks for a user (one-time fetch)
export const getTasks = async (userId: string): Promise<TaskItem[]> => {
  try {
    const q = query(
      collection(db, TASKS_COLLECTION), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as TaskItemFirestore;
      return {
        id: doc.id,
        title: data.title,
        completed: data.completed,
        userId: data.userId,
        dueDate: data.dueDate ? convertTimestampToDate(data.dueDate) : undefined,
        createdAt: convertTimestampToDate(data.createdAt),
        updatedAt: convertTimestampToDate(data.updatedAt),
      } as TaskItem;
    });
  } catch (error) {
    console.error('Error getting tasks:', error);
    throw error;
  }
};

// Subscribe to real-time task updates for a user
export const subscribeToTasks = (userId: string, callback: (tasks: TaskItem[]) => void): () => void => {
  const q = query(
    collection(db, TASKS_COLLECTION), 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const tasks = querySnapshot.docs.map(doc => {
      const data = doc.data() as TaskItemFirestore;
      return {
        id: doc.id,
        title: data.title,
        completed: data.completed,
        userId: data.userId,
        dueDate: data.dueDate ? convertTimestampToDate(data.dueDate) : undefined,
        createdAt: convertTimestampToDate(data.createdAt),
        updatedAt: convertTimestampToDate(data.updatedAt),
      } as TaskItem;
    });
    
    callback(tasks);
  }, (error) => {
    console.error('Error in task subscription:', error);
  });
};
