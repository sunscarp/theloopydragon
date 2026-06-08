# Firebase Storage Setup - IMPORTANT

## Fix the "storage/unauthorized" Error

You're getting the error because Firebase Storage rules don't allow uploads. Here's how to fix it:

### Step 1: Go to Firebase Console
1. Visit https://console.firebase.google.com/
2. Select your project: **theloopydragon1**

### Step 2: Update Storage Rules
1. In the left sidebar, click **Storage**
2. Click the **Rules** tab at the top
3. Replace the existing rules with:

```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /product-images/{allPaths=**} {
      // Allow anyone to read product images
      allow read: if true;
      
      // Allow authenticated users to write
      // Or use: allow write: if true; (less secure but simpler for now)
      allow write: if request.auth != null;
    }
  }
}
```

### Step 3: Publish the Rules
Click the **Publish** button

## Alternative: Allow All (Less Secure - Only for Development)

If you want to quickly test without authentication:

```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **Warning**: This allows anyone to upload. Use only for testing!

## After Updating Rules

Refresh your owner dashboard page and try uploading images again. The error should be gone!
