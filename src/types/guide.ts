
export interface Guide {
  id: string;
  name: string;
  profileImage: string;
  title: string;
  specialty: string[];
  bio: string;
  rating: number;
  totalReviews: number;
  pricePerSession: number;
  sessionDuration: number; // minutes
  availability: {
    days: string[];
    timeSlots: string[];
  };
  email: string;
  website?: string;
  verified: boolean;
  featured: boolean;
  createdAt: number; // timestamp
}

export interface Appointment {
  id?: string;
  userId: string;
  guideId: string;
  guideName: string; // denormalized for easier display
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: number;
}

export interface GuideReview {
  id?: string;
  guideId: string;
  userId: string;
  userName: string; // denormalized
  rating: number;
  review: string;
  createdAt: number;
}
