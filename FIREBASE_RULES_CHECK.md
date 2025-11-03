# Firebase Rules Status Check

## ⚠️ CRITICAL: The 400 errors mean your Firebase rules are NOT configured

The errors you're seeing:
```
Failed to load resource: the server responded with a status of 400 ()
WebChannelConnection RPC 'Write' stream transport errored
```

This means **Firestore is rejecting your writes** because the security rules block them.

## IMMEDIATE ACTION REQUIRED

### 1. Firestore Rules (MUST DO NOW)

Go to: https://console.firebase.google.com/project/gear-up-46adc/firestore/rules

Click **"Rules"** tab, then **"Edit rules"**

**DELETE EVERYTHING** and paste this EXACT text:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /vehicles/{vehicleId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

Click **"Publish"** button (top right, blue button)

### 2. Storage Rules (MUST DO NOW)

Go to: https://console.firebase.google.com/project/gear-up-46adc/storage/rules

Click **"Rules"** tab, then **"Edit rules"**

**DELETE EVERYTHING** and paste this EXACT text:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/profile.{ext} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
                   && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
    
    match /users/{userId}/vehicles/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
                   && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

Click **"Publish"** button (top right, blue button)

### 3. Storage CORS (MUST DO NOW)

Go to: https://console.cloud.google.com/storage/browser?project=gear-up-46adc

1. Click bucket: **gear-up-46adc.appspot.com**
2. Click **"Configuration"** tab
3. Find **"CORS"** section
4. Click **"Edit CORS configuration"**
5. Paste this:

```json
[
  {
    "origin": ["http://localhost:3000"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
    "responseHeader": ["Content-Type", "Authorization", "x-goog-resumable", "x-goog-meta-*"],
    "maxAgeSeconds": 3600
  }
]
```

6. Click **"Save"**

## After Applying All Rules

1. **Wait 2 minutes** for rules to propagate
2. **Hard refresh browser**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. **Restart dev server**:
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

## Test Again

1. Try saving Settings → Should work
2. Try adding a vehicle → Should work
3. Check My Vehicles → Should display your vehicles

## If Still Not Working

Check the Firebase Console → Firestore → Data tab:
- Do you see a "users" collection?
- Can you manually create a document there?

If NO: Your rules are still blocking. Double-check you clicked "Publish" on BOTH Firestore and Storage rules.

If YES but app still fails: Share the EXACT error from browser console (press F12 → Console tab).
