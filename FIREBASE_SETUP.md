# Firebase Configuration Guide

Your project: **gear-up-46adc**

## Step 1: Firestore Security Rules

Go to: https://console.firebase.google.com/project/gear-up-46adc/firestore/rules

Click **Edit Rules** and replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profile documents and vehicles
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // User's vehicles subcollection
      match /vehicles/{vehicleId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

Click **Publish**

---

## Step 2: Storage Security Rules

Go to: https://console.firebase.google.com/project/gear-up-46adc/storage/rules

Click **Edit Rules** and replace with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User profile photos
    match /users/{userId}/profile.{ext} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
                   && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
    
    // User vehicle photos
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

Click **Publish**

---

## Step 3: Storage CORS Configuration

Go to: https://console.cloud.google.com/storage/browser?project=gear-up-46adc

1. Click on bucket: **gear-up-46adc.appspot.com**
2. Click the **Configuration** tab
3. Scroll to **CORS** section
4. Click **Edit CORS configuration**
5. Paste this JSON:

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

6. Click **Save**

### Alternative: Using gcloud CLI

If you have `gcloud` installed, create `cors.json`:

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

Run:
```bash
gcloud storage buckets update gs://gear-up-46adc.appspot.com --cors-file=cors.json
```

---

## Step 4: Verify Setup

After applying all rules:

1. **Wait 1-2 minutes** for propagation
2. **Hard refresh browser**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. **Restart dev server**:
   ```bash
   npm run dev
   ```

## Step 5: Test

1. **Settings Page** (`/customer/settings`):
   - Upload profile photo
   - Change display name
   - Click Save → Should succeed

2. **Vehicle Registration** (`/customer/vehicle_registration`):
   - Fill in Make, Model, Year, Number Plate
   - Upload vehicle photo (optional)
   - Click Add Vehicle → Should save and redirect

3. **My Vehicles** (`/customer/vehicles`):
   - Should show vehicles from Firestore
   - Delete button should work

---

## Troubleshooting

### Still seeing CORS errors?
- Verify you're on exactly `http://localhost:3000` (check URL bar)
- Clear browser cache completely
- Try in incognito/private window
- Wait 5 minutes after CORS config changes

### Still seeing Firestore 400 errors?
- Verify rules are published (check timestamps)
- Ensure you're logged in (check browser console for auth user)
- Check browser console for specific error messages

### Need help?
After completing these steps, if issues persist, share:
1. The exact error message from browser console
2. Screenshot of your Firestore rules
3. Screenshot of your Storage rules
