import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  Timestamp, 
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { Item, Transaction, Instructor, ItemStatus, TransactionType } from '../types';
import { INITIAL_INSTRUCTORS } from '../constants';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJc3F9rv7J6x0aOocf4XGGsXqF2Tyf-OQ",
  authDomain: "manufacturing-warehouse-system.firebaseapp.com",
  projectId: "manufacturing-warehouse-system",
  storageBucket: "manufacturing-warehouse-system.firebasestorage.app",
  messagingSenderId: "231034291590",
  appId: "1:231034291590:web:7c1833e9c0d56839c0d807",
  measurementId: "G-G6EHEE7ZRQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection References
const ITEMS_COL = 'items';
const TRANSACTIONS_COL = 'transactions';
const INSTRUCTORS_COL = 'instructors';

// --- Inventory Operations ---

export const subscribeToInventory = (callback: (items: Item[]) => void) => {
  const q = query(collection(db, ITEMS_COL), orderBy('lastUpdated', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Item));
    callback(items);
  });
};

export const addInventoryItem = async (item: Omit<Item, 'id' | 'lastUpdated'>) => {
  await addDoc(collection(db, ITEMS_COL), {
    ...item,
    lastUpdated: new Date().toISOString()
  });
};

export const updateInventoryItem = async (itemId: string, data: Partial<Item>) => {
  const itemRef = doc(db, ITEMS_COL, itemId);
  await updateDoc(itemRef, {
    ...data,
    lastUpdated: new Date().toISOString()
  });
};

export const deleteInventoryItem = async (itemId: string) => {
  await deleteDoc(doc(db, ITEMS_COL, itemId));
};

// --- Transaction Operations ---

export const subscribeToTransactions = (callback: (transactions: Transaction[]) => void) => {
  // Order by timestamp desc
  const q = query(collection(db, TRANSACTIONS_COL), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Transaction));
    callback(transactions);
  });
};

export const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  await addDoc(collection(db, TRANSACTIONS_COL), {
    ...transaction,
    timestamp: new Date().toISOString()
  });
};

// --- Instructor Operations ---

export const subscribeToInstructors = (callback: (instructors: Instructor[]) => void) => {
  const q = query(collection(db, INSTRUCTORS_COL), orderBy('name'));
  return onSnapshot(q, (snapshot) => {
    const instructors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Instructor));
    callback(instructors);
  });
};

export const addInstructor = async (instructor: Omit<Instructor, 'id'>) => {
  await addDoc(collection(db, INSTRUCTORS_COL), instructor);
};

export const updateInstructor = async (instructor: Instructor) => {
  const ref = doc(db, INSTRUCTORS_COL, instructor.id);
  const { id, ...data } = instructor; // remove ID from data payload
  await updateDoc(ref, data);
};

export const deleteInstructor = async (instructorId: string) => {
  await deleteDoc(doc(db, INSTRUCTORS_COL, instructorId));
};

// Seed initial instructors if collection is empty
export const seedInitialInstructors = async () => {
  const snapshot = await getDocs(collection(db, INSTRUCTORS_COL));
  if (snapshot.empty) {
    const batch = writeBatch(db);
    INITIAL_INSTRUCTORS.forEach(inst => {
      const docRef = doc(collection(db, INSTRUCTORS_COL)); // Auto ID
      batch.set(docRef, { name: inst.name, password: inst.password });
    });
    await batch.commit();
    console.log("Instructors seeded successfully");
  }
};
