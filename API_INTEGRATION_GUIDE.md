# 🔌 API Integration Guide - Evangelism App

## 📋 Required APIs & Services

### 1. 🤖 OpenAI API (REQUIRED)
**Purpose**: AI-powered content generation for the wizard
**Cost**: ~$0.01-0.05 per wizard completion

#### Setup:
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create account and add payment method
3. Generate API key
4. Add to `backend/.env`:
   ```env
   OPENAI_API_KEY="sk-proj-your-key-here"
   ```

#### Usage:
- **Scripture Selection**: 50 personalized KJV references
- **Prayer Generation**: 500+ word custom prayers
- **Verse Commentary**: MacArthur-style annotations
- **Mentor Matching**: AI-powered compatibility scoring

---

### 2. 📧 Email Service (REQUIRED)
**Purpose**: User notifications, invitations, password resets

#### Option A: Gmail (Free)
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"  # Use App Password, not regular password
```

**Setup Gmail App Password:**
1. Enable 2-Factor Authentication
2. Go to Google Account → Security → App passwords
3. Generate password for "Mail"

#### Option B: SendGrid (Recommended for Production)
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
```

**Setup SendGrid:**
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Verify sender identity
3. Create API key
4. Add to environment variables

#### Option C: AWS SES
```env
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT=587
SMTP_USER="your-ses-access-key"
SMTP_PASS="your-ses-secret-key"
```

---

### 3. 🎥 Video Meeting Integration (OPTIONAL)
**Purpose**: Built-in video calling for mentoring sessions

#### Option A: Zoom (Recommended)
```env
VIDEO_PLATFORM="zoom"
ZOOM_API_KEY="your-zoom-api-key"
ZOOM_API_SECRET="your-zoom-api-secret"
ZOOM_WEBHOOK_SECRET="your-webhook-secret"
```

**Setup Zoom:**
1. Create Zoom Marketplace app
2. Enable "Server-to-Server OAuth"
3. Get API key and secret
4. Configure webhook endpoints

#### Option B: Google Meet
```env
VIDEO_PLATFORM="google_meet"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

#### Option C: Jitsi (Free)
```env
VIDEO_PLATFORM="jitsi"
JITSI_DOMAIN="meet.jit.si"  # or your custom domain
```

#### Option D: Daily.co
```env
VIDEO_PLATFORM="daily_co"
DAILY_API_KEY="your-daily-api-key"
DAILY_DOMAIN="your-daily-domain"
```

---

### 4. 💳 Payment Processing (FUTURE)
**Purpose**: Premium features, donations, mentor payments

#### Stripe Integration
```env
STRIPE_PUBLISHABLE_KEY="pk_live_your-key"
STRIPE_SECRET_KEY="sk_live_your-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"
```

---

### 5. 📱 Push Notifications (FUTURE)
**Purpose**: Real-time mobile notifications

#### Firebase Cloud Messaging
```env
FCM_SERVER_KEY="your-fcm-server-key"
FCM_SENDER_ID="your-sender-id"
```

---

## 🔧 API Configuration

### Backend Environment Variables
Create `backend/.env` with all required APIs:

```env
# Database
DATABASE_URL="mysql://user:pass@localhost:3306/evangelism_app"

# Security
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# OpenAI (REQUIRED)
OPENAI_API_KEY="sk-proj-your-openai-key"

# Email (REQUIRED)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Video Integration (OPTIONAL)
VIDEO_PLATFORM="zoom"  # or google_meet, jitsi, daily_co
ZOOM_API_KEY="your-zoom-key"
ZOOM_API_SECRET="your-zoom-secret"

# Payment (FUTURE)
STRIPE_PUBLISHABLE_KEY="pk_test_your-key"
STRIPE_SECRET_KEY="sk_test_your-key"

