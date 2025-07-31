// lib/firebase.js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
export const db = getFirestore(app)

// Initialize Storage
export const storage = getStorage(app)

export default app

// lib/firestore.js
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase'

// Contact form functions
export const addContactMessage = async (messageData) => {
  try {
    const docRef = await addDoc(collection(db, 'contacts'), {
      ...messageData,
      timestamp: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding contact message:', error)
    throw error
  }
}

export const getContactMessages = async () => {
  try {
    const q = query(collection(db, 'contacts'), orderBy('timestamp', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting contact messages:', error)
    throw error
  }
}

export const deleteContactMessage = async (messageId) => {
  try {
    await deleteDoc(doc(db, 'contacts', messageId))
  } catch (error) {
    console.error('Error deleting contact message:', error)
    throw error
  }
}

// Product functions
export const addProduct = async (productData, imageFile) => {
  try {
    let imageUrl = null

    if (imageFile) {
      // Upload image to Firebase Storage
      const imageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`)
      const uploadResult = await uploadBytes(imageRef, imageFile)
      imageUrl = await getDownloadURL(uploadResult.ref)
    }

    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      imageUrl,
      timestamp: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding product:', error)
    throw error
  }
}

export const getProducts = async () => {
  try {
    const q = query(collection(db, 'products'), orderBy('timestamp', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting products:', error)
    throw error
  }
}

export const getProductsByCategory = async (category) => {
  try {
    const q = query(
      collection(db, 'products'),
      where('category', '==', category),
      orderBy('timestamp', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting products by category:', error)
    throw error
  }
}