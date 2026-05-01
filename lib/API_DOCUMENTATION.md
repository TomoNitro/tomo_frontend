# API Service Documentation

## Overview

API calls di frontend sudah terpusat dan terorganisir dengan baik di folder `lib/`. Ini membuat kode lebih mudah di-maintain dan di-update.

## File Structure

```
lib/
├── config.ts    # API configuration & constants
└── api.ts       # API service dengan helper functions
```

## Configuration

### `lib/config.ts`

File ini menyimpan:
- **Base URL** backend (bisa dari env variable atau hardcoded)
- **Endpoints** - semua path API yang tersedia

```typescript
API_CONFIG.BASE_URL // Base URL backend
API_CONFIG.ENDPOINTS.AUTH.REGISTER // /api/user/register
API_CONFIG.ENDPOINTS.AUTH.LOGIN // /api/user/login
```

### Environment Variables

Di `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=https://tomobackend-production-51a6.up.railway.app
```

Untuk development dengan backend lokal, uncomment:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## API Service (`lib/api.ts`)

### Authentication API

```typescript
import { authApi } from "@/lib/api";

// Register
const response = await authApi.register(username, email, password);
if (response.success) {
  console.log(response.data);
} else {
  console.log(response.error);
}

// Login
<<<<<<< HEAD
const response = await authApi.login(email, password);
=======
const response = await authApi.login(username, password);
>>>>>>> a6330a6 (Refactor code structure for improved readability and maintainability)

// Logout
const response = await authApi.logout();
```

### User API

```typescript
import { userApi } from "@/lib/api";

// Get Profile
const response = await userApi.getProfile();

// Update Profile
const response = await userApi.updateProfile({ name: "John" });
```

<<<<<<< HEAD
### Children API

```typescript
import { childrenApi } from "@/lib/api";

// Register child profile
const registerResponse = await childrenApi.register("leo_kid", "1234");

// Login child profile after selecting it in /profile
const loginResponse = await childrenApi.login("child-uuid", "1234");

// Fetch children list for the profile picker
const listResponse = await childrenApi.getList();
```

=======
>>>>>>> a6330a6 (Refactor code structure for improved readability and maintainability)
## Response Format

Semua API calls mengembalikan struktur yang sama:

```typescript
interface ApiResponse<T = unknown> {
  success: boolean;    // true/false
  data?: T;           // Response data (jika success)
  error?: string;     // Error message (jika error)
}
```

## Cara Menambah Endpoint Baru

### 1. Tambah di `config.ts` (Endpoints)

```typescript
ENDPOINTS: {
  POSTS: {
    GET_ALL: "/api/posts",
    CREATE: "/api/posts/create",
  },
}
```

### 2. Tambah di `api.ts` (Service Function)

```typescript
export const postsApi = {
  getAll: async () => {
    return apiCall(API_CONFIG.ENDPOINTS.POSTS.GET_ALL, {
      method: "GET",
    });
  },

  create: async (title: string, content: string) => {
    return apiCall(API_CONFIG.ENDPOINTS.POSTS.CREATE, {
      method: "POST",
      body: JSON.stringify({ title, content }),
    });
  },
};
```

### 3. Gunakan di Component

```typescript
import { postsApi } from "@/lib/api";

const posts = await postsApi.getAll();
```

## Error Handling

Error handling sudah built-in di `apiCall()`:
- Network errors → caught dan dikembalikan sebagai error message
- HTTP errors (4xx, 5xx) → returned sebagai `success: false`
- JSON parsing errors → handled
- CORS errors → akan muncul di error message

## Benefits

✅ **Centralized** - Semua endpoints di satu tempat  
✅ **Reusable** - Pakai API service di mana saja  
✅ **Type-safe** - TypeScript support  
✅ **Easy to maintain** - Update endpoint? Cukup di config.ts  
✅ **Consistent error handling** - Semua API calls handle error yang sama  
✅ **Environment flexible** - Switch backend dengan env variable
