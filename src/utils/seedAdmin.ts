// Backend: src/utils/seedAdmin.ts
import bcrypt from 'bcryptjs';
import User from '../models/User';

export const seedInitialAdmin = async (): Promise<void> => {
  try {
    const adminEmail = 'admin@orderflow.com';
    const adminPassword = 'AdminPassword123!';

    const existingAdmin = await User.findOne({ email: adminEmail });

    // If the admin already exists, migrate any legacy plain-text password to a bcrypt hash.
    if (existingAdmin) {
      const needsPasswordRehash = existingAdmin.password && !existingAdmin.password.startsWith('$2');

      if (needsPasswordRehash) {
        existingAdmin.password = await bcrypt.hash(adminPassword, 10);
        await existingAdmin.save();
        console.log('🔐 Rehashed legacy admin password for admin@orderflow.com');
      }

      return;
    }

    // Create the default admin with a hashed password so the login check passes reliably.
    await User.create({
      name: 'Master Admin',
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 10),
      role: 'admin',
    });

    console.log('🌱 Seeded initial master admin: admin@orderflow.com');
  } catch (error) {
    console.error('Failed to seed initial admin:', error);
  }
};