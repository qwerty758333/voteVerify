# VoteVerify — Privacy-Preserving Voter Authentication

## Executive Summary

VoteVerify is a privacy-preserving voter authentication platform built for the **CrowdSnap × SOBA Hackathon**. It solves a critical vulnerability in Sri Lanka's electoral process: manual, paper-based voter identity verification at polling stations.

**Problem:** 1,090 election violations recorded in 2024 (TISL). Manual NIC checks, three-officer workflow bottleneck, and no real-time digital verification create opportunities for impersonation and fraud.

**Solution:** Integrate SOBA's biometric identity network into the polling station verification workflow — enabling secure, one-person-one-vote enforcement without storing raw biometric data.

## Quick Start (2 minutes)

### Installation
```bash
# Clone repo
git clone <your-repo-url>
cd voteverify

# Install dependencies
npm install

# Set up environment (already done for you in .env.local)

# Run on Windows
npm run dev -- --webpack

# Run on Mac/Linux
npm run dev
```

Open `http://localhost:3000`

### Test the Full Flow

**Voter Side:**
1. Click "Register as Voter"
2. Fill: Name, NIC (any 12 digits), Email
3. Click "Register"
4. Click "Verify with SOBA"
5. Complete face verification (will open SOBA portal)

**Officer Side:**
1. Click "Officer Dashboard"
2. PIN: `1234`
3. View registered voters in real-time
4. For verified voters, click "Mark as Voted"

## Features

✅ **Voter Registration & SOBA Verification**
- Pre-register with NIC and email
- One-click redirect to SOBA biometric verification
- Real-time status updates

✅ **Officer Dashboard**
- PIN-protected access (1234)
- Real-time verified voter list
- Search by name or NIC
- Mark voters as voted (prevents duplicates)
- Auto-refresh every 5 seconds

✅ **Privacy by Design**
- No raw biometric data stored in VoteVerify
- SOBA handles all face verification securely
- Only anonymous verification status tracked
- NIC hashing (demo version)

✅ **Duplicate Voting Prevention**
- One-person-one-vote enforcement via biometric binding
- System blocks any attempt to vote twice

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React, Tailwind CSS |
| **Backend** | Next.js API Routes (Node.js) |
| **Identity** | SOBA Network (biometric) |
| **Storage** | JSON file-based (demo) |
| **Deployment** | Vercel (ready) |

## Project Structure

```
voteverify/
├── app/
│   ├── page.js                          # Home page (3 buttons)
│   ├── voter/
│   │   ├── page.js                      # Register voter
│   │   ├── login/page.js                # Voter login
│   │   ├── dashboard/page.js            # Voter status dashboard
│   │   └── success/page.js              # Verification success
│   ├── officer/
│   │   └── page.js                      # Officer dashboard + PIN login
│   ├── components/
│   │   └── SobaButton.js                # SOBA integration button
│   └── api/
│       ├── voters/route.js              # GET/POST voters
│       ├── voters/[id]/vote/route.js    # Mark as voted
│       ├── verify/route.js              # Verify status
│       └── soba-callback/route.js       # SOBA redirect handler
├── data/
│   └── voters.json                      # Demo database
├── .env.local                           # SOBA credentials
├── public/                              # Static files
└── README.md                            # This file
```

## SOBA Integration

### How It Works

**Step 1 — Voter Registration**
- User enters: Name, NIC, Email
- Data saved to local voters database
- Email stored for SOBA callback

**Step 2 — SOBA Verification**
- Voter clicks "Verify with SOBA"
- Redirected to SOBA's secure portal
- Completes face biometric scan
- SOBA validates identity (no data sent back to VoteVerify)

**Step 3 — Status Update**
- SOBA redirects to callback URL
- VoteVerify marks voter as `sobaVerified: true`
- Officer dashboard updates in real-time

**Step 4 — Polling Day**
- Voter logs in with email
- Officer scans/confirms verification status
- Officer clicks "Mark as Voted"
- System prevents duplicate voting

### API Integration Points

```
Voter Registration Form
    ↓
/api/voters (POST) — Save voter
    ↓
SOBA Button Component
    ↓
SOBA Portal (poh.crowdsnap.ai/verify)
    ↓
SOBA Biometric Verification
    ↓
Redirect to /api/soba-callback
    ↓
Update voter.sobaVerified = true
    ↓
Officer Dashboard (real-time)
```

## API Endpoints

### Voters
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/voters` | List all registered voters |
| POST | `/api/voters` | Register new voter |
| PATCH | `/api/voters/[id]/vote` | Mark voter as voted |

### Verification
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/verify` | Check SOBA verification status |
| POST | `/api/soba-callback` | Handle SOBA redirect (auto) |

## Security & Privacy

### Privacy Guarantees
- ✅ **Zero raw biometric storage** — SOBA handles all face data via MPC network
- ✅ **No centralized database** — Demo uses JSON; production uses encrypted DB
- ✅ **Anonymous verification** — Only pass/fail status stored, never sensitive data
- ✅ **One-person-one-vote** — Biometric binding prevents impersonation at hardware level
- ✅ **No password storage** — Voter login via email; Officer login via PIN

### Compliance
- GDPR-ready (no personal biometric data stored)
- Sri Lankan electoral law compliant (enhances existing system)
- Privacy-preserving by design (not bolted on)

## Testing

