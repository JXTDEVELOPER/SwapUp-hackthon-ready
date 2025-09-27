import { localDb } from './localDatabase';
import { User, Skill } from '../types';

// Simple test functions to verify database functionality
export const testDatabase = async (): Promise<void> => {
  console.log('🧪 Testing local database...');
  
  try {
    // Test 1: Create a user
    console.log('Test 1: Creating user...');
    const testUser: User = {
      id: 'test-user-1',
      fullName: 'Test User',
      email: 'test@example.com',
      bio: 'Test bio',
      avatarUrl: 'https://example.com/avatar.jpg',
      creditBalance: 100,
      location: { lat: 0, lng: 0 },
      openToVolunteering: true
    };
    
    await localDb.createUser(testUser);
    console.log('✅ User created successfully');
    
    // Test 2: Retrieve the user
    console.log('Test 2: Retrieving user...');
    const retrievedUser = await localDb.getUserById('test-user-1');
    if (retrievedUser && retrievedUser.fullName === 'Test User') {
      console.log('✅ User retrieved successfully');
    } else {
      throw new Error('User retrieval failed');
    }
    
    // Test 3: Update the user
    console.log('Test 3: Updating user...');
    await localDb.updateUser('test-user-1', { creditBalance: 150 });
    const updatedUser = await localDb.getUserById('test-user-1');
    if (updatedUser && updatedUser.creditBalance === 150) {
      console.log('✅ User updated successfully');
    } else {
      throw new Error('User update failed');
    }
    
    // Test 4: Create a skill
    console.log('Test 4: Creating skill...');
    const testSkill: Skill = {
      id: 'test-skill-1',
      userId: 'test-user-1',
      title: 'Test Skill',
      description: 'A test skill',
      category: 'Test',
      creditsPerHour: 10
    };
    
    await localDb.createSkill(testSkill);
    console.log('✅ Skill created successfully');
    
    // Test 5: Query skills by user
    console.log('Test 5: Querying skills by user...');
    const userSkills = await localDb.getSkillsByUserId('test-user-1');
    if (userSkills.length === 1 && userSkills[0].title === 'Test Skill') {
      console.log('✅ Skills queried successfully');
    } else {
      throw new Error('Skill query failed');
    }
    
    // Test 6: Set current user
    console.log('Test 6: Setting current user...');
    await localDb.setCurrentUserId('test-user-1');
    const currentUser = await localDb.getCurrentUser();
    if (currentUser && currentUser.id === 'test-user-1') {
      console.log('✅ Current user set successfully');
    } else {
      throw new Error('Current user setting failed');
    }
    
    // Clean up test data
    console.log('Cleaning up test data...');
    await localDb.delete('users', 'test-user-1');
    await localDb.delete('skills', 'test-skill-1');
    await localDb.setCurrentUserId(null);
    
    console.log('🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    throw error;
  }
};

// Run the test
export const runDatabaseTest = async (): Promise<void> => {
  try {
    await testDatabase();
  } catch (error) {
    console.error('Database test failed:', error);
  }
};
