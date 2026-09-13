# SMTP Custom Setup for Zenflix (Free & Recommended)

## 🏆 Recommended: Resend (Best for Devs)
- **Free tier**: 3,000 emails/month
- **API-first**, great for transactional emails
- **Supabase native support** (works out of the box)
- **Dashboard**: https://resend.com

### Setup Steps:

1. **Daftar di Resend**: https://resend.com/register
2. **Verify domain** (opsional, bisa pakai `onboarding@resend.dev` untuk testing)
3. **Buat API Key**: Dashboard → API Keys → Create
4. **Konfigurasi di Supabase**:
   - Settings → SMTP Settings
   - Host: `smtp.resend.com`
   - Port: `587`
   - Username: `resend`
   - Password: `[RESEND_API_KEY]`
   - Sender email: `noreply@yourdomain.com` (atau `onboarding@resend.dev` untuk testing)

---

## 🥈 Alternative: Brevo (ex-Sendinblue)
- **Free tier**: 300 emails/day (9,000/month)
- Dashboard: https://brevo.com
- SMTP: `smtp-relay.brevo.com:587`
- Username: your brevo login
- Password: SMTP key from Brevo dashboard

---

## 📧 Email Templates for Zenflix

All templates use **Zenflix branding**:
- **Primary color**: `#8B5CF6` (purple) - accent
- **Background**: Dark `#0F0F12` / Light `#FFFFFF`
- **Font**: System UI / Inter
- **Logo**: "ZENFLIX" gradient text

---

## 📁 Template Files Structure

```
supabase/
├── email-templates/
│   ├── confirm-signup.html       # Email verifikasi pendaftaran
│   ├── magic-link.html           # Magic link / OTP login
│   ├── change-email.html         # Konfirmasi ganti email
│   ├── reset-password.html       # Reset password
│   ├── reauthentication.html     # Reauth sebelum operasi sensitif
│   ├── password-changed.html     # Notifikasi password berubah
│   ├── email-changed.html        # Notifikasi email berubah
│   ├── phone-changed.html        # Notifikasi phone berubah
│   ├── signin-linked.html        # Sign-in method linked
│   ├── signin-removed.html       # Sign-in method removed
│   ├── mfa-added.html            # MFA ditambahkan
│   └── mfa-removed.html          # MFA dihapus
└── README.md
```

---

## ⚙️ Supabase Configuration Required

### 1. Email Templates (Authentication → Email Templates)
Paste each HTML file into corresponding template in Supabase Dashboard.

### 2. URL Configuration (Authentication → URL Configuration)
```
Site URL: https://zenflix-ten.vercel.app
Redirect URLs: 
  - https://zenflix-ten.vercel.app/**
  - http://localhost:3005/**
```

### 3. Providers (Authentication → Sign In / Providers)
Enable:
- ✅ Email (OTP + Magic Link)
- ✅ Google (add Client ID/Secret from Google Cloud Console)
- ✅ Apple (add Service ID/Key from Apple Developer)
- ✅ Phone (SMS OTP - requires Twilio/other provider)

### 4. SMTP Settings (Settings → SMTP Settings)
```
Host: smtp.resend.com
Port: 587
Username: resend
Password: re_xxxxxxxxxxxx (your Resend API key)
Sender: noreply@zenflix.app (or onboarding@resend.dev for testing)
```

---

## 🔑 Environment Variables to Add in Vercel

```env
# Resend SMTP
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@zenflix.app

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# Apple OAuth
APPLE_CLIENT_ID=com.zenflix.app
APPLE_TEAM_ID=XXX
APPLE_KEY_ID=XXX
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nXXX\n-----END PRIVATE KEY-----

# Twilio (for Phone/SMS)
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_VERIFY_SERVICE_SID=VAxxx
```

---

## 📱 Next Steps After Setup

1. Deploy email templates to Supabase
2. Configure SMTP in Supabase
3. Add OAuth providers (Google/Apple) in Supabase
4. Add Phone provider (Twilio) if needed
5. Test all email flows
6. Update frontend auth components to use new providers

---

*Generated for Zenflix project - https://zenflix-ten.vercel.app*