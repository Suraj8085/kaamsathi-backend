# KaamSathi Backend (demo API)

Ek simple Node.js + Express backend jo KaamSathi app ke flow ko match karta hai:
phone/OTP login, labour profile banana, business profile banana, "paas ke labour"
dekhna, aur contact/hire record karna.

Data ek local `data/db.json` file mein store hota hai (koi external database setup
nahi chahiye) — demo/prototype ke liye theek hai, production ke liye isse
Postgres/MongoDB jaisi real database se replace karein.

## Chalane ka tarika

```bash
npm install
npm start
```

Server `http://localhost:4000` par chalega.

## Endpoints

| Method | Route                              | Kaam                                   |
|--------|-------------------------------------|-----------------------------------------|
| POST   | /api/auth/send-otp                  | `{ phone }` → OTP bhejta hai (demo OTP: `1234`) |
| POST   | /api/auth/verify-otp                | `{ phone, code }` → login token deta hai |
| POST   | /api/labour                         | Naya labour profile banata hai          |
| GET    | /api/labour                         | Sab labour profiles (ya `?skill=Painter` se filter) |
| GET    | /api/labour/:id                     | Ek profile ki detail                    |
| POST   | /api/labour/:id/activate-plan       | `{ plan: "week"/"month"/"year" }`       |
| POST   | /api/business                       | Naya business profile banata hai        |
| GET    | /api/business/:id                   | Business profile detail                 |
| POST   | /api/contacts                       | `{ businessId, labourId, action }` — swipe-right (contact) ya swipe-left (skip) record karta hai |
| GET    | /api/skills                         | Sab skill categories (icons ke saath)   |

## Frontend se jodna (connect karna)

`kaamsathi-frontend/index.html` abhi apne aap (standalone) demo data se kaam
karta hai, taaki bina backend deploy kiye bhi poora flow test ho sake. Isse
is backend se connect karne ke liye:

1. Backend ko kahin host karo (Render, Railway, Fly.io, ya apna server).
2. Frontend ke JS mein jahan `laborers` array aur form-submit function hain,
   wahan `fetch('http://localhost:4000/api/labour', {...})` jaisi calls add karo
   OTP send/verify, profile create, aur listing ke liye.
3. CORS backend mein already enabled hai, isliye alag domain se bhi call kar sakte ho.

## Zaroori: Production ke liye aage kya karna hoga

Ye ek **starter/demo backend** hai, real users ke liye launch karne se pehle:
- Real SMS OTP gateway (jaise MSG91, Twilio) jodo — abhi OTP hamesha `1234` hai.
- `data/db.json` ki jagah real database (Postgres/MongoDB) use karo.
- Authentication tokens ko JWT ya session-based banao (abhi ek dummy string hai).
- Address-proof documents ke liye secure file storage (S3 jaisा) add karo.
- Payment ke liye real payment gateway (Razorpay/PayU) integrate karo — abhi
  "Pay Karo" sirf demo mode mein hai.
