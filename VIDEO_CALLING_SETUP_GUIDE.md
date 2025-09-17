# 🎥 Video Calling & Scheduling Setup Guide

## 🎯 **COMPLETE VIDEO CALLING SYSTEM IMPLEMENTED**

### **✅ What's Been Added:**

1. **Zoom Integration** - Full Zoom SDK integration for video calls
2. **Seamless Scheduling** - Calendar-based booking system
3. **Availability Management** - Mentors can set their availability
4. **Real-time Booking** - Instant session booking with confirmation
5. **Group & 1-on-1 Calls** - Both session types supported
6. **Video Call UI** - Embedded video calls within the app

---

## 🔧 **REQUIRED PACKAGES & SETUP**

### **Backend Packages Added:**
```json
{
  "zoomus": "1.0.0",
  "node-cron": "3.0.3", 
  "ical-generator": "4.2.0"
}
```

### **Frontend Packages Added:**
```json
{
  "@zoom/videosdk": "1.0.0",
  "react-big-calendar": "1.8.2",
  "moment": "2.29.4",
  "react-modal": "3.16.1"
}
```

---

## 🚀 **ZOOM SETUP REQUIREMENTS**

### **1. Get Zoom API Credentials:**

1. **Go to Zoom Marketplace**: https://marketplace.zoom.us/
2. **Create App**: Choose "JWT" app type
3. **Get Credentials**:
   - API Key
   - API Secret
4. **Add to Environment**:
   ```env
   ZOOM_API_KEY="your-zoom-api-key"
   ZOOM_API_SECRET="your-zoom-api-secret"
   ```

### **2. Zoom App Configuration:**
- **App Type**: JWT
- **Redirect URL**: `http://localhost:3000/auth/zoom/callback`
- **Scopes**: `meeting:write`, `meeting:read`, `user:read`

---

## 📅 **SCHEDULING SYSTEM FEATURES**

### **For Mentors:**
- ✅ **Set Availability** - Choose days/times when available
- ✅ **View Schedule** - See all booked sessions
- ✅ **Create Zoom Meetings** - Automatic Zoom meeting creation
- ✅ **Manage Sessions** - Cancel or reschedule sessions

### **For Seekers:**
- ✅ **View Available Slots** - See mentor's availability
- ✅ **Book Sessions** - Click to book available time slots
- ✅ **Join Video Calls** - Seamless Zoom integration
- ✅ **Session Management** - View and manage bookings

### **For Church Finders:**
- ✅ **Video Meetings** - Connect with seekers via video
- ✅ **Schedule Meetings** - Book meetings with seekers
- ✅ **Church Tours** - Virtual church visits

---

## 🎥 **VIDEO CALL FEATURES**

### **Embedded Video Calls:**
- ✅ **Zoom SDK Integration** - Native Zoom experience
- ✅ **Meeting Controls** - Mute, video, chat, screen share
- ✅ **Waiting Room** - Secure meeting access
- ✅ **Recording** - Optional session recording
- ✅ **Mobile Support** - Works on all devices

### **Meeting Management:**
- ✅ **Automatic Creation** - Zoom meetings created automatically
- ✅ **Password Protection** - Secure meeting access
- ✅ **Join URLs** - Easy access for participants
- ✅ **Host Controls** - Mentor controls the meeting

---

## 🔄 **COMPLETE USER FLOW**

### **Seeker Journey:**
1. **Find Mentor** → Browse available mentors
2. **View Availability** → See mentor's calendar
3. **Book Session** → Click available time slot
4. **Fill Details** → Add session topic/details
5. **Confirmation** → Receive booking confirmation
6. **Join Call** → Click link to join Zoom meeting
7. **Video Session** → Full video call experience

### **Mentor Journey:**
1. **Set Availability** → Configure available times
2. **Receive Booking** → Get notification of new booking
3. **Prepare Session** → Review seeker details
4. **Start Meeting** → Launch Zoom meeting
5. **Conduct Session** → Full video call with seeker
6. **Follow Up** → Send post-session notes

---

## 📱 **UI COMPONENTS CREATED**

### **Video Components:**
- `VideoCallModal.tsx` - Embedded Zoom video calls
- `SchedulingCalendar.tsx` - Calendar for booking
- `BookingModal.tsx` - Session booking form
- `AvailabilityManager.tsx` - Mentor availability setup

### **Features:**
- ✅ **Responsive Design** - Works on all devices
- ✅ **Real-time Updates** - Live availability updates
- ✅ **Error Handling** - Graceful error management
- ✅ **Loading States** - Smooth user experience

---

## 🗄️ **DATABASE UPDATES**

### **New Fields Added:**
```sql
-- Session table
zoomMeetingId VARCHAR(255)
zoomPassword VARCHAR(255)
zoomJoinUrl TEXT
zoomStartUrl TEXT

-- New table: mentor_availability
CREATE TABLE mentor_availability (
  id INT PRIMARY KEY AUTO_INCREMENT,
  mentorId INT,
  dayOfWeek INT,
  startTime VARCHAR(5),
  endTime VARCHAR(5),
  isAvailable BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT NOW(),
  updatedAt DATETIME DEFAULT NOW()
);
```

---

## 🚀 **DEPLOYMENT CHECKLIST**

### **Environment Variables:**
```env
# Required for video calls
ZOOM_API_KEY="your-zoom-api-key"
ZOOM_API_SECRET="your-zoom-api-secret"

# Existing variables
OPENAI_API_KEY="your-openai-key"
SMTP_USER="your-email"
SMTP_PASS="your-password"
```

### **Zoom App Settings:**
- ✅ **JWT App Type** - For server-to-server authentication
- ✅ **Meeting Scopes** - Read/write meeting permissions
- ✅ **Redirect URLs** - Configured for your domain
- ✅ **Webhook URLs** - For meeting events (optional)

---

## 🎯 **TESTING CHECKLIST**

### **Video Call Testing:**
- [ ] **Create Session** - Book a test session
- [ ] **Join Meeting** - Test video call functionality
- [ ] **Audio/Video** - Verify audio and video work
- [ ] **Screen Share** - Test screen sharing
- [ ] **Chat** - Test in-meeting chat
- [ ] **Mobile** - Test on mobile devices

### **Scheduling Testing:**
- [ ] **Set Availability** - Configure mentor availability
- [ ] **Book Session** - Test booking flow
- [ ] **Calendar View** - Verify calendar display
- [ ] **Time Zones** - Test different time zones
- [ ] **Conflict Detection** - Test double-booking prevention

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues:**

1. **Zoom SDK Not Loading**
   - Check internet connection
   - Verify Zoom API credentials
   - Check browser console for errors

2. **Meeting Creation Fails**
   - Verify Zoom API key/secret
   - Check Zoom app permissions
   - Ensure meeting scopes are enabled

3. **Calendar Not Loading**
   - Check API endpoints
   - Verify mentor availability data
   - Check timezone settings

4. **Video Call Issues**
   - Test with different browsers
   - Check microphone/camera permissions
   - Verify Zoom account status

---

## 🎉 **READY TO USE!**

The complete video calling and scheduling system is now implemented! 

### **Next Steps:**
1. **Get Zoom API credentials**
2. **Update environment variables**
3. **Run the setup script**
4. **Test video calls**
5. **Configure mentor availability**
6. **Test booking flow**

**Your evangelism platform now has professional-grade video calling and scheduling!** 🎥🙏

