# 📊 Data Import Guide

This guide shows you how to import your own data into the evangelism platform.

## 🗄️ Database Tables Overview

### Core Tables
- **`users`** - User accounts (seekers, mentors, church finders, admins)
- **`seeker_profiles`** - Detailed seeker information
- **`mentor_profiles`** - Detailed mentor information
- **`churches`** - Church database
- **`bible_verses_web`** - Bible verse database

### Relationship Tables
- **`mentor_relationships`** - Seeker-mentor connections
- **`church_connections`** - Seeker-church connections
- **`sessions`** - 1-on-1 sessions
- **`group_sessions`** - Group session templates
- **`messages`** - Chat messages

## 📥 Import Scripts

### 1. Import Churches

**File**: `backend/src/scripts/import-churches.ts`

**Data Format**:
```typescript
interface ChurchData {
  name: string;                    // Required
  denomination?: string;           // Optional
  address?: string;                // Optional
  city?: string;                   // Optional
  state?: string;                  // Optional
  zipCode?: string;                // Optional
  phone?: string;                  // Optional
  email?: string;                  // Optional
  website?: string;                // Optional
  pastorName?: string;             // Optional
  serviceTimes?: any;              // Optional - JSON object
  description?: string;            // Optional
  specialties?: string[];          // Optional - Array of strings
  sizeCategory?: string;           // Optional - "small", "medium", "large"
}
```

**Example Data**:
```typescript
const churchesData: ChurchData[] = [
  {
    name: "Grace Community Church",
    denomination: "Baptist",
    address: "123 Main St",
    city: "Anytown",
    state: "CA",
    zipCode: "90210",
    phone: "(555) 123-4567",
    email: "info@gracecommunity.org",
    website: "https://gracecommunity.org",
    pastorName: "Pastor John Smith",
    serviceTimes: {
      sunday: ["9:00 AM", "11:00 AM"],
      wednesday: ["7:00 PM"]
    },
    description: "A welcoming community focused on biblical teaching and fellowship.",
    specialties: ["Youth Ministry", "Small Groups", "Community Outreach"],
    sizeCategory: "large"
  }
];
```

**Run Import**:
```bash
docker-compose exec backend npx tsx src/scripts/import-churches.ts
```

### 2. Import Bible Verses

**File**: `backend/src/scripts/import-bible-verses.ts`

**Data Format**:
```typescript
interface BibleVerseData {
  book: number;        // Book number (1=Genesis, 43=John, etc.)
  chapter: number;     // Chapter number
  verse: number;       // Verse number
  text: string;        // Verse text
}
```

**Book Numbers**:
- 1-39: Old Testament (Genesis=1, Exodus=2, etc.)
- 40-66: New Testament (Matthew=40, Mark=41, Luke=42, John=43, etc.)

**Example Data**:
```typescript
const versesData: BibleVerseData[] = [
  {
    book: 43, // John
    chapter: 3,
    verse: 16,
    text: "For God so loved the world, that He gave His only begotten Son, that whoever believes in Him shall not perish, but have eternal life."
  }
];
```

**Run Import**:
```bash
docker-compose exec backend npx tsx src/scripts/import-bible-verses.ts
```

### 3. Import Users

**File**: `backend/src/scripts/import-users.ts`

**Data Format**:
```typescript
interface UserData {
  username: string;     // Required - unique username
  email: string;        // Required - unique email
  password: string;     // Required - will be hashed
  userRole: 'SEEKER' | 'DISCIPLE_MAKER' | 'CHURCH_FINDER' | 'ADMIN';
  location?: string;    // Optional
  ageRange?: string;    // Optional - "18-25", "26-35", etc.
  gender?: string;      // Optional - "male", "female", "other"
  struggles?: string[]; // Optional - Array of struggle types
  isApproved?: boolean; // Optional - default false
}
```

**Example Data**:
```typescript
const usersData: UserData[] = [
  {
    username: "john_mentor",
    email: "john@example.com",
    password: "password123",
    userRole: "DISCIPLE_MAKER",
    location: "Los Angeles, CA",
    ageRange: "35-45",
    gender: "male",
    struggles: ["addiction", "depression"],
    isApproved: true
  }
];
```

**Run Import**:
```bash
docker-compose exec backend npx tsx src/scripts/import-users.ts
```

## 🔧 Custom Import Scripts

### Creating Your Own Import Script

1. **Create new script file**:
```bash
# Create new import script
touch backend/src/scripts/import-your-data.ts
```

2. **Template for import script**:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function importYourData() {
  try {
    console.log('🔄 Starting your data import...');
    
    // Your data array
    const yourData = [
      // Your data objects here
    ];

    // Import loop
    for (const item of yourData) {
      const result = await prisma.yourTable.create({
        data: item
      });
      console.log(`✅ Imported: ${result.id}`);
    }

    console.log(`🎉 Successfully imported ${yourData.length} items!`);
    
  } catch (error) {
    console.error('❌ Error importing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importYourData();
```

3. **Run your custom script**:
```bash
docker-compose exec backend npx tsx src/scripts/import-your-data.ts
```

## 📋 CSV Import Example

### Importing from CSV Files

If you have data in CSV format, you can convert it to the import scripts:

**CSV Format**:
```csv
name,denomination,city,state,phone,email
Grace Community Church,Baptist,Anytown,CA,(555) 123-4567,info@gracecommunity.org
Hope Fellowship,Methodist,Springfield,IL,(555) 987-6543,contact@hopefellowship.org
```

**Convert to TypeScript**:
```typescript
const churchesData: ChurchData[] = [
  {
    name: "Grace Community Church",
    denomination: "Baptist",
    city: "Anytown",
    state: "CA",
    phone: "(555) 123-4567",
    email: "info@gracecommunity.org"
  },
  {
    name: "Hope Fellowship",
    denomination: "Methodist",
    city: "Springfield",
    state: "IL",
    phone: "(555) 987-6543",
    email: "contact@hopefellowship.org"
  }
];
```

## 🚀 Bulk Import Commands

### Import All Sample Data
```bash
# Import churches
docker-compose exec backend npx tsx src/scripts/import-churches.ts

# Import Bible verses
docker-compose exec backend npx tsx src/scripts/import-bible-verses.ts

# Import users
docker-compose exec backend npx tsx src/scripts/import-users.ts
```

### Import Specific Data
```bash
# Import only churches
docker-compose exec backend npx tsx src/scripts/import-churches.ts

# Import only Bible verses
docker-compose exec backend npx tsx src/scripts/import-bible-verses.ts
```

## 🔍 Verify Import

### Check Imported Data
```bash
# Check churches
docker-compose exec backend npx prisma studio

# Or use SQL queries
docker-compose exec backend npx prisma db execute --stdin
```

**SQL Queries**:
```sql
-- Count churches
SELECT COUNT(*) FROM churches;

-- Count Bible verses
SELECT COUNT(*) FROM bible_verses_web;

-- Count users
SELECT COUNT(*) FROM users;

-- View sample data
SELECT * FROM churches LIMIT 5;
SELECT * FROM bible_verses_web LIMIT 5;
SELECT * FROM users LIMIT 5;
```

## ⚠️ Important Notes

1. **Backup First**: Always backup your database before importing large amounts of data
2. **Unique Constraints**: Make sure usernames and emails are unique
3. **Data Validation**: Validate your data format before importing
4. **Test Import**: Test with small datasets first
5. **Error Handling**: Check for import errors and fix data issues

## 🆘 Troubleshooting

### Common Issues

1. **Duplicate Data**: Check for unique constraint violations
2. **Invalid Format**: Verify data types match schema requirements
3. **Missing Required Fields**: Ensure all required fields are provided
4. **Database Connection**: Make sure database is running and accessible

### Debug Commands
```bash
# Check database connection
docker-compose exec backend npx prisma db push

# View database schema
docker-compose exec backend npx prisma studio

# Check logs
docker-compose logs backend
```

## 📞 Support

If you need help with data import:
1. Check the error messages in the console
2. Verify your data format matches the interface requirements
3. Check the database schema in `backend/prisma/schema.prisma`
4. Review the sample data in the import scripts
