import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { Product, Order, StoreSettings, ChatMessage } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string): void {
  const err = error as { code?: string; message?: string };
  console.warn(`[Firestore ${operationType} on ${path}] ${err.code || 'UNKNOWN'}: ${err.message || ''}`);
}

// Collections
export const PRODUCTS_COLLECTION = 'products';
export const ORDERS_COLLECTION = 'orders';
export const SETTINGS_COLLECTION = 'settings';
export const CHAT_COLLECTION = 'chat_messages';

// Chat message sender
export async function saveChatMessageToFirestore(message: Omit<ChatMessage, 'id'>): Promise<string> {
  try {
    const chatCol = collection(db, CHAT_COLLECTION);
    const newDocRef = doc(chatCol);
    const docData = {
      ...message,
      id: newDocRef.id,
      timestamp: Date.now(),
      createdAt: new Date().toISOString()
    };
    await setDoc(newDocRef, docData);
    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, CHAT_COLLECTION);
    throw error;
  }
}

// Order saver
export async function saveOrderToFirestore(order: Order): Promise<void> {
  try {
    await setDoc(doc(db, ORDERS_COLLECTION, order.id), order);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${ORDERS_COLLECTION}/${order.id}`);
  }
}

// Order updater
export async function updateOrderInFirestore(orderId: string, updates: Partial<Order>): Promise<void> {
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

// Order deleter
export async function deleteOrderFromFirestore(orderId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

// Product saver
export async function saveProductToFirestore(product: Product): Promise<void> {
  try {
    await setDoc(doc(db, PRODUCTS_COLLECTION, product.id), product);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${PRODUCTS_COLLECTION}/${product.id}`);
  }
}

// Product updater
export async function updateProductInFirestore(productId: string, updates: Partial<Product>): Promise<void> {
  try {
    await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${PRODUCTS_COLLECTION}/${productId}`);
  }
}

// Product deleter
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${PRODUCTS_COLLECTION}/${productId}`);
  }
}

// Store Settings saver
export async function saveSettingsToFirestore(settings: StoreSettings): Promise<void> {
  try {
    await setDoc(doc(db, SETTINGS_COLLECTION, 'store'), settings, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COLLECTION}/store`);
  }
}
