export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  profilePicture: string;
  createdAt?: string;
  token?: string;
}

export interface WorkExperience {
  _id?: string;
  company: string;
  position: string;
  years: string;
}

export interface Education {
  _id?: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
}

export interface Profile {
  _id: string;
  userId: User; // Populated user object
  bio: string;
  currentPost: string;
  pastWork: WorkExperience[];
  education: Education[];
  resumeUrl?: string;
  resumeName?: string;
}

export interface Post {
  _id: string;
  userId: User; // Populated user object
  body: string;
  likes: number;
  media?: string;
  fileType?: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  commentCount?: number;
}

export interface Comment {
  _id: string;
  userId: User; // Populated user object
  postId: string;
  body: string;
  createdAt?: string;
}


export interface ConnectionRequest {
  _id: string;
  userId: User; // Sender
  connectionId: User; // Receiver
  status_accepted: boolean | null;
}
