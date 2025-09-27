import { User, Skill, Swap, Message, Review, Notification, SwapStatus } from '../types';

// LocalStorage Database Service - Firestore-like API
export class LocalDatabase {
  private dbName = 'swapup-database';
  
  // Generic CRUD operations
  private async getCollection<T>(collectionName: string): Promise<T[]> {
    try {
      const data = localStorage.getItem(`${this.dbName}-${collectionName}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading collection ${collectionName}:`, error);
      return [];
    }
  }

  private async setCollection<T>(collectionName: string, data: T[]): Promise<void> {
    try {
      localStorage.setItem(`${this.dbName}-${collectionName}`, JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing collection ${collectionName}:`, error);
      throw error;
    }
  }

  // Generic document operations
  async create<T extends { id: string }>(collectionName: string, doc: T): Promise<T> {
    const collection = await this.getCollection<T>(collectionName);
    collection.push(doc);
    await this.setCollection(collectionName, collection);
    return doc;
  }

  async getById<T extends { id: string }>(collectionName: string, id: string): Promise<T | null> {
    const collection = await this.getCollection<T>(collectionName);
    return collection.find(doc => doc.id === id) || null;
  }

  async getAll<T>(collectionName: string): Promise<T[]> {
    return await this.getCollection<T>(collectionName);
  }

  async update<T extends { id: string }>(collectionName: string, id: string, updates: Partial<T>): Promise<T> {
    const collection = await this.getCollection<T>(collectionName);
    const index = collection.findIndex(doc => doc.id === id);
    
    if (index === -1) {
      throw new Error(`Document with id ${id} not found in ${collectionName}`);
    }
    
    collection[index] = { ...collection[index], ...updates };
    await this.setCollection(collectionName, collection);
    return collection[index];
  }

  async delete(collectionName: string, id: string): Promise<void> {
    const collection = await this.getCollection(collectionName);
    const filtered = collection.filter(doc => doc.id !== id);
    await this.setCollection(collectionName, filtered);
  }

  async query<T>(collectionName: string, filterFn: (doc: T) => boolean): Promise<T[]> {
    const collection = await this.getCollection<T>(collectionName);
    return collection.filter(filterFn);
  }

  // User operations
  async createUser(user: User): Promise<User> {
    return await this.create('users', user);
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.getById<User>('users', id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.query<User>('users', user => user.email === email);
    return users[0] || null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    return await this.update('users', id, updates);
  }

  async getAllUsers(): Promise<User[]> {
    return await this.getAll<User>('users');
  }

  // Skill operations
  async createSkill(skill: Skill): Promise<Skill> {
    return await this.create('skills', skill);
  }

  async getSkillById(id: string): Promise<Skill | null> {
    return await this.getById<Skill>('skills', id);
  }

  async getSkillsByUserId(userId: string): Promise<Skill[]> {
    return await this.query<Skill>('skills', skill => skill.userId === userId);
  }

  async getAllSkills(): Promise<Skill[]> {
    return await this.getAll<Skill>('skills');
  }

  async getAllSwaps(): Promise<Swap[]> {
    return await this.getAll<Swap>('swaps');
  }

  async updateSkill(id: string, updates: Partial<Skill>): Promise<Skill> {
    return await this.update('skills', id, updates);
  }

  async deleteSkill(id: string): Promise<void> {
    await this.delete('skills', id);
  }

  // Swap operations
  async createSwap(swap: Swap): Promise<Swap> {
    return await this.create('swaps', swap);
  }

  async getSwapById(id: string): Promise<Swap | null> {
    return await this.getById<Swap>('swaps', id);
  }

  async getSwapsByUserId(userId: string): Promise<Swap[]> {
    return await this.query<Swap>('swaps', swap => 
      swap.learner.id === userId || swap.teacher.id === userId
    );
  }

  async updateSwap(id: string, updates: Partial<Swap>): Promise<Swap> {
    return await this.update('swaps', id, updates);
  }

  // Message operations
  async createMessage(message: Message & { swapId: string }): Promise<Message> {
    return await this.create('messages', message);
  }

  async getMessagesBySwapId(swapId: string): Promise<Message[]> {
    return await this.query<Message & { swapId: string }>('messages', msg => msg.swapId === swapId);
  }

  // Review operations
  async createReview(review: Review): Promise<Review> {
    return await this.create('reviews', review);
  }

  async getReviewsByUserId(userId: string): Promise<Review[]> {
    return await this.query<Review>('reviews', review => review.revieweeId === userId);
  }

  // Notification operations
  async createNotification(notification: Notification): Promise<Notification> {
    return await this.create('notifications', notification);
  }

  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    return await this.query<Notification>('notifications', notification => notification.userId === userId);
  }

  async markNotificationsAsRead(userId: string): Promise<void> {
    const notifications = await this.getNotificationsByUserId(userId);
    for (const notification of notifications) {
      await this.update('notifications', notification.id, { read: true });
    }
  }

  // Current user management
  async getCurrentUserId(): Promise<string | null> {
    try {
      return localStorage.getItem(`${this.dbName}-currentUser`);
    } catch {
      return null;
    }
  }

  async setCurrentUserId(userId: string | null): Promise<void> {
    if (userId) {
      localStorage.setItem(`${this.dbName}-currentUser`, userId);
    } else {
      localStorage.removeItem(`${this.dbName}-currentUser`);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const userId = await this.getCurrentUserId();
    if (!userId) return null;
    return await this.getUserById(userId);
  }

  // Database management
  async clearAllData(): Promise<void> {
    const collections = ['users', 'skills', 'swaps', 'messages', 'reviews', 'notifications'];
    for (const collection of collections) {
      localStorage.removeItem(`${this.dbName}-${collection}`);
    }
    localStorage.removeItem(`${this.dbName}-currentUser`);
  }

  async seedDatabase(): Promise<void> {
    // Check if already seeded
    const users = await this.getAllUsers();
    if (users.length > 0) return;

    // Seed users
    const seedUsers: User[] = [
      { id: '1', fullName: 'Alice Johnson', email: 'alice@example.com', bio: 'Passionate sourdough baker and aspiring guitarist. I love sharing my passion for baking with others!', avatarUrl: 'https://i.pravatar.cc/150?u=alice', creditBalance: 25, location: { lat: 34.0522, lng: -118.2437 }, openToVolunteering: true },
      { id: '2', fullName: 'Bob Williams', email: 'bob@example.com', bio: 'Software engineer by day, musician by night. I can teach you the basics of Python or jam on the guitar.', avatarUrl: 'https://i.pravatar.cc/150?u=bob', creditBalance: 15, location: { lat: 34.055, lng: -118.25 }, openToVolunteering: false },
      { id: '3', fullName: 'Carla Rodriguez', email: 'carla@example.com', bio: 'Graphic designer with a knack for digital art. Looking to learn how to cook authentic Italian pasta.', avatarUrl: 'https://i.pravatar.cc/150?u=carla', creditBalance: 10, location: { lat: 34.06, lng: -118.23 }, openToVolunteering: true },
      { id: '4', fullName: 'David Chen', bio: 'Professional photographer and drone pilot.', avatarUrl: 'https://i.pravatar.cc/150?u=david', creditBalance: 50, location: { lat: 40.7128, lng: -74.0060 }, openToVolunteering: false },
    ];

    // Seed skills
    const seedSkills: Skill[] = [
      { id: 's1', userId: '1', title: 'Sourdough Baking', description: 'Learn to make delicious artisan sourdough bread from scratch.', category: 'Cooking', creditsPerHour: 5 },
      { id: 's2', userId: '2', title: 'Python Basics', description: 'Get started with the fundamentals of Python programming.', category: 'Technology', creditsPerHour: 8 },
      { id: 's3', userId: '2', title: 'Beginner Guitar', description: 'Learn basic chords and strumming patterns to play your favorite songs.', category: 'Music', creditsPerHour: 6 },
      { id: 's4', userId: '3', title: 'Digital Illustration with Procreate', description: 'Master the basics of Procreate on the iPad.', category: 'Art', creditsPerHour: 7 },
      { id: 's5', userId: '4', title: 'Drone Photography', description: 'Learn to capture stunning aerial shots with a drone.', category: 'Technology', creditsPerHour: 10 },
      { id: 's6', userId: '1', title: 'Italian Pasta Making', description: 'Hand-make authentic pasta from scratch.', category: 'Cooking', creditsPerHour: 6 },
    ];

    // Seed swaps
    const seedSwaps: Swap[] = [
      { id: 'sw1', skill: seedSkills[1], learner: seedUsers[0], teacher: seedUsers[1], status: SwapStatus.ACCEPTED },
      { id: 'sw2', skill: seedSkills[0], learner: seedUsers[2], teacher: seedUsers[0], status: SwapStatus.PENDING },
      { id: 'sw3', skill: seedSkills[3], learner: seedUsers[1], teacher: seedUsers[2], status: SwapStatus.COMPLETED },
    ];

    // Seed messages
    const seedMessages = [
      { id: 'm1', swapId: 'sw1', senderId: '1', content: 'Hey Bob! Really excited to learn Python. When works for you?', createdAt: new Date(Date.now() - 1000 * 60 * 5), readAt: new Date(Date.now() - 1000 * 60 * 4) },
      { id: 'm2', swapId: 'sw1', senderId: '2', content: 'Hi Alice! How about this weekend? Saturday afternoon?', createdAt: new Date(Date.now() - 1000 * 60 * 4) },
      { id: 'm3', swapId: 'sw2', senderId: '3', content: 'Hi, I would love to learn how to bake sourdough!', createdAt: new Date(Date.now() - 1000 * 60 * 30)},
    ];

    // Seed reviews
    const seedReviews: Review[] = [
      { id: 'r1', swapId: 'sw3', reviewerId: '1', revieweeId: '2', rating: 5, comment: 'Bob was an amazing teacher! Very clear and patient.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
      { id: 'r2', swapId: 'sw3', reviewerId: '2', revieweeId: '1', rating: 4, comment: 'Great student, very enthusiastic!', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23) },
    ];

    // Seed notifications
    const seedNotifications: Notification[] = [
      { id: 'n1', userId: '1', message: `Carla Rodriguez requested to learn Sourdough Baking.`, link: `/dashboard`, read: false, createdAt: new Date(Date.now() - 1000 * 60 * 30) },
    ];

    // Insert all data
    for (const user of seedUsers) {
      await this.createUser(user);
    }
    for (const skill of seedSkills) {
      await this.createSkill(skill);
    }
    for (const swap of seedSwaps) {
      await this.createSwap(swap);
    }
    for (const message of seedMessages) {
      await this.createMessage(message);
    }
    for (const review of seedReviews) {
      await this.createReview(review);
    }
    for (const notification of seedNotifications) {
      await this.createNotification(notification);
    }

    // Set initial current user
    await this.setCurrentUserId('1');
  }
}

// Export singleton instance
export const localDb = new LocalDatabase();
