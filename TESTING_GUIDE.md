# 🧪 Complete Testing Guide

## 🚀 **QUICK START - Test Wizard First**

### **1. Set Up OpenAI API Key:**
```cmd
# Edit backend\.env file
OPENAI_API_KEY="sk-your-openai-key-here"
```

### **2. Restart Services:**
```cmd
docker-compose restart
```

### **3. Test Wizard:**
- Go to: http://localhost:3000/wizard
- Fill out the form
- Click "Generate My 50 Selections & Prayer"
- **Expected:** AI-generated personalized Scripture and prayer

---

## 🎯 **COMPLETE TESTING SEQUENCE**

### **PHASE 1: Basic Functionality (No API Keys Required)**

#### **1. Home Page**
- **URL:** http://localhost:3000
- **Test:** Navigation, buttons, responsive design
- **Expected:** Professional-looking landing page

#### **2. Registration**
- **URL:** http://localhost:3000/register
- **Test:** Create accounts for each role
- **Expected:** Successful registration

#### **3. Login**
- **URL:** http://localhost:3000/login
- **Test:** Login with created accounts
- **Expected:** Successful login and redirect

---

### **PHASE 2: Wizard Testing (Requires OpenAI API Key)**

#### **4. AI Wizard**
- **URL:** http://localhost:3000/wizard
- **API Required:** OpenAI API Key
- **Test:** Complete wizard form
- **Expected:** Personalized Scripture, prayer, and verses

---

### **PHASE 3: User Role Testing**

#### **5. Seeker Dashboard**
- **URL:** http://localhost:3000/seeker
- **Test:** 
  - View mentor recommendations
  - Request mentor relationships
  - Browse group sessions
- **Expected:** Seeker-specific features

#### **6. Mentor Dashboard**
- **URL:** http://localhost:3000/mentor
- **Test:**
  - Complete mentor profile
  - Set availability schedule
  - Create group sessions
  - Manage mentees
- **Expected:** Mentor-specific features

#### **7. Church Finder Dashboard**
- **URL:** http://localhost:3000/church-finder
- **Test:**
  - Add churches
  - Connect seekers to churches
  - Manage connections
- **Expected:** Church finder features

#### **8. Admin Dashboard**
- **URL:** http://localhost:3000/admin
- **Login:** admin@evangelismapp.com / admin123
- **Test:**
  - View system statistics
  - Approve pending users
  - Send invitations
- **Expected:** Admin management features

---

### **PHASE 4: Advanced Features**

#### **9. Email Invitations (Requires SMTP)**
- **API Required:** Gmail SMTP credentials
- **Test:** Send invitation from admin dashboard
- **Expected:** Email sent successfully

#### **10. Video Calls (Requires Zoom API)**
- **API Required:** Zoom API credentials
- **Test:** Create video session
- **Expected:** Zoom meeting created

---

## 📊 **Database Tables & Import**

### **All Tables:**
```
users                    - User accounts
seeker_profiles         - Seeker details
mentor_profiles         - Mentor details
churches                - Church database
bible_verses_web        - Bible verses
mentor_relationships    - Seeker-mentor connections
church_connections      - Seeker-church connections
sessions                - 1-on-1 sessions
group_sessions          - Group sessions
session_participants    - Session attendees
group_participants      - Group attendees
messages                - Chat messages
notifications           - System alerts
mini_bible_wizard_data  - Wizard results
seeker_ai_responses     - AI responses
matching_scores         - Compatibility scores
user_invitations        - Invitation system
journey_tracking        - User progress
mentor_availability      - Mentor schedules
```

### **Import Bible Verses:**

#### **Option 1: SQL File Import**
```cmd
# Place your SQL file at: backend/bible-verses.sql
# Then run:
docker-compose exec backend npx tsx src/scripts/import-sql.ts
```

#### **Option 2: Sample Data Import**
```cmd
# Import sample Bible verses
docker-compose exec backend npx tsx src/scripts/import-bible-verses.ts

# Import sample churches
docker-compose exec backend npx tsx src/scripts/import-churches.ts

# Import sample users
docker-compose exec backend npx tsx src/scripts/import-users.ts
```

---

## 🔧 **API Keys Setup**

### **Required for Full Testing:**

#### **1. OpenAI API Key (Wizard)**
- **Where:** https://platform.openai.com/api-keys
- **Cost:** ~$0.01-0.10 per session
- **Add to:** `backend\.env` → `OPENAI_API_KEY="sk-..."`

#### **2. Gmail SMTP (Email Invitations)**
- **Setup:** Enable 2FA → Create App Password
- **Add to:** `backend\.env` → `SMTP_USER="your@gmail.com"` & `SMTP_PASS="app-password"`

#### **3. Zoom API (Video Calls)**
- **Where:** https://marketplace.zoom.us/
- **Add to:** `backend\.env` → `ZOOM_API_KEY="..."` & `ZOOM_API_SECRET="..."`

#### **4. JWT Secret (Authentication)**
- **Generate:** Random 32+ character string
- **Add to:** `backend\.env` → `JWT_SECRET="your-secret"`

---

## 🎯 **Testing Checklist**

### **Basic Features (No API Keys):**
- [ ] Home page loads and looks professional
- [ ] Registration works for all roles
- [ ] Login works with created accounts
- [ ] Navigation between pages works
- [ ] Responsive design works on mobile

### **Wizard Features (Needs OpenAI):**
- [ ] Wizard form loads
- [ ] Form submission works
- [ ] AI generates personalized content
- [ ] Results display properly
- [ ] Save functionality works

### **User Dashboards:**
- [ ] Seeker dashboard shows mentor recommendations
- [ ] Mentor dashboard allows profile setup
- [ ] Church finder dashboard allows church management
- [ ] Admin dashboard shows system stats

### **Advanced Features (Needs Additional APIs):**
- [ ] Email invitations work (needs SMTP)
- [ ] Video calls work (needs Zoom)
- [ ] Real-time messaging works
- [ ] File uploads work

---

## 🚨 **Troubleshooting**

### **If Wizard Doesn't Work:**
1. Check OpenAI API key in `backend\.env`
2. Restart services: `docker-compose restart`
3. Check logs: `docker-compose logs backend`

### **If Registration Fails:**
1. Check JWT secret in `backend\.env`
2. Restart services: `docker-compose restart`

### **If Styling Looks Off:**
1. Hard refresh browser (Ctrl+F5)
2. Check if Tailwind CSS is loading
3. Rebuild frontend: `docker-compose up -d --build frontend`

### **If Database Errors:**
1. Check database connection
2. Run migrations: `docker-compose exec backend npx prisma db push`
3. Check logs: `docker-compose logs backend`

---

## 🎉 **Success Indicators**

### **You'll know it's working when:**
- ✅ Home page looks professional and modern
- ✅ Wizard generates personalized Scripture and prayer
- ✅ User registration and login work smoothly
- ✅ Dashboards show role-specific content
- ✅ Navigation is smooth and responsive
- ✅ All buttons and forms work properly

---

## 📞 **Next Steps After Testing**

1. **Import your Bible data** using the SQL import script
2. **Set up production environment** with real API keys
3. **Customize the design** to match your brand
4. **Add your church data** using the import scripts
5. **Train your team** on the admin features
6. **Launch to your community**! 🚀
