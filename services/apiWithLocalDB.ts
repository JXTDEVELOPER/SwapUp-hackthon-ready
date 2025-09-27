import { User, Skill, Swap, SwapStatus, Message, Review, Notification } from '../types';
import { localDb } from './localDatabase';

// Simulate network delay for realistic feel
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// User operations
export const getCurrentUser = async (): Promise<User> => {
  await delay(500);
  const user = await localDb.getCurrentUser();
  if (!user) throw new Error("Not logged in");
  return user;
};

export const login = async (email: string, _pass: string): Promise<User> => {
  await delay(1000);
  const user = await localDb.getUserByEmail(email);
  if (!user) throw new Error("Invalid credentials");
  await localDb.setCurrentUserId(user.id);
  return user;
};

export const signup = async (fullName: string, email: string, _pass: string): Promise<User> => {
  await delay(1000);
  const existingUser = await localDb.getUserByEmail(email);
  if (existingUser) throw new Error("Email already in use");
  
  const newUser: User = {
    id: String(Date.now()), // Simple ID generation
    fullName,
    email,
    bio: '',
    avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
    creditBalance: 10,
    location: { lat: 34.05, lng: -118.24 },
    openToVolunteering: false,
  };
  
  await localDb.createUser(newUser);
  await localDb.setCurrentUserId(newUser.id);
  return newUser;
};

export const logout = async (): Promise<void> => {
  await localDb.setCurrentUserId(null);
};

export const getUserProfile = async (userId: string): Promise<User> => {
  await delay(500);
  const user = await localDb.getUserById(userId);
  if (!user) throw new Error("User not found");
  
  // Calculate reputation score
  const reviews = await localDb.getReviewsByUserId(userId);
  const completedSwaps = await localDb.getSwapsByUserId(userId);
  const completedCount = completedSwaps.filter(s => s.status === SwapStatus.COMPLETED).length;
  
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 3;
  
  const ratingScore = averageRating * 10;
  const activityScore = completedCount * 2;
  const volunteerBonus = user.openToVolunteering ? 5 : 0;
  const reputationScore = ratingScore + activityScore + volunteerBonus;
  
  return { ...user, reputationScore };
};

export const updateProfile = async (userId: string, data: Partial<User>): Promise<User> => {
  await delay(1000);
  return await localDb.updateUser(userId, data);
};

// Skill operations
export const getSkillsForUser = async (userId: string): Promise<Skill[]> => {
  await delay(500);
  return await localDb.getSkillsByUserId(userId);
};

export const addSkill = async (userId: string, skillData: Omit<Skill, 'id' | 'userId'>): Promise<Skill> => {
  await delay(1000);
  const newSkill: Skill = {
    ...skillData,
    id: `s${Date.now()}`,
    userId,
  };
  return await localDb.createSkill(newSkill);
};

export const updateSkill = async (skillId: string, data: Partial<Omit<Skill, 'id' | 'userId'>>): Promise<Skill> => {
  await delay(1000);
  return await localDb.updateSkill(skillId, data);
};

export const findSkillsInRadius = async (_lat: number, _lng: number, _radius: number): Promise<Skill[]> => {
  await delay(1200);
  const skills = await localDb.getAllSkills();
  const users = await localDb.getAllUsers();
  
  return skills.map(skill => ({
    ...skill,
    user: users.find(u => u.id === skill.userId)
  }));
};

export const getRecommendations = async (_userId: string): Promise<Skill[]> => {
  await delay(1200);
  const currentUser = await localDb.getCurrentUser();
  if (!currentUser) return [];
  
  const skills = await localDb.getAllSkills();
  const users = await localDb.getAllUsers();
  
  const otherSkills = skills.filter(s => s.userId !== currentUser.id);
  const shuffled = otherSkills.sort(() => 0.5 - Math.random());
  
  return shuffled.slice(0, 6).map(skill => ({
    ...skill,
    user: users.find(u => u.id === skill.userId)
  }));
};

// Swap operations
export const getSwapsForUser = async (userId: string): Promise<Swap[]> => {
  await delay(800);
  const swaps = await localDb.getSwapsByUserId(userId);
  const users = await localDb.getAllUsers();
  
  return swaps.map(swap => {
    const learner = users.find(u => u.id === swap.learner.id)!;
    const teacher = users.find(u => u.id === swap.teacher.id)!;
    return {
      ...swap,
      learner,
      teacher,
    };
  }).sort((a,b) => parseInt(b.id.replace('sw',''), 10) - parseInt(a.id.replace('sw',''), 10));
};

export const getSwapById = async (swapId: string): Promise<Swap> => {
  await delay(400);
  const swap = await localDb.getSwapById(swapId);
  if (!swap) throw new Error("Swap not found");
  return swap;
};

export const requestSwap = async (skillId: string, learnerId: string): Promise<Swap> => {
  await delay(1000);
  const learner = await localDb.getUserById(learnerId);
  const skill = await localDb.getSkillById(skillId);
  
  if (!learner || !skill) {
    throw new Error("Learner or skill not found.");
  }
  
  const teacher = await localDb.getUserById(skill.userId);
  if (!teacher) {
    throw new Error("Teacher not found for this skill.");
  }
  
  // Check for existing pending/accepted swap
  const existingSwaps = await localDb.getSwapsByUserId(learnerId);
  const existing = existingSwaps.find(s => 
    s.skill.id === skillId && 
    (s.status === SwapStatus.PENDING || s.status === SwapStatus.ACCEPTED)
  );
  
  if (existing) {
    throw new Error("You have already requested this skill.");
  }
  
  const newSwap: Swap = {
    id: `sw${Date.now()}`,
    skill,
    learner,
    teacher,
    status: SwapStatus.PENDING,
  };
  
  await localDb.createSwap(newSwap);
  
  // Create notification for teacher
  const notification: Notification = {
    id: `n${Date.now()}`,
    userId: teacher.id,
    message: `${learner.fullName} has requested to learn your skill: ${skill.title}.`,
    link: '/dashboard',
    read: false,
    createdAt: new Date(),
  };
  
  await localDb.createNotification(notification);
  return newSwap;
};

