import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface UserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'mentor' | 'seeker';
  bio?: string;
  specialties?: string[];
  location?: string;
  phone?: string;
}

async function importUsers() {
  try {
    console.log('👥 Starting users import...');

    // Sample user data
    const users: UserData[] = [
      {
        email: 'admin@evangelismapp.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        bio: 'System administrator for the evangelism platform.'
      },
      {
        email: 'mentor1@example.com',
        password: 'mentor123',
        firstName: 'John',
        lastName: 'Smith',
        role: 'mentor',
        bio: 'Experienced pastor with 20 years of ministry experience.',
        specialties: ['Spiritual Growth', 'Prayer', 'Bible Study'],
        location: 'California, USA',
        phone: '(555) 123-4567'
      },
      {
        email: 'mentor2@example.com',
        password: 'mentor123',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'mentor',
        bio: 'Youth pastor passionate about discipleship and evangelism.',
        specialties: ['Youth Ministry', 'Evangelism', 'Discipleship'],
        location: 'Texas, USA',
        phone: '(555) 987-6543'
      },
      {
        email: 'seeker1@example.com',
        password: 'seeker123',
        firstName: 'Michael',
        lastName: 'Brown',
        role: 'seeker',
        bio: 'New believer seeking spiritual guidance and mentorship.',
        location: 'New York, USA',
        phone: '(555) 456-7890'
      },
      {
        email: 'seeker2@example.com',
        password: 'seeker123',
        firstName: 'Emily',
        lastName: 'Davis',
        role: 'seeker',
        bio: 'Looking to deepen my faith and find a church community.',
        location: 'Florida, USA',
        phone: '(555) 321-9876'
      }
    ];

    // Clear existing users
    await prisma.user.deleteMany();
    console.log('🗑️ Cleared existing users');

    // Import users
    for (const userData of users) {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          bio: userData.bio,
          location: userData.location,
          phone: userData.phone,
          isActive: true,
          emailVerified: true
        }
      });

      // Create mentor profile if role is mentor
      if (userData.role === 'mentor') {
        await prisma.mentor.create({
          data: {
            userId: user.id,
            bio: userData.bio,
            specialties: userData.specialties || [],
            isAvailable: true,
            rating: 5.0,
            totalSessions: 0
          }
        });
      }

      // Create seeker profile if role is seeker
      if (userData.role === 'seeker') {
        await prisma.seeker.create({
          data: {
            userId: user.id,
            bio: userData.bio,
            spiritualJourney: 'New believer seeking guidance',
            interests: ['Bible Study', 'Prayer', 'Community'],
            isActive: true
          }
        });
      }

      console.log(`✅ Imported: ${userData.firstName} ${userData.lastName} (${userData.role})`);
    }

    console.log(`🎉 Successfully imported ${users.length} users!`);

  } catch (error) {
    console.error('❌ Error importing users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  importUsers()
    .then(() => {
      console.log('✅ Users import completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Users import failed:', error);
      process.exit(1);
    });
}

export default importUsers;
