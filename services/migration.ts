import { localDb } from './localDatabase';

// Migration script to help transition from mock API to localStorage database
export const migrateToLocalDatabase = async (): Promise<void> => {
  try {
    console.log('🔄 Starting migration to local database...');
    
    // Check if database is already initialized
    const existingUsers = await localDb.getAllUsers();
    if (existingUsers.length > 0) {
      console.log('✅ Database already initialized, skipping migration');
      return;
    }
    
    // Initialize database with seed data
    await localDb.seedDatabase();
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Database now contains:');
    console.log(`   - ${await localDb.getAllUsers().then(users => users.length)} users`);
    console.log(`   - ${await localDb.getAllSkills().then(skills => skills.length)} skills`);
    console.log(`   - ${await localDb.getAllSwaps().then(swaps => swaps.length)} swaps`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Utility function to clear all data (for testing)
export const clearAllData = async (): Promise<void> => {
  try {
    await localDb.clearAllData();
    console.log('🗑️ All data cleared successfully');
  } catch (error) {
    console.error('❌ Failed to clear data:', error);
    throw error;
  }
};

// Utility function to check database status
export const checkDatabaseStatus = async (): Promise<void> => {
  try {
    const users = await localDb.getAllUsers();
    const skills = await localDb.getAllSkills();
    const swaps = await localDb.getAllSwaps();
    const currentUser = await localDb.getCurrentUser();
    
    console.log('📊 Database Status:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Skills: ${skills.length}`);
    console.log(`   - Swaps: ${swaps.length}`);
    console.log(`   - Current User: ${currentUser?.fullName || 'None'}`);
  } catch (error) {
    console.error('❌ Failed to check database status:', error);
  }
};