# Push Notifications (FUTURE)
FCM_SERVER_KEY="your-fcm-key"
```

### Frontend Environment Variables
Create `frontend/.env.local`:

```env
# API Endpoints
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="ws://localhost:3001"

# Payment (FUTURE)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-key"
```

---

## 🚀 Quick Start APIs

### Minimum Required for Testing
1. **OpenAI API** - For wizard functionality
2. **Gmail SMTP** - For email notifications

### Production Ready
1. **OpenAI API** - AI content generation
2. **SendGrid** - Professional email delivery
3. **Zoom API** - Video meetings
4. **Stripe** - Payment processing (future)

---

## 📊 API Usage & Costs

### OpenAI API Costs
- **GPT-4**: ~$0.03 per 1K tokens
- **Wizard completion**: ~$0.01-0.05 per user
- **Monthly estimate**: $10-50 for 1000 users

### Email Service Costs
- **Gmail**: Free (limited to 500/day)
- **SendGrid**: Free tier (100 emails/day), then $15/month
- **AWS SES**: $0.10 per 1000 emails

### Video Service Costs
- **Zoom**: Free tier (40 min meetings), then $15/month
- **Google Meet**: Free (60 min meetings)
- **Jitsi**: Free (self-hosted)
- **Daily.co**: Free tier (2 hours/day), then $0.0025/min

---

## 🔐 API Security Best Practices

### 1. Environment Variables
- Never commit API keys to git
- Use `.env` files (included in `.gitignore`)
- Rotate keys regularly
- Use different keys for dev/staging/production

### 2. API Key Management
```bash
# Example secure key storage
echo "OPENAI_API_KEY=sk-proj-..." >> backend/.env
chmod 600 backend/.env  # Restrict file permissions
```

### 3. Rate Limiting
- Implement rate limiting on API endpoints
- Monitor API usage and costs
- Set up alerts for unusual usage

### 4. Error Handling
- Graceful degradation when APIs are down
- Fallback content for AI failures
- User-friendly error messages

---

## 🧪 Testing APIs

### Test OpenAI Integration
```bash
# Test from backend directory
cd backend
npm run test:openai
```

### Test Email Integration
```bash
# Test email sending
npm run test:email
```

### Test Video Integration
```bash
# Test video meeting creation
npm run test:video
```

---

## 📈 Monitoring & Analytics

### API Usage Monitoring
- Track OpenAI token usage
- Monitor email delivery rates
- Video meeting success rates
- Error rates and response times

### Cost Monitoring
- Set up billing alerts
- Track monthly API costs
- Optimize usage patterns

---

## 🆘 Troubleshooting

### Common Issues

#### OpenAI API Errors
```bash
# Check API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models

# Check quota
# Go to OpenAI dashboard → Usage
```

#### Email Delivery Issues
```bash
# Test SMTP connection
telnet smtp.gmail.com 587

# Check email logs
docker-compose logs backend | grep -i email
```

#### Video Integration Issues
```bash
# Test Zoom API
curl -X GET "https://api.zoom.us/v2/users/me" \
  -H "Authorization: Bearer $ZOOM_ACCESS_TOKEN"
```

---

## 🎯 Recommended API Stack

### For Development
- ✅ OpenAI API (GPT-4)
- ✅ Gmail SMTP
- ✅ Jitsi (free video)

### For Production
- ✅ OpenAI API (GPT-4)
- ✅ SendGrid (email)
- ✅ Zoom API (video)
- ✅ Stripe (payments)
- ✅ CloudFlare (CDN)

### For Enterprise
- ✅ OpenAI API (GPT-4)
- ✅ AWS SES (email)
- ✅ Zoom API (video)
- ✅ Stripe (payments)
- ✅ AWS CloudFront (CDN)
- ✅ Sentry (error tracking)

---

**Your APIs are now configured and ready!** 🚀

For step-by-step setup instructions, see [WINDOWS_SETUP_GUIDE.md](WINDOWS_SETUP_GUIDE.md)



