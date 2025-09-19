import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@evangelismapp.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@evangelismapp.com',
      passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeH4Qz7KzKzKzKzKzK', // password: admin123
      userRole: 'ADMIN',
      profileComplete: true,
      isApproved: true,
      isActive: true,
      approvalDate: new Date(),
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create sample seeker
  const seekerUser = await prisma.user.upsert({
    where: { email: 'seeker@example.com' },
    update: {},
    create: {
      username: 'seeker1',
      email: 'seeker@example.com',
      passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeH4Qz7KzKzKzKzKzK', // password: seeker123
      userRole: 'SEEKER',
      profileComplete: true,
      isApproved: true,
      isActive: true,
    },
  });

  console.log('✅ Sample seeker created:', seekerUser.email);

  // Create sample mentor
  const mentorUser = await prisma.user.upsert({
    where: { email: 'mentor@example.com' },
    update: {},
    create: {
      username: 'mentor1',
      email: 'mentor@example.com',
      passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeH4Qz7KzKzKzKzKzK', // password: mentor123
      userRole: 'DISCIPLE_MAKER',
      profileComplete: true,
      isApproved: true,
      isActive: true,
      approvalDate: new Date(),
    },
  });

  console.log('✅ Sample mentor created:', mentorUser.email);

  // Create mentor profile
  await prisma.mentorProfile.upsert({
    where: { userId: mentorUser.id },
    update: {},
    create: {
      userId: mentorUser.id,
      testimony: 'I found hope and healing through my relationship with Jesus Christ. After struggling with addiction for years, God transformed my life completely.',
      yearsChristian: '15+',
      denomination: 'Non-denominational',
      traumas: ['addiction', 'depression', 'family_issues'],
      healingStory: 'God delivered me from a 10-year addiction to drugs and alcohol. Through prayer, community, and professional help, I found freedom and purpose.',
      keyScriptures: 'Romans 8:28, Philippians 4:13, 2 Corinthians 5:17',
      specialties: ['addiction_recovery', 'depression', 'family_healing', 'spiritual_growth'],
      additionalExpertise: 'Certified addiction counselor, 10+ years in recovery ministry',
      maxMentees: 8,
      sessionTypes: 'both',
      communicationPreference: 'both',
      sessionDuration: 60,
      mentoringPhilosophy: 'I believe in meeting people where they are and walking alongside them as God transforms their lives.',
      groupTopics: ['addiction_recovery', 'spiritual_growth', 'family_healing'],
      groupDescription: 'Support groups for those seeking freedom from addiction and spiritual growth.',
      availabilitySchedule: {
        monday: ['9:00-12:00', '19:00-21:00'],
        tuesday: ['9:00-12:00', '19:00-21:00'],
        wednesday: ['9:00-12:00'],
        thursday: ['9:00-12:00', '19:00-21:00'],
        friday: ['9:00-12:00'],
        saturday: ['10:00-14:00'],
        sunday: []
      },
    },
  });

  console.log('✅ Mentor profile created');

  // Create sample church finder
  const churchFinderUser = await prisma.user.upsert({
    where: { email: 'churchfinder@example.com' },
    update: {},
    create: {
      username: 'churchfinder1',
      email: 'churchfinder@example.com',
      passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeH4Qz7KzKzKzKzKzK', // password: church123
      userRole: 'CHURCH_FINDER',
      profileComplete: true,
      isApproved: true,
      isActive: true,
      approvalDate: new Date(),
    },
  });

  console.log('✅ Sample church finder created:', churchFinderUser.email);

  // Create sample churches
  const church1 = await prisma.church.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Grace Community Church',
      denomination: 'Non-denominational',
      address: '123 Main Street',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      phone: '(555) 123-4567',
      email: 'info@gracecommunity.org',
      website: 'https://gracecommunity.org',
      pastorName: 'Pastor John Smith',
      serviceTimes: ['Sunday 9:00 AM', 'Sunday 11:00 AM', 'Wednesday 7:00 PM'],
      description: 'A welcoming community focused on grace, growth, and service.',
      specialties: ['young_families', 'recovery_ministry', 'community_outreach'],
      sizeCategory: 'medium',
      isVetted: true,
      vettedBy: churchFinderUser.id,
      vettedDate: new Date(),
    },
  });

  const church2 = await prisma.church.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Hope Baptist Church',
      denomination: 'Baptist',
      address: '456 Oak Avenue',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      phone: '(555) 987-6543',
      email: 'contact@hopebaptist.org',
      website: 'https://hopebaptist.org',
      pastorName: 'Pastor Mary Johnson',
      serviceTimes: ['Sunday 10:30 AM', 'Sunday 6:00 PM', 'Wednesday 7:30 PM'],
      description: 'Traditional Baptist church with strong community ties and family focus.',
      specialties: ['traditional_worship', 'family_ministry', 'bible_study'],
      sizeCategory: 'small',
      isVetted: true,
      vettedBy: churchFinderUser.id,
      vettedDate: new Date(),
    },
  });

  console.log('✅ Sample churches created');

  // Create sample Bible verses (for wizard functionality)
  const sampleVerses = [
    { book: 1, chapter: 1, verse: 1, text: 'In the beginning God created the heaven and the earth.' },
    { book: 19, chapter: 23, verse: 1, text: 'The LORD is my shepherd; I shall not want.' },
    { book: 40, chapter: 11, verse: 28, text: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.' },
    { book: 45, chapter: 8, verse: 28, text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.' },
    { book: 49, chapter: 2, verse: 8, text: 'For by grace are ye saved through faith; and that not of yourselves: it is the gift of God:' },
  ];

  for (const verse of sampleVerses) {
    await prisma.bibleVerse.upsert({
      where: {
        id: verse.book * 1000000 + verse.chapter * 1000 + verse.verse,
      },
      update: {},
      create: verse,
    });
  }

  console.log('✅ Sample Bible verses created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


