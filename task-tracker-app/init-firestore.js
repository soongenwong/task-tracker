const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = {
  // You would need to add your service account key here
  // For now, we'll use the default project initialization
};

// Initialize the app with default project credentials
admin.initializeApp({
  projectId: 'task-tracker-8e573'
});

const db = admin.firestore();

async function createTestTask() {
  try {
    // Create a test task to initialize the collection
    const testTask = {
      title: 'Welcome to your Task Tracker!',
      completed: false,
      userId: 'test-user-id',
      taskDate: admin.firestore.Timestamp.now(),
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };

    const docRef = await db.collection('tasks').add(testTask);
    console.log('Test task created with ID:', docRef.id);
    
    // Clean up the test task
    await docRef.delete();
    console.log('Test task cleaned up');
    
    console.log('✅ Firestore collection "tasks" has been initialized!');
    console.log('You can now add tasks through your app.');
    
  } catch (error) {
    console.error('Error creating test task:', error);
  }
}

createTestTask();
