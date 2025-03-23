export interface Interest {
  id: string;
  name: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl: string;
  interests: string[];
  demographics: {
    techRatio: number;
    totalAttendees: number;
    professionalDistribution: {
      tech: number;
      business: number;
      other: number;
    };
  };
  productivityScore: number;
}

export interface SocialPost {
  platform: 'linkedin' | 'twitter';
  content: string;
  date: string;
  likes: number;
  comments: number;
  shares: number;
}

export interface User {
  id: string;
  name: string;
  interests: string[];
  attendingEvents: string[];
  connectionScore: number;
  avatar: string;
  bio: string;
  disc: {
    primary: 'D' | 'I' | 'S' | 'C';
    secondary: 'D' | 'I' | 'S' | 'C';
    description: string;
    workStyle: string[];
    communicationTips: string[];
  };
  socialPosts: SocialPost[];
}