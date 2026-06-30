import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from './firebase';

const collectionKeys: Record<string, string> = {
  members: 'id',
  tasks: 'task_id',
  schedules: 'production_id',
  campaigns: 'campaign_id',
  kpis: 'kpi_id',
  reports: 'report_id',
  evaluations: 'evaluation_id',
  proposals: 'proposal_id',
  resources: 'resource_id',
  webhooks: 'id',
  plans: 'plan_id',
  daily_logs: 'log_id',
};

/**
 * Loads a collection from Firestore. If empty, seeds it with initialData.
 */
export async function loadCollection<T>(collectionName: string, initialData: T[]): Promise<T[]> {
  try {
    const idKey = collectionKeys[collectionName];
    if (!idKey) {
      throw new Error(`Unknown collection key for: ${collectionName}`);
    }

    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      console.log(`Collection "${collectionName}" is empty. Seeding ${initialData.length} documents...`);
      // Seed data
      for (const item of initialData) {
        const itemAny = item as any;
        const docId = itemAny[idKey];
        if (docId) {
          const docRef = doc(db, collectionName, String(docId));
          await setDoc(docRef, itemAny);
        }
      }
      return initialData;
    }

    const data: T[] = [];
    snapshot.forEach((doc) => {
      data.push(doc.data() as T);
    });
    return data;
  } catch (error) {
    console.error(`Error loading collection "${collectionName}":`, error);
    return initialData;
  }
}

/**
 * Saves a single document to Firestore (adds or updates).
 */
export async function saveDocument<T>(collectionName: string, item: T): Promise<void> {
  try {
    const idKey = collectionKeys[collectionName];
    const itemAny = item as any;
    const docId = itemAny[idKey];
    if (!docId) return;

    const docRef = doc(db, collectionName, String(docId));
    await setDoc(docRef, itemAny);
  } catch (error) {
    console.error(`Error saving document to "${collectionName}":`, error);
  }
}

/**
 * Deletes a single document from Firestore.
 */
export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, String(id));
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document "${id}" from "${collectionName}":`, error);
  }
}

/**
 * Synchronizes an entire list of items to Firestore.
 * - Writes/updates current items.
 * - Deletes documents that are no longer in the list.
 */
export async function syncCollection<T>(collectionName: string, currentData: T[]): Promise<void> {
  try {
    const idKey = collectionKeys[collectionName];
    if (!idKey) return;

    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);

    const existingIdsInDb = new Set<string>();
    snapshot.forEach((doc) => {
      existingIdsInDb.add(doc.id);
    });

    const currentIds = new Set<string>();

    // 1. Write or update all current items
    for (const item of currentData) {
      const itemAny = item as any;
      const docId = String(itemAny[idKey]);
      currentIds.add(docId);

      const docRef = doc(db, collectionName, docId);
      await setDoc(docRef, itemAny);
    }

    // 2. Delete items that were removed locally
    for (const dbId of existingIdsInDb) {
      if (!currentIds.has(dbId)) {
        console.log(`Deleting removed document "${dbId}" from "${collectionName}"`);
        const docRef = doc(db, collectionName, dbId);
        await deleteDoc(docRef);
      }
    }
  } catch (error) {
    console.error(`Error synchronizing collection "${collectionName}":`, error);
  }
}
