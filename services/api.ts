import { User, Skill, Swap, SwapStatus, Message, Review, Notification } from '../types';

// --- MOCK DATABASE ---
const users: User[] = [
  { id: '1', fullName: 'Alice Johnson', email: 'alice@example.com', bio: 'Passionate sourdough baker and aspiring guitarist. I love sharing my passion for baking with others!', avatarUrl: 'https://i.pravatar.cc/150?u=alice', creditBalance: 25, location: { lat: 34.0522, lng: -118.2437 }, openToVolunteering: true },
  { id: '2', fullName: 'Bob Williams', email: 'bob@example.com', bio: 'Software engineer by day, musician by night. I can teach you the basics of Python or jam on the guitar.', avatarUrl: 'https://i.pravatar.cc/150?u=bob', creditBalance: 15, location: { lat: 34.055, lng: -118.25 }, openToVolunteering: false },
  { id: '3', fullName: 'Carla Rodriguez', email: 'carla@example.com', bio: 'Graphic designer with a knack for digital art. Looking to learn how to cook authentic Italian pasta.', avatarUrl: 'https://i.pravatar.cc/150?u=carla', creditBalance: 10, location: { lat: 34.06, lng: -118.23 }, openToVolunteering: true },
  { id: '4', fullName: 'David Chen', bio: 'Professional photographer and drone pilot.', avatarUrl: 'https://i.pravatar.cc/150?u=david', creditBalance: 50, location: { lat: 40.7128, lng: -74.0060 }, openToVolunteering: false },
];

const skills: Skill[] = [
  { id: 's1', userId: '1', title: 'Sourdough Baking', description: 'Learn to make delicious artisan sourdough bread from scratch.', category: 'Cooking', creditsPerHour: 5 },
  { id: 's2', userId: '2', title: 'Python Basics', description: 'Get started with the fundamentals of Python programming.', category: 'Technology', creditsPerHour: 8 },
  { id: 's3', userId: '2', title: 'Beginner Guitar', description: 'Learn basic chords and strumming patterns to play your favorite songs.', category: 'Music', creditsPerHour: 6 },
  { id: 's4', userId: '3', title: 'Digital Illustration with Procreate', description: 'Master the basics of Procreate on the iPad.', category: 'Art', creditsPerHour: 7 },
  { id: 's5', userId: '4', title: 'Drone Photography', description: 'Learn to capture stunning aerial shots with a drone.', category: 'Technology', creditsPerHour: 10 },
  { id: 's6', userId: '1', title: 'Italian Pasta Making', description: 'Hand-make authentic pasta from scratch.', category: 'Cooking', creditsPerHour: 6 },
];

const swaps: Swap[] = [
  { id: 'sw1', skill: skills[1], learner: users[0], teacher: users[1], status: SwapStatus.ACCEPTED },
  { id: 'sw2', skill: skills[0], learner: users[2], teacher: users[0], status: SwapStatus.PENDING },
  { id: 'sw3', skill: skills[3], learner: users[1], teacher: users[2], status: SwapStatus.COMPLETED },
];

const messages: { [swapId: string]: Message[] } = {
  'sw1': [
    { id: 'm1', senderId: '1', content: 'Hey Bob! Really excited to learn Python. When works for you?', createdAt: new Date(Date.now() - 1000 * 60 * 5), readAt: new Date(Date.now() - 1000 * 60 * 4) },
    { id: 'm2', senderId: '2', content: 'Hi Alice! How about this weekend? Saturday afternoon?', createdAt: new Date(Date.now() - 1000 * 60 * 4) },
  ],
  'sw2': [
    { id: 'm3', senderId: '3', content: 'Hi, I would love to learn how to bake sourdough!', createdAt: new Date(Date.now() - 1000 * 60 * 30)},
  ]
};

const reviews: Review[] = [
  { id: 'r1', swapId: 'sw3', reviewerId: '1', revieweeId: '2', rating: 5, comment: 'Bob was an amazing teacher! Very clear and patient.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
  { id: 'r2', swapId: 'sw3', reviewerId: '2', revieweeId: '1', rating: 4, comment: 'Great student, very enthusiastic!', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23) },
];

const notifications: Notification[] = [
    { id: 'n1', userId: '1', message: `Carla Rodriguez requested to learn Sourdough Baking.`, link: `/dashboard`, read: false, createdAt: new Date(Date.now() - 1000 * 60 * 30) },
];


let currentUserId: string | null = '1'; // Simulate user '1' is logged in initially

// --- MOCK API FUNCTIONS ---

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getCurrentUser = async (): Promise<User> => {
  await delay(500);
  if (!currentUserId) return Promise.reject("Not logged in");
  const user = users.find(u => u.id === currentUserId);
  if (!user) return Promise.reject("User not found");
  return user;
};

export const login = async (email: string, _pass: string): Promise<User> => {
  await delay(1000);
  const user = users.find(u => u.email === email);
  if (!user) return Promise.reject("Invalid credentials");
  currentUserId = user.id;
  return user;
};

