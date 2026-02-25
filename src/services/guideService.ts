
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  setDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase/firebaseConfig';
import { Guide, Appointment, GuideReview } from '../types/guide';

export type { Guide, Appointment, GuideReview };

const GUIDES_COLLECTION = 'guides';
const APPOINTMENTS_COLLECTION = 'appointments';
const REVIEWS_COLLECTION = 'guideReviews';

// Mock data for development if Firebase is empty or not configured
export const MOCK_GUIDES: Guide[] = [
  {
    id: '1',
    name: 'Dr. Elena Rostova',
    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    title: 'Clinical Psychologist',
    specialty: ['Trauma', 'Anxiety', 'Cognitive Behavioral Therapy'],
    bio: 'Dr. Elena specializes in trauma-informed care and anxiety management. With over 15 years of experience, she helps clients navigate complex emotional landscapes using evidence-based techniques.',
    rating: 4.9,
    totalReviews: 124,
    pricePerSession: 150,
    sessionDuration: 50,
    availability: {
      days: ['Mon', 'Tue', 'Thu'],
      timeSlots: ['10:00', '11:00', '14:00', '15:00']
    },
    email: 'elena.rostova@mindshift.com',
    verified: true,
    featured: true,
    createdAt: Date.now()
  },
  {
    id: '2',
    name: 'Marcus Chen',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    title: 'Manifestation Coach',
    specialty: ['Manifestation', 'Mindset', 'Career Growth'],
    bio: 'Marcus combines ancient wisdom with modern neuroscience to help you unlock your full potential. His coaching focuses on rewriting limiting beliefs and aligning with your desired reality.',
    rating: 4.8,
    totalReviews: 89,
    pricePerSession: 120,
    sessionDuration: 60,
    availability: {
      days: ['Wed', 'Fri', 'Sat'],
      timeSlots: ['09:00', '13:00', '16:00']
    },
    email: 'marcus.chen@mindshift.com',
    verified: true,
    featured: true,
    createdAt: Date.now()
  },
  {
    id: '3',
    name: 'Sarah Jenkins',
    profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    title: 'Breathwork Facilitator',
    specialty: ['Breathwork', 'Stress Reduction', 'Somatic Healing'],
    bio: 'Sarah guides you through powerful breathwork sessions designed to release trapped emotions and reset your nervous system. Experience profound clarity and peace.',
    rating: 4.7,
    totalReviews: 56,
    pricePerSession: 90,
    sessionDuration: 45,
    availability: {
      days: ['Tue', 'Thu', 'Sun'],
      timeSlots: ['08:00', '18:00', '19:00']
    },
    email: 'sarah.jenkins@mindshift.com',
    verified: true,
    featured: false,
    createdAt: Date.now()
  },
  {
    id: '4',
    name: 'David Okafor',
    profileImage: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=200',
    title: 'Energy Healer',
    specialty: ['Energy Work', 'Reiki', 'Chakra Balancing'],
    bio: 'David is a certified Reiki master and energy healer. He helps clear energetic blockages to restore balance and harmony to your mind, body, and spirit.',
    rating: 5.0,
    totalReviews: 42,
    pricePerSession: 110,
    sessionDuration: 60,
    availability: {
      days: ['Mon', 'Wed', 'Fri'],
      timeSlots: ['11:00', '14:00', '16:00']
    },
    email: 'david.okafor@mindshift.com',
    verified: true,
    featured: false,
    createdAt: Date.now()
  },
  {
    id: '5',
    name: 'Amara Singh',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    title: 'Emotional Regulation Specialist',
    specialty: ['Emotional Regulation', 'Mindfulness', 'Resilience'],
    bio: 'Amara teaches practical tools for mastering your emotions. Learn to navigate life\'s ups and downs with grace and resilience through her targeted coaching programs.',
    rating: 4.9,
    totalReviews: 78,
    pricePerSession: 135,
    sessionDuration: 55,
    availability: {
      days: ['Tue', 'Wed', 'Thu'],
      timeSlots: ['09:30', '12:30', '15:30']
    },
    email: 'amara.singh@mindshift.com',
    verified: true,
    featured: true,
    createdAt: Date.now()
  }
];