export const updateSwapStatus = async (swapId: string, status: SwapStatus): Promise<Swap> => {
  await delay(800);
  const swap = await localDb.getSwapById(swapId);
  if (!swap) throw new Error("Swap not found");
  
  const originalStatus = swap.status;
  const updatedSwap = await localDb.updateSwap(swapId, { status });
  
  // Handle credit transfer on completion
  if (originalStatus === SwapStatus.ACCEPTED && status === SwapStatus.COMPLETED) {
    const cost = swap.skill.creditsPerHour;
    const learner = await localDb.getUserById(swap.learner.id);
    const teacher = await localDb.getUserById(swap.teacher.id);
    
    if (learner && teacher && learner.creditBalance >= cost) {
      await localDb.updateUser(learner.id, { creditBalance: learner.creditBalance - cost });
      await localDb.updateUser(teacher.id, { creditBalance: teacher.creditBalance + cost });
    }
  }
  
  return updatedSwap;
};

// Message operations
export const getChatMessages = async (swapId: string): Promise<Message[]> => {
  await delay(200);
  const messages = await localDb.getMessagesBySwapId(swapId);
  const users = await localDb.getAllUsers();
  
  // Mark messages as read
  const currentUser = await localDb.getCurrentUser();
  if (currentUser) {
    for (const msg of messages) {
      if (msg.senderId !== currentUser.id && !msg.readAt) {
        // In a real implementation, you'd update the message with readAt
        // For now, we'll just return the messages
      }
    }
  }
  
  return messages.map(msg => ({
    ...msg,
    sender: users.find(u => u.id === msg.senderId)
  }));
};

export const sendChatMessage = async (swapId: string, content: string): Promise<Message> => {
  await delay(300);
  const currentUser = await localDb.getCurrentUser();
  if (!currentUser) throw new Error("Not logged in");
  
  const newMessage: Message & { swapId: string } = {
    id: `m${Date.now()}`,
    senderId: currentUser.id,
    content,
    createdAt: new Date(),
    swapId,
  };
  
  await localDb.createMessage(newMessage);
  return {
    ...newMessage,
    sender: currentUser
  };
};

// Review operations
export const addReview = async (swapId: string, reviewerId: string, revieweeId: string, rating: number, comment: string): Promise<Review> => {
  await delay(1000);
  const newReview: Review = {
    id: `r${Date.now()}`,
    swapId,
    reviewerId,
    revieweeId,
    rating,
    comment,
    createdAt: new Date(),
  };
  return await localDb.createReview(newReview);
};

export const getReviewsForUser = async (userId: string): Promise<Review[]> => {
  await delay(600);
  const reviews = await localDb.getReviewsByUserId(userId);
  const users = await localDb.getAllUsers();
  
  return reviews.map(review => ({
    ...review,
    reviewer: users.find(u => u.id === review.reviewerId)
  })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// Notification operations
export const getNotifications = async (userId: string): Promise<Notification[]> => {
  await delay(300);
  const notifications = await localDb.getNotificationsByUserId(userId);
  return notifications.filter(n => !n.read);
};

export const markNotificationsAsRead = async (userId: string): Promise<void> => {
  await delay(500);
  await localDb.markNotificationsAsRead(userId);
};

// Utility functions
export const addCredits = async (userId: string, amount: number): Promise<User> => {
  await delay(800);
  const user = await localDb.getUserById(userId);
  if (!user) throw new Error("User not found");
  return await localDb.updateUser(userId, { creditBalance: user.creditBalance + amount });
};

export const getVolunteers = async (): Promise<User[]> => {
  await delay(700);
  const users = await localDb.getAllUsers();
  return users.filter(u => u.openToVolunteering);
};

export const generateMeetLink = async (swapId: string): Promise<Swap> => {
  await delay(1200);
  const swap = await localDb.getSwapById(swapId);
  if (!swap) throw new Error("Swap not found");
  
  const randomString = Math.random().toString(36).substring(2, 8);
  const meetLink = `https://meet.google.com/xyz-${randomString}`;
  
  // Update swap with meet link
  const updatedSwap = await localDb.updateSwap(swapId, { googleMeetLink: meetLink });
  return updatedSwap;
};

// Location services (keeping existing mock implementation)
const knownLocations: { [key: string]: { lat: number; lng: number } } = {
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'new york': { lat: 40.7128, lng: -74.0060 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  'chicago': { lat: 41.8781, lng: -87.6298 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'tokyo': { lat: 35.6895, lng: 139.6917 },
};

export const geocodeLocation = async (searchTerm: string): Promise<{ lat: number; lng: number }> => {
  await delay(700);
  const location = knownLocations[searchTerm.toLowerCase().trim()];
  if (location) {
    return location;
  }
  throw new Error("Location not found. Try 'New York' or 'San Francisco'.");
};

// Database initialization
export const initializeDatabase = async (): Promise<void> => {
  await localDb.seedDatabase();
};
