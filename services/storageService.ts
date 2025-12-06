import { Item, Transaction, Instructor } from '../types';
import { INITIAL_INVENTORY, INITIAL_INSTRUCTORS } from '../constants';

const INV_KEY = 'makhzan_inventory';
const TRANS_KEY = 'makhzan_transactions';
const INST_KEY = 'makhzan_instructors';

export const getInventory = (): Item[] => {
  const stored = localStorage.getItem(INV_KEY);
  if (!stored) {
    localStorage.setItem(INV_KEY, JSON.stringify(INITIAL_INVENTORY));
    return INITIAL_INVENTORY;
  }
  return JSON.parse(stored);
};

export const saveInventory = (items: Item[]) => {
  localStorage.setItem(INV_KEY, JSON.stringify(items));
};

export const getTransactions = (): Transaction[] => {
  const stored = localStorage.getItem(TRANS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addTransaction = (transaction: Transaction) => {
  const current = getTransactions();
  const updated = [transaction, ...current];
  localStorage.setItem(TRANS_KEY, JSON.stringify(updated));
};

export const getInstructors = (): Instructor[] => {
  const stored = localStorage.getItem(INST_KEY);
  if (!stored) {
    localStorage.setItem(INST_KEY, JSON.stringify(INITIAL_INSTRUCTORS));
    return INITIAL_INSTRUCTORS;
  }
  return JSON.parse(stored);
};

export const saveInstructors = (instructors: Instructor[]) => {
  localStorage.setItem(INST_KEY, JSON.stringify(instructors));
};