export const getGuides = async (): Promise<Guide[]> => {
  if (!db) return MOCK_GUIDES;

  try {
    const q = query(collection(db, GUIDES_COLLECTION), orderBy('rating', 'desc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return MOCK_GUIDES.map(g => ({ ...g, _isMock: true } as unknown as Guide));
    }

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Guide));
  } catch (error) {
    console.error('Error fetching guides:', error);
    return MOCK_GUIDES;
  }
};

export const getGuideById = async (id: string): Promise<Guide | null> => {
  if (!db) {
    return MOCK_GUIDES.find(g => g.id === id) || null;
  }

  try {
    const docRef = doc(db, GUIDES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Guide;
    } else {
      // Fallback to mock data if not found in DB (for hybrid dev/prod scenarios)
      return MOCK_GUIDES.find(g => g.id === id) || null;
    }
  } catch (error) {
    console.error(`Error fetching guide ${id}:`, error);
    return MOCK_GUIDES.find(g => g.id === id) || null;
  }
};

export const createAppointment = async (appointment: Omit<Appointment, 'id' | 'createdAt'>): Promise<string> => {
  if (!db) throw new Error('Database not configured');

  // Use Firebase UID if available, otherwise fallback to provided userId (name)
  // This ensures security rules work if authenticated
  const uid = auth?.currentUser?.uid || appointment.userId;

  // Check for double booking
  const q = query(
    collection(db, APPOINTMENTS_COLLECTION),
    where('guideId', '==', appointment.guideId),
    where('date', '==', appointment.date),
    where('time', '==', appointment.time),
    where('status', '!=', 'cancelled')
  );

  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    throw new Error('Time slot already booked');
  }

  const docRef = await addDoc(collection(db, APPOINTMENTS_COLLECTION), {
    ...appointment,
    userId: uid, // Store the UID for security rules to check
    userName: appointment.userId, // Store the original name for display (assuming userId passed was name)
    createdAt: Date.now()
  });

  return docRef.id;
};

export const getAppointments = async (userId: string): Promise<Appointment[]> => {
  if (!db) return [];

  try {
    const q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('date', 'asc'),
      orderBy('time', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
};

export const getGuideReviews = async (guideId: string): Promise<GuideReview[]> => {
  if (!db) return [];

  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('guideId', '==', guideId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GuideReview));
  } catch (error) {
    console.error(`Error fetching reviews for guide ${guideId}:`, error);
    return [];
  }
};

export const addReview = async (review: Omit<GuideReview, 'id' | 'createdAt'>): Promise<string> => {
  if (!db) throw new Error('Database not configured');

  const uid = auth?.currentUser?.uid || review.userId;

  // Check if user already reviewed this guide
  const q = query(
    collection(db, REVIEWS_COLLECTION),
    where('guideId', '==', review.guideId),
    where('userId', '==', uid)
  );
  
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    throw new Error('You have already reviewed this guide');
  }

  const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), {
    ...review,
    userId: uid,
    createdAt: Date.now()
  });

  // Update guide average rating
  const guideRef = doc(db, GUIDES_COLLECTION, review.guideId);
  const guideSnap = await getDoc(guideRef);
  
  if (guideSnap.exists()) {
    const guideData = guideSnap.data() as Guide;
    const newTotal = (guideData.totalReviews || 0) + 1;
    const currentRating = guideData.rating || 0;
    // Calculate new weighted average
    // (oldRating * oldTotal + newRating) / newTotal
    const newRating = ((currentRating * (guideData.totalReviews || 0)) + review.rating) / newTotal;
    
    await updateDoc(guideRef, {
      rating: Number(newRating.toFixed(1)),
      totalReviews: newTotal
    });
  }

  return docRef.id;
};

export const seedGuides = async () => {
  if (!db) return;
  
  for (const guide of MOCK_GUIDES) {
    const docRef = doc(db, GUIDES_COLLECTION, guide.id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await setDoc(docRef, { ...guide, createdAt: Date.now() });
    }
  }
};
