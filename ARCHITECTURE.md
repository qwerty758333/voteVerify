# VoteVerify Architecture

## System Design

VoteVerify follows a **4-layer architecture**:

### Layer 1: Voter Interface
- Registration form (name, NIC, email)
- SOBA verification button integration
- Voter dashboard (status view)
- Login via email

### Layer 2: Officer Interface
- PIN-protected login (1234)
- Real-time voter verification list
- Vote casting & duplicate prevention
- Search & filter capabilities

### Layer 3: Application Backend
- Next.js API routes (serverless)
- Voter CRUD operations
- SOBA callback handler
- Vote status tracking

### Layer 4: SOBA Network
- Biometric face verification
- Zero raw data storage (MPC-based)
- One-person-one-vote enforcement
- Self-owned identity model

## Data Flow
VOTER REGISTRATION
├─ User fills form (name, NIC, email)
├─ POST /api/voters
├─ Data stored in data/voters.json
└─ Email saved for SOBA callback
SOBA VERIFICATION
├─ Voter clicks "Verify with SOBA"
├─ Redirected to https://poh.crowdsnap.ai/verify
├─ Completes biometric scan
├─ SOBA validates identity
└─ Redirects to /api/soba-callback
STATUS UPDATE
├─ Backend receives callback
├─ Finds voter by email
├─ Sets sobaVerified = true
└─ Officer dashboard updates (5s auto-refresh)
VOTE CASTING
├─ Officer logs in (PIN: 1234)
├─ Scans/confirms verified voter
├─ PATCH /api/voters/[id]/vote
├─ Sets hasVoted = true
└─ Voter marked in system

## Database Schema

```json
{
  "id": "1234567890",
  "nic": "199512345678",
  "email": "voter@example.com",
  "name": "John Doe",
  "sobaVerified": false,
  "hasVoted": false,
  "registeredAt": "2025-04-19T10:30:00Z",
  "verifiedAt": null,
  "votedAt": null
}
```

## API Contracts

### POST /api/voters (Register Voter)
**Request:**
```json
{
  "nic": "199512345678",
  "email": "voter@example.com",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "id": "1234567890",
  "nic": "199512345678",
  "email": "voter@example.com",
  "name": "John Doe",
  "sobaVerified": false,
  "hasVoted": false,
  "registeredAt": "2025-04-19T10:30:00Z"
}
```

### GET /api/voters (List All)
**Response (200):**
```json
[
  {
    "id": "1234567890",
    "nic": "199512345678",
    "email": "voter@example.com",
    "name": "John Doe",
    "sobaVerified": false,
    "hasVoted": false,
    "registeredAt": "2025-04-19T10:30:00Z"
  }
]
```

### PATCH /api/voters/[id]/vote (Mark as Voted)
**Response (200):**
```json
{
  "id": "1234567890",
  "hasVoted": true,
  "votedAt": "2025-04-19T11:45:00Z"
}
```

### POST /api/soba-callback (SOBA Redirect)
**Request (from SOBA):**
```json
{
  "email": "voter@example.com",
  "verified": true
}
```

**Response (200):**
```json
{
  "success": true
}
```

## Security Considerations

### What VoteVerify Stores
- ✅ Voter name (for officer search)
- ✅ NIC hash (optional, for duplicate check)
- ✅ Email address (for SOBA callback)
- ✅ Verification status (true/false)
- ✅ Vote status (true/false)

### What VoteVerify Does NOT Store
- ❌ Raw biometric data (SOBA handles this)
- ❌ Face scans or images
- ❌ Passwords or secrets
- ❌ Personal identification beyond NIC

### Trust Model
- **Voter Trust SOBA** for secure biometric verification
- **Officer trusts VoteVerify** to track verified voters accurately
- **VoteVerify trusts SOBA** for identity validation (not storing proof)

## Deployment Architecture
GitHub (Source Code)
↓
Vercel (Deployment)
├─ Frontend (Next.js)
├─ API Routes (Serverless Node.js)
└─ Environment Variables (.env)

## Performance Characteristics

| Operation | Time | Notes |
|-----------|------|-------|
| Voter Registration | <1s | Local write |
| SOBA Verification | 30-60s | User-facing biometric |
| Officer Dashboard Refresh | 5s | Auto-refresh interval |
| Vote Casting | <1s | Immediate update |

## Scalability Roadmap

**Phase 1 (Current):** JSON file storage (demo)
**Phase 2:** PostgreSQL database
**Phase 3:** Multi-district sync (Redis)
**Phase 4:** Edge caching (CloudFlare)
**Phase 5:** National scale (sharded DB)

Estimated capacity:
- Phase 1: 1,000 voters
- Phase 2: 1M voters
- Phase 3+: 15M+ voters (national)