# 🔑 API Setup Guide

## 📝 **STEP 1: Create Environment File**

1. **Copy the example file:**
   ```cmd
   copy backend\env.example backend\.env
   ```

2. **Edit `backend\.env` with your API keys:**

## 🤖 **STEP 2: OpenAI API Key (REQUIRED FOR WIZARD)**

### **Get OpenAI API Key:**
1. Go to: https://platform.openai.com/api-keys
2. Sign up/Login to OpenAI
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

### **Add to `backend\.env`:**
```env
OPENAI_API_KEY="sk-your-actual-openai-key-here"
```

**Cost:** ~$0.01-0.10 per wizard session

---

## 📧 **STEP 3: Gmail SMTP (REQUIRED FOR INVITATIONS)**

### **Setup Gmail App Password:**
1. Enable 2FA on your Gmail account
2. Go to: https://myaccount.google.com/apppasswords
3. Select "Mail" and generate password
4. Copy the 16-character password

### **Add to `backend\.env`:**
```env
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-16-character-app-password"
```

---

## 🎥 **STEP 4: Zoom API (REQUIRED FOR VIDEO CALLS)**

### **Get Zoom API Credentials:**
1. Go to: https://marketplace.zoom.us/
2. Sign up/Login to Zoom
3. Click "Develop" → "Build App"
4. Choose "JWT" app type
5. Get API Key and Secret

### **Add to `backend\.env`:**
```env
ZOOM_API_KEY="your-zoom-api-key"
ZOOM_API_SECRET="your-zoom-api-secret"
```

---

## 🔐 **STEP 5: JWT Secret (REQUIRED FOR AUTHENTICATION)**

### **Generate JWT Secret:**
Use any random 32+ character string:

### **Add to `backend\.env`:**
```env
JWT_SECRET="evangelism-app-super-secret-jwt-key-2024"
```

---

## 🚀 **STEP 6: Restart Services**

After updating the `.env` file:
```cmd
docker-compose restart
```

---

## 🧪 **STEP 7: Test Each Feature**

### **Test Order:**
1. **Wizard** (needs OpenAI)
2. **User Registration** (needs JWT)
3. **Email Invitations** (needs SMTP)
4. **Video Calls** (needs Zoom)

---

## 📊 **Database Tables Overview**

### **Core Tables:**
- `users` - User accounts
- `seeker_profiles` - Seeker details
- `mentor_profiles` - Mentor details
- `churches` - Church database
- `bible_verses_web` - Bible verses

### **Relationship Tables:**
- `mentor_relationships` - Seeker-mentor connections
- `church_connections` - Seeker-church connections
- `sessions` - 1-on-1 sessions
- `group_sessions` - Group sessions
- `messages` - Chat messages
- `notifications` - System alerts

### **AI & Wizard Tables:**
- `mini_bible_wizard_data` - Wizard results
- `seeker_ai_responses` - AI responses
- `matching_scores` - Compatibility scores

### **System Tables:**
- `user_invitations` - Invitation system
- `journey_tracking` - User progress
- `mentor_availability` - Mentor schedules

---

## 📥 **Data Import Commands**

### **Import Your Bible CSV File:**
```cmd
# 1. Place your CSV file at: backend/bible-verses.csv
# 2. Run the import script:
docker-compose exec backend npx tsx src/scripts/import-csv-bible.ts

# OR use the batch file:
import-bible-data.bat
```

### **CSV Format Expected:**
```
Verse ID	Book Name	Book Number	Chapter	Verse	Text
1	Genesis	1	1	1	In the beginning God created the heavens and the earth.
2	Genesis	1	1	2	Now the earth was formless and empty...
```

### **Import Other Data:**
```cmd
# Import sample Bible verses (if you don't have your own)
docker-compose exec backend npx tsx src/scripts/import-bible-verses.ts

# Import sample churches
docker-compose exec backend npx tsx src/scripts/import-churches.ts

# Import sample users
docker-compose exec backend npx tsx src/scripts/import-users.ts
```

---

## 🎯 **Testing URLs by Role**

### **1. Seeker Journey:**
- **Home:** http://localhost:3000
- **Register:** http://localhost:3000/register (choose "Seeker")
- **Login:** http://localhost:3000/login
- **Wizard:** http://localhost:3000/wizard (needs OpenAI)
- **Dashboard:** http://localhost:3000/seeker

### **2. Mentor Journey:**
- **Register:** http://localhost:3000/register (choose "Mentor")
- **Login:** http://localhost:3000/login
- **Dashboard:** http://localhost:3000/mentor
- **Profile Setup:** Complete mentor profile
- **Create Group Session:** Test group session creation

### **3. Church Finder Journey:**
- **Register:** http://localhost:3000/register (choose "Church Finder")
- **Login:** http://localhost:3000/login
- **Dashboard:** http://localhost:3000/church-finder
- **Add Churches:** Test church creation
- **Connect Seekers:** Test seeker connections

### **4. Admin Journey:**
- **Login:** http://localhost:3000/login (admin@evangelismapp.com / admin123)
- **Dashboard:** http://localhost:3000/admin
- **User Management:** Approve users
- **Send Invitations:** Test email invitations (needs SMTP)

---

## 🔧 **Troubleshooting**

### **If Wizard Doesn't Work:**
- Check OpenAI API key in `backend\.env`
- Restart services: `docker-compose restart`
- Check logs: `docker-compose logs backend`

### **If Registration Fails:**
- Check JWT secret in `backend\.env`
- Restart services: `docker-compose restart`

### **If Email Invitations Fail:**
- Check SMTP credentials in `backend\.env`
- Verify Gmail app password
- Restart services: `docker-compose restart`

### **If Video Calls Don't Work:**
- Check Zoom API credentials in `backend\.env`
- Restart services: `docker-compose restart`

---

## 📞 **Support**

If you need help:
1. Check the logs: `docker-compose logs`
2. Verify API keys are correct
3. Restart services after changes
4. Check the documentation files