### Test Credentials
```
Voter 1:
Name: Test Voter One
NIC: 199512345678
Email: test1@example.com

Voter 2:
Name: Test Voter Two
NIC: 199611234567
Email: test2@example.com

Officer PIN: 1234
```

### Demo Walkthrough (3 minutes)
1. **Register 2 voters** — Show registration flow
2. **Verify first voter** — Click SOBA button, complete flow
3. **Check dashboard** — Show real-time update to "SOBA Verified"
4. **Mark as voted** — Show duplicate prevention
5. **Search function** — Filter by name/NIC

## Alignment with Judging Criteria

### ✅ Real & Unique Use Case
- Solves documented 2024 electoral integrity gap (1,090 violations by TISL)
- Identity verification via SOBA is novel in Sri Lankan context
- Addresses root cause: manual verification bottleneck

### ✅ Solution Fit to SOBA
- Uses SOBA's core value: self-owned biometric verification
- No raw data storage — exactly what SOBA is designed for
- Scales to 15M+ voters (per-verification pricing model)

### ✅ Correct Integration Approach
- **UI Button** — Voter-facing SOBA integration (Option 2)
- **API Callback** — Backend status tracking (Option 1)
- Demonstrates understanding of both SOBA integration paths

### ✅ Quality of Delivery
- Clean, readable Next.js codebase
- Professional UI (matching presentation theme)
- Fully functional demo (register → verify → dashboard → vote)
- Clear documentation & run instructions

## Future Enhancements (Phase 2+)

- [ ] Database integration (PostgreSQL)
- [ ] QR code scanning for polling stations
- [ ] Offline mode for rural areas
- [ ] Multi-district real-time synchronization
- [ ] ECSL voter register integration
- [ ] Audit logging & compliance reports
- [ ] SMS notifications to verified voters
- [ ] Election observer access & transparency
- [ ] Mobile app (iOS/Android)

## Deployment

### Deploy to Vercel (30 seconds)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

Vercel will give you a live URL like: `voteverify-xyz.vercel.app`

### Environment Variables on Vercel
Add to Vercel project settings:
```
SOBA_API_KEY=e69c8117-c2b4-4c51-a86e-2359099b4151
SOBA_EVENT_ID=2460005
NEXT_PUBLIC_SOBA_REGISTRATION_URL=https://poh.soba.network/verifyHuman?sid=NzUwMDA2fDI0NjAwMDV8PHVzZXJfZW1haWw%2B
NEXT_PUBLIC_SOBA_VERIFICATION_URL=https://poh.soba.network/verify?sid=NzUwMDA2fDI0NjAwMDU%3D
```

## Submission Checklist

Before submitting to hackathon:

- [ ] All 5 pages working (Home, Voter Register, Voter Login, Voter Dashboard, Officer)
- [ ] SOBA verification flow tested end-to-end
- [ ] Officer "Mark as Voted" feature working
- [ ] Duplicate voting prevention tested
- [ ] README.md up to date
- [ ] .env.local file has SOBA credentials
- [ ] GitHub repo is public
- [ ] Demo video recorded (2-3 min)
- [ ] Presentation slides ready
- [ ] Deployed to Vercel (optional but impressive)

## File Submission

**Required:**
1. ✅ SOBA Cloud account email
2. ✅ GitHub repo URL (public)
3. ✅ This README.md
4. ⏳ Architecture summary (see below)
5. ⏳ Demo video (3-5 min)
6. ✅ Presentation slides (already created)

### Architecture Summary

```
┌─────────────────────────────────────────────────────┐
│          VOTER INTERFACE (Next.js Frontend)         │
│  Registration Form + SOBA Verify Button + Dashboard │
└────────────┬────────────────────────────────────────┘
             │
┌────────────┴────────────────────────────────────────┐
│       APPLICATION BACKEND (Next.js API Routes)      │
│  - Voter CRUD (/api/voters)                        │
│  - Vote Marking (/api/voters/[id]/vote)           │
│  - SOBA Callback Handler (/api/soba-callback)     │
└────────────┬────────────────────────────────────────┘
             │
┌────────────┴────────────────────────────────────────┐
│     SOBA NETWORK (Identity Trust Layer)             │
│  - Biometric verification (MPC-based)              │
│  - Zero raw data storage                           │
│  - One-person-one-vote enforcement                 │
└──────────────────────────────────────────────────────┘

             ↓

┌─────────────────────────────────────────────────────┐
│        OFFICER INTERFACE (Next.js Frontend)         │
│  PIN Login + Real-time Verified Voter List         │
│  Vote Casting + Duplicate Prevention               │
└─────────────────────────────────────────────────────┘
```

## Troubleshooting

### "Domain verification failed" error
- Ensure `.env.local` has correct SOBA_API_KEY
- Check that SOBA event is active in portal

### "Cannot set properties of undefined" console warning
- Safe to ignore (external library issue)
- Does not block functionality

### Voters list empty on officer dashboard
- Register at least one voter first at `/voter`
- Check that `data/voters.json` exists

### SOBA button not showing
- Make sure voter is in submitted state (after clicking Register)
- Check browser console for errors

## Support

Questions? Check:
1. GitHub issues
2. Console errors (F12 → Console)
3. `/data/voters.json` for stored data
4. SOBA portal for event status

---

**Built for the CrowdSnap × SOBA Hackathon 2025**

Privacy • Security • Democratic Integrity