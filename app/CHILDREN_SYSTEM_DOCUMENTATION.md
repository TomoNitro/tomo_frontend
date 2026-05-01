# Children Management System Documentation

## Overview

Sistem ini memungkinkan parent untuk membuat akun untuk anak-anak mereka. Setiap anak hanya perlu username dan PIN untuk login.

## User Flow

### 1. Parent Registration
```
/auth/register 
  → Fill: username, email, password
  → Submit → /api/user/register
  → Success → Redirect ke /profile (Profile Picker)
```

### 2. Parent Login
```
/auth/login
  → Fill: email, password
  → Submit → /api/user/login
  → Success → Redirect ke /profile (Profile Picker)
```

### 3. Profile Picker (After Login/Register)
```
/profile (Page utama setelah login)
  → Tampil: Parent + Semua anak-anak + Add Explorer button
  
  Jika click "Parent":
    → Redirect ke /parent/dashboard
  
  Jika click nama anak:
    → Redirect ke /child/login
  
  Jika click "Add Explorer" (+):
    → Modal membuka: Add Child Form
    → Fill: username anak, PIN anak (4-6 digit)
    → Submit → /api/children/register
    → Success → Anak ditambahkan ke list
```

### 4. Child Login
```
/child/login
  → Fill: username anak, PIN
  → Submit → /api/children/login
  → Success → Redirect ke /child/dashboard
```

## File Structure

```
app/
├── profile/
│   └── page.tsx                    # Profile Picker Page
├── child/
│   └── login/
│       └── page.tsx                # Child Login Page
└── auth/
    └── _components/
        ├── explorer-ui.tsx         # Register + Login Forms (Parent)
        └── children-picker.tsx     # Profile Picker Modal + Add Child Form

lib/
├── config.ts                       # API endpoints
├── api.ts                          # API services (authApi, childrenApi)
└── validation.ts                   # Validation functions
```

## API Endpoints

### Parent
- `POST /api/user/register` - Register parent
- `POST /api/user/login` - Login parent
- `GET /api/user/profile` - Get parent profile
- `PUT /api/user/update` - Update parent profile

### Children
- `POST /api/children/register` - Daftarkan anak baru
- `POST /api/children/login` - Login anak
- `GET /api/children/list` - Ambil list semua anak untuk parent

## Component Details

### `ChildrenPickerModal` ([children-picker.tsx](app/auth/_components/children-picker.tsx))

Menampilkan 2 mode:

#### Mode 1: Picker (Profile Selection)
```
┌─────────────────────────────────────┐
│  Who is exploring today?            │
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│  │Parent│ │ Leo  │ │ Maya │ │ +    │
│  └──────┘ └──────┘ └──────┘ └──────┘
│  Parent    Leo     Maya    Add Explorer
└─────────────────────────────────────┘
```

Props:
- `children: string[]` - List nama-nama anak
- `onChildSelect: (name) => void` - Callback saat memilih user
- `onAddChild: (username, pin) => void` - Callback saat anak ditambahkan
- `isLoadingChildren?: boolean` - Loading state

#### Mode 2: Add Child Form
```
┌──────────────────────────────────┐
│  Add Explorer                    │
│  Buat akun untuk anak Anda       │
│                                  │
│  Child Username:                 │
│  [________________]              │
│                                  │
│  Child PIN:                      │
│  [________________]              │
│                                  │
│  [ADD EXPLORER] [CANCEL]         │
└──────────────────────────────────┘
```

### Profile Picker Page ([app/profile/page.tsx](app/profile/page.tsx))

Halaman yang muncul setelah parent login/register:
- Load list anak dari `/api/children/list`
- Pass ke `ChildrenPickerModal` component
- Handle selection dan redirect

```typescript
const handleChildSelect = (childName: string) => {
  if (childName === "parent") {
    // Redirect ke parent dashboard
    router.push("/parent/dashboard");
  } else {
    // Redirect ke child login
    router.push("/child/login");
  }
};
```

### Child Login Page ([app/child/login/page.tsx](app/child/login/page.tsx))

Form untuk anak login dengan:
- Username input
- PIN input (password field, 4-6 digit)
- Validation real-time
- Error messages
- Redirect ke `/child/dashboard` setelah sukses

## Validation Rules

### Username
- 3-20 karakter
- Alphanumeric + underscore + dash
- Sama untuk parent dan anak

### PIN (For Children)
- 4-6 digit angka
- Hanya angka (0-9)
- Diperlukan untuk child login

## Usage Examples

### Register Child
```typescript
import { childrenApi } from "@/lib/api";

const response = await childrenApi.register("leo_kid", "1234");
if (response.success) {
  console.log("Child registered:", response.data);
} else {
  console.log("Error:", response.error);
}
```

### Login as Child
```typescript
const response = await childrenApi.login("leo_kid", "1234");
if (response.success) {
  // Store user info, redirect to dashboard
} else {
  // Show error
}
```

### Get Children List
```typescript
const response = await childrenApi.getList();
if (response.success) {
  const children = response.data; // Array of child usernames
}
```

### Validate PIN
```typescript
import { validatePin } from "@/lib/validation";

const error = validatePin("1234");
// Returns: null jika valid, atau error message string
```

## States & Flow

### Profile Picker Modal States
```
┌─────────────┐
│   PICKER    │ ← Default state (show all users)
└──────┬──────┘
       │
       ├─→ click Parent → onChildSelect("parent") → /parent/dashboard
       │
       ├─→ click Child → onChildSelect(childName) → /child/login
       │
       └─→ click "+" → setMode("add-child")
            │
            └─→ ┌──────────────┐
                │  ADD-CHILD   │ ← Form untuk tambah anak
                └──────┬───────┘
                       │
                       ├─→ submit → childrenApi.register() → back to PICKER
                       │
                       └─→ cancel → back to PICKER
```

## LocalStorage Usage

Session data disimpan di localStorage:
```typescript
localStorage.setItem("selectedUser", "parent"); // atau nama anak
```

Bisa digunakan di components untuk tahu siapa yang sedang login.

## Redirect Flow

```
Register → /profile → Add Children → Select User → Dashboard
   ↓
Login ─────→ /profile → Select User → Dashboard
```

## Next Steps to Implement

1. **/parent/dashboard** - Parent dashboard page
2. **/child/dashboard** - Child dashboard page
3. Parent profile management page
4. Child edit profile page
5. Parent view/edit children page
6. Add authentication middleware/guards
7. Add logout functionality
