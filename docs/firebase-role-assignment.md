# Firebase Role Assignment and Role Checking Guide

## 1. Assigning Roles Using Firebase Admin SDK

You need to run this code in a secure environment (e.g., Node.js backend, Cloud Function):

```javascript
const admin = require('firebase-admin');
admin.initializeApp();

async function setUserRole(uid, role) {
  // role can be 'admin' or 'user'
  await admin.auth().setCustomUserClaims(uid, { role });
  console.log(`Custom claims set for user ${uid} with role ${role}`);
}
```

Call this function with the user's UID and desired role.

## 2. Checking Role in React/Next.js Frontend After Login

After user signs in, get the ID token result to access custom claims:

```typescript
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const auth = getAuth();

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const tokenResult = await user.getIdTokenResult();
    const role = tokenResult.claims.role || 'user'; // default to 'user' if no role set
    console.log('User role:', role);
    // Store role in state or context for access control
  } else {
    // User signed out
  }
});
```

## 3. Refreshing Token to Get Updated Claims

If you update custom claims, the user needs to refresh their ID token:

```typescript
await auth.currentUser?.getIdToken(true); // force refresh
```

Call this after role assignment to get updated claims on the client.

---

This setup allows you to implement role-based access control in your app securely.