export const signup = async (fullName: string, email: string, _pass: string): Promise<User> => {
    await delay(1000);
    if(users.some(u => u.email === email)) return Promise.reject("Email already in use");
    const newUser: User = {
        id: String(users.length + 1),
        fullName,
        email,
        bio: '',
        avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
        creditBalance: 10,
        location: { lat: 34.05, lng: -118.24 },
        openToVolunteering: false,
    };
    users.push(newUser);
    currentUserId = newUser.id;
    return newUser;
};

export const logout = (): void => {
  currentUserId = null;
};

const calculateReputationScore = (user: User): number => {
    const userReviews = reviews.filter(r => r.revieweeId === user.id);
    const completedSwaps = swaps.filter(s => (s.learner.id === user.id || s.teacher.id === user.id) && s.status === SwapStatus.COMPLETED);

    const averageRating = userReviews.length > 0
        ? userReviews.reduce((acc, r) => acc + r.rating, 0) / userReviews.length
        : 3; // Default to a neutral rating if no reviews yet

    const ratingScore = averageRating * 10;
    const activityScore = completedSwaps.length * 2;
    const volunteerBonus = user.openToVolunteering ? 5 : 0;

    return ratingScore + activityScore + volunteerBonus;
};

export const getUserProfile = async (userId: string): Promise<User> => {
  await delay(500);
  const user = users.find(u => u.id === userId);
  if (!user) return Promise.reject("User not found");
  
  const reputationScore = calculateReputationScore(user);

  return { ...user, reputationScore };
};

export const getSkillsForUser = async (userId: string): Promise<Skill[]> => {
  await delay(500);
  return skills.filter(s => s.userId === userId);
};

export const updateProfile = async (userId: string, data: Partial<User>): Promise<User> => {
    await delay(1000);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return Promise.reject("User not found");
    users[userIndex] = { ...users[userIndex], ...data };
    return users[userIndex];
};

export const addSkill = async (userId: string, skillData: Omit<Skill, 'id' | 'userId'>): Promise<Skill> => {
    await delay(1000);
    const newSkill: Skill = {
        ...skillData,
        id: `s${skills.length + 1}`,
        userId,
    };
    skills.push(newSkill);
    return newSkill;
};

export const updateSkill = async (skillId: string, data: Partial<Omit<Skill, 'id' | 'userId'>>): Promise<Skill> => {
    await delay(1000);
    const skillIndex = skills.findIndex(s => s.id === skillId);
    if (skillIndex === -1) return Promise.reject("Skill not found");
    
    const originalSkill = skills[skillIndex];
    skills[skillIndex] = { ...originalSkill, ...data };
    
    return skills[skillIndex];
};

export const findSkillsInRadius = async (_lat: number, _lng: number, _radius: number): Promise<Skill[]> => {
    await delay(1200);
    // This mock function doesn't actually use the location data, 
    // but in a real app it would perform a geospatial query.
    return skills.map(skill => ({
        ...skill,
        user: users.find(u => u.id === skill.userId)
    }));
};

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
  return Promise.reject("Location not found. Try 'New York' or 'San Francisco'.");
};

export const getRecommendations = async (_userId: string): Promise<Skill[]> => {
    await delay(1200);
    // Shuffle all skills the user doesn't own
    const otherSkills = skills.filter(s => s.userId !== currentUserId);
    const shuffled = otherSkills.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6).map(skill => ({
        ...skill,
        user: users.find(u => u.id === skill.userId)
    }));
};

export const getSwapsForUser = async (userId: string): Promise<Swap[]> => {
    await delay(800);
    const userSwaps = swaps.filter(s => s.learner.id === userId || s.teacher.id === userId);
    return userSwaps.map(swap => {
        const chatMessages = messages[swap.id] || [];
        const latestMessage = chatMessages.length > 0 ? chatMessages[chatMessages.length - 1] : undefined;
        return {
            ...swap,
            learner: { ...swap.learner, reputationScore: calculateReputationScore(swap.learner) },
            teacher: { ...swap.teacher, reputationScore: calculateReputationScore(swap.teacher) },
            latestMessage: latestMessage,
        }
    }).sort((a,b) => parseInt(b.id.replace('sw',''), 10) - parseInt(a.id.replace('sw',''), 10));
};

export const getSwapById = async (swapId: string): Promise<Swap> => {
    await delay(400);
    const swap = swaps.find(s => s.id === swapId);
    if (!swap) return Promise.reject("Swap not found");
    const learner = users.find(u => u.id === swap.learner.id)!;
    const teacher = users.find(u => u.id === swap.teacher.id)!;
    return {...swap, learner, teacher};
}

export const getChatMessages = async (swapId: string): Promise<Message[]> => {
    await delay(200);
    const chatMessages = messages[swapId] || [];

    // Simulate marking messages as read when fetched by the recipient
    if (currentUserId) {
        chatMessages.forEach(msg => {
            if (msg.senderId !== currentUserId && !msg.readAt) {
                msg.readAt = new Date();
            }
        });
    }

    return chatMessages.map(msg => ({
        ...msg,
        sender: users.find(u => u.id === msg.senderId)
    }));
};

