# Form Validation Documentation

## Overview

Form validation di frontend mengecek input user secara real-time dan menampilkan error messages yang spesifik untuk setiap field.

## Validation Rules

### 1. Username
- ✅ Tidak boleh kosong
- ✅ Minimal 3 karakter
- ✅ Maksimal 20 karakter
- ✅ Hanya boleh berisi huruf, angka, underscore (_), dan dash (-)

**Error Messages:**
- "Username tidak boleh kosong"
- "Username minimal 3 karakter"
- "Username maksimal 20 karakter"
- "Username hanya boleh mengandung huruf, angka, underscore, dan dash"

**Contoh valid:** john_doe, user123, john-doe

### 2. Email
- ✅ Tidak boleh kosong
- ✅ Harus format email yang valid (ada @ dan domain)

**Error Messages:**
- "Email tidak boleh kosong"
- "Format email tidak valid (contoh: user@email.com)"

**Contoh valid:** user@email.com, john@domain.co.id

### 3. Password
- ✅ Tidak boleh kosong
- ✅ Minimal 8 karakter
- ✅ Maksimal 50 karakter
- ✅ Harus mengandung: huruf besar (A-Z), huruf kecil (a-z), dan angka (0-9)

**Error Messages:**
- "Password tidak boleh kosong"
- "Password minimal 8 karakter"
- "Password maksimal 50 karakter"
- "Password harus mengandung huruf besar, huruf kecil, dan angka"

**Contoh valid:** MyPass123, Test1234, Secure99Pass

## Cara Kerja

### 1. Real-time Validation (Saat User Mengetik)

Setiap kali user mengetik di field, validation langsung berjalan:

```typescript
const handleUsernameChange = (value: string) => {
  setUsername(value);
  const error = validateUsername(value);
  setErrors((prev) => ({
    ...prev,
    username: error || "",
  }));
};
```

Kalau ada error, akan tampil di bawah input field dengan warna merah.

### 2. Submit Validation (Saat Klik Submit)

Sebelum API call, semua field divalidasi sekaligus:

```typescript
const validation = validateRegistration(username, email, password);
if (!validation.isValid) {
  // Tampil error messages
  return;
}
// Proceed dengan API call
```

## File Struktur

```
lib/
└── validation.ts          # Validation functions
    ├── validateUsername()
    ├── validateEmail()
    ├── validatePassword()
    └── validateRegistration()
```

## Menggunakan di Component Lain

Kalau ingin pakai validation di tempat lain:

```typescript
import { validateEmail, validatePassword } from "@/lib/validation";

// Validate single field
const emailError = validateEmail("user@email.com");
// Returns: null (if valid) atau string error message

// Validate multiple fields
const passwordError = validatePassword("MyPass123");
// Returns: null (if valid) atau string error message
```

## Update Error Messages

Untuk mengubah error messages atau validation rules:

Edit di `lib/validation.ts` - setiap fungsi validasi memiliki error message yang bisa diubah.

Contoh:

```typescript
export function validateUsername(username: string): string | null {
  if (!username.trim()) {
    return "Username tidak boleh kosong"; // ← Ubah di sini
  }
  // ...
}
```

## Menambah Validasi Baru

### 1. Buat function validasi di `lib/validation.ts`

```typescript
export function validateNih(nih: string): string | null {
  if (!nih.trim()) {
    return "NIH tidak boleh kosong";
  }
  if (!/^\d{16}$/.test(nih)) {
    return "NIH harus 16 digit angka";
  }
  return null;
}
```

### 2. Update `validateRegistration()` untuk include field baru

```typescript
export function validateRegistration(...) {
  // ...
  const nihError = validateNih(nih);
  if (nihError) {
    errors.push({ field: "nih", message: nihError });
  }
  // ...
}
```

### 3. Tambah ke component

```typescript
const [nih, setNih] = useState("");
const [errors, setErrors] = useState({});

const handleNihChange = (value: string) => {
  setNih(value);
  const error = validateNih(value);
  setErrors((prev) => ({ ...prev, nih: error || "" }));
};

// Di form:
<InputField
  label="NIH"
  icon="user"
  placeholder="1234567890123456"
  value={nih}
  onChange={handleNihChange}
  error={errors.nih}
/>
```

## Visual Feedback

### Valid State (Input Normal)
- Border: abu-abu (#a9a2a2)
- Background: cream (#f9efdb)
- Focus: border gold, ring gold

### Error State (Input Ada Error)
- Border: merah (red-500)
- Background: light red (red-50) saat focus
- Ring: merah (red-500)
- Error message: merah tebal dibawah input