export const sendChatMessage = async (swapId: string, content: string): Promise<Message> => {
    await delay(300);
    if (!currentUserId) return Promise.reject("Not logged in");
    const newMessage: Message = {
        id: `m${Math.random()}`,
        senderId: currentUserId,
        content,
        createdAt: new Date(),
    };
    if (!messages[swapId]) messages[swapId] = [];
    messages[swapId].push(newMessage);
    return {...newMessage, sender: users.find(u => u.id === currentUserId)};
};

export const getVolunteers = async(): Promise<User[]> => {
    await delay(700);
    return users.filter(u => u.openToVolunteering);
}

export const addCredits = async (userId: string, amount: number): Promise<User> => {
    await delay(800);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return Promise.reject("User not found");
    users[userIndex].creditBalance += amount;
    return users[userIndex];
};

export const addReview = async (swapId: string, reviewerId: string, revieweeId: string, rating: number, comment: string): Promise<Review> => {
  await delay(1000);
  if (!reviewerId) return Promise.reject("Not logged in");
  const newReview: Review = {
    id: `r${reviews.length + 1}`,
    swapId,
    reviewerId,
    revieweeId,
    rating,
    comment,
    createdAt: new Date(),
  };
  reviews.push(newReview);
  return newReview;
};

export const getReviewsForUser = async (userId: string): Promise<Review[]> => {
  await delay(600);
  const userReviews = reviews.filter(r => r.revieweeId === userId);
  return userReviews.map(review => ({
    ...review,
    reviewer: users.find(u => u.id === review.reviewerId)
  })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const generateMeetLink = async (swapId: string): Promise<Swap> => {
    await delay(1200);
    const swapIndex = swaps.findIndex(s => s.id === swapId);
    if (swapIndex === -1) return Promise.reject("Swap not found");
    const randomString = Math.random().toString(36).substring(2, 8);
    swaps[swapIndex].googleMeetLink = `https://meet.google.com/xyz-${randomString}`;
    return swaps[swapIndex];
};

export const updateSwapStatus = async (swapId: string, status: SwapStatus): Promise<Swap> => {
    await delay(800);
    const swapIndex = swaps.findIndex(s => s.id === swapId);
    if (swapIndex === -1) return Promise.reject("Swap not found");
    
    const originalStatus = swaps[swapIndex].status;
    swaps[swapIndex].status = status;

    // Handle credit transfer on completion
    if (originalStatus === SwapStatus.ACCEPTED && status === SwapStatus.COMPLETED) {
        const swap = swaps[swapIndex];
        const cost = swap.skill.creditsPerHour; // Assuming 1 hour session
        const learnerIndex = users.findIndex(u => u.id === swap.learner.id);
        const teacherIndex = users.findIndex(u => u.id === swap.teacher.id);

        if (learnerIndex !== -1 && teacherIndex !== -1 && users[learnerIndex].creditBalance >= cost) {
            users[learnerIndex].creditBalance -= cost;
            users[teacherIndex].creditBalance += cost;
        } else {
             console.error("Credit transfer failed. Not enough credits or user not found.");
             // In a real app, you'd handle this failure case, maybe revert status.
        }
    }
    return swaps[swapIndex];
}

export const getNotifications = async (userId: string): Promise<Notification[]> => {
    await delay(300);
    return notifications.filter(n => n.userId === userId && !n.read);
}

export const markNotificationsAsRead = async (userId: string): Promise<void> => {
    await delay(500);
    notifications.forEach(n => {
        if (n.userId === userId) n.read = true;
    });
}

export const requestSwap = async (skillId: string, learnerId: string): Promise<Swap> => {
    await delay(1000);
    const learner = users.find(u => u.id === learnerId);
    const skill = skills.find(s => s.id === skillId);

    if (!learner || !skill) {
        return Promise.reject("Learner or skill not found.");
    }
    const teacher = users.find(u => u.id === skill.userId);
    if (!teacher) {
        return Promise.reject("Teacher not found for this skill.");
    }

    // Check for existing pending/accepted swap for this skill/learner combo
    const existing = swaps.find(s => s.skill.id === skillId && s.learner.id === learnerId && (s.status === SwapStatus.PENDING || s.status === SwapStatus.ACCEPTED));
    if (existing) {
        return Promise.reject("You have already requested this skill.");
    }

    const newSwap: Swap = {
        id: `sw${swaps.length + 1}`,
        skill,
        learner,
        teacher,
        status: SwapStatus.PENDING,
    };
    swaps.push(newSwap);
    
    // Create a notification for the teacher
    const newNotification: Notification = {
        id: `n${notifications.length + 1}`,
        userId: teacher.id,
        message: `${learner.fullName} has requested to learn your skill: ${skill.title}.`,
        link: '/dashboard',
        read: false,
        createdAt: new Date(),
    };
    notifications.push(newNotification);

    return newSwap;
};