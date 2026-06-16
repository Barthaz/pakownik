# CLAUDE.md — Pakownik

Dokumentacja projektu dla AI i deweloperów. Czytaj ten plik przed każdą sesją rozwoju.

## Opis produktu

**Pakownik** to aplikacja do tworzenia list pakowania na wyjazdy rodzinne.

### Model biznesowy

| Tryb | Persystencja | Funkcje |
|------|--------------|---------|
| **Gość (web)** | `localStorage` (`pakownik_guest_list`) | Jedna lista, kategorie, ilości, progress |
| **Konto (web + mobile)** | API → `data.json` (beta) / MySQL (prod) | Wiele list, członkowie rodziny, udostępnianie |
| **Mobile app** | Wymaga konta — brak trybu gościa | Te same funkcje co konto web |

### Udostępnianie list

Każda lista ma unikalny `shareId` (nanoid, 10 znaków). URL: `/share/:shareId`

Uprawnienia (`sharePermission`):
- `readonly` — tylko podgląd
- `checkoff` — podgląd + zaznaczanie spakowanych
- `full_edit` — pełna edycja (dodawanie/usuwanie pozycji)

## Architektura monorepo

```
pakownik/
├── frontend/          # Vite + React + TypeScript + Tailwind (web)
│   └── src/
│       ├── models/    # Typy, stałe, logika (progress, kategorie)
│       ├── views/     # Komponenty prezentacyjne (MVC: View)
│       ├── controllers/  # Custom hooks (MVC: Controller)
│       ├── services/  # API client, localStorage
│       ├── contexts/  # Auth, Toast
│       └── pages/     # Cienkie wrappery routingu
├── app/               # Expo React Native (iOS + Android)
│   └── src/
│       ├── models/    # Typy, pl.ts, progress (współdzielona logika)
│       ├── services/  # API client (SecureStore dla JWT)
│       ├── contexts/  # AuthContext
│       ├── components/  # UI mobilne
│       ├── screens/   # Ekrany
│       └── navigation/  # React Navigation (tabs + stack)
└── api/               # Express + TypeScript
    └── src/
        ├── routes/    # Definicje tras REST
        ├── controllers/  # Warstwa HTTP (cienka)
        ├── services/  # Logika biznesowa
        ├── repositories/  # Persystencja (File / MySQL)
        └── middleware/   # JWT, share access
```

### Konwencje MVC/SOLID

- **Model** → `models/` (frontend) + `models/types.ts` (api)
- **View** → `views/` — komponenty bez logiki API
- **Controller** → `controllers/` — hooks łączące view z services
- **Repository pattern** — `IRepository` + `FileRepository` / `MysqlRepository`
- **Dependency Inversion** — serwisy używają `getRepository()`, nie konkretnej implementacji

## Model danych

### Struktura `data.json`

```json
{
  "users": [{ "id", "email", "passwordHash", "createdAt" }],
  "familyMembers": [{ "id", "userId", "name" }],
  "familyMemberItems": [{ "id", "familyMemberId", "category", "name", "quantity" }],
  "packingLists": [{
    "id", "userId", "shareId", "name", "sharePermission",
    "selectedMemberIds", "createdAt", "updatedAt"
  }],
  "listItems": [{
    "id", "listId", "category", "name", "quantity", "packed", "familyMemberId"
  }]
}
```

### Kategorie domyślne
Ubrania, Higiena, Elektronika, Dokumenty, Apteczka, Inne

### Auto-pakowanie z profili rodziny

1. Użytkownik tworzy członków rodziny i przypisuje im `familyMemberItems`
2. Przy tworzeniu/edycji listy wybiera `selectedMemberIds`
3. Serwis `PackingListService.mergeFamilyItems()` dodaje przedmioty członków do `listItems`
4. Duplikaty (ta sama nazwa + kategoria + członek) sumują ilości

## API REST

Base URL: `/api`

### Auth
| Metoda | Endpoint | Auth | Body/Response |
|--------|----------|------|---------------|
| POST | `/auth/register` | — | `{ email, password }` → `{ user, token }` |
| POST | `/auth/login` | — | `{ email, password }` → `{ user, token }` |
| GET | `/auth/me` | JWT | → `User` |

### Packing Lists
| Metoda | Endpoint | Auth |
|--------|----------|------|
| GET | `/packing-lists` | JWT |
| POST | `/packing-lists` | JWT — `{ name, selectedMemberIds? }` |
| GET | `/packing-lists/:id` | JWT |
| PUT | `/packing-lists/:id` | JWT — `{ name?, sharePermission?, selectedMemberIds? }` |
| DELETE | `/packing-lists/:id` | JWT |
| POST | `/packing-lists/:id/members` | JWT — `{ memberIds }` |
| POST | `/packing-lists/:id/items` | JWT — `{ category, name, quantity }` |
| PUT | `/packing-lists/:id/items/:itemId` | JWT |
| DELETE | `/packing-lists/:id/items/:itemId` | JWT |

### Family Members
| Metoda | Endpoint | Auth |
|--------|----------|------|
| GET | `/family-members` | JWT |
| POST | `/family-members` | JWT — `{ name }` |
| PUT | `/family-members/:id` | JWT — `{ name }` |
| DELETE | `/family-members/:id` | JWT |
| POST | `/family-members/:id/items` | JWT — `{ category, name, quantity }` |
| PUT | `/family-members/:id/items/:itemId` | JWT |
| DELETE | `/family-members/:id/items/:itemId` | JWT |

### Shared (publiczne)
| Metoda | Endpoint | Uprawnienia |
|--------|----------|-------------|
| GET | `/shared/:shareId` | Wszystkie |
| PATCH | `/shared/:shareId/items/:itemId` | checkoff, full_edit |
| POST | `/shared/:shareId/items` | full_edit |
| PUT | `/shared/:shareId/items/:itemId` | full_edit |
| DELETE | `/shared/:shareId/items/:itemId` | full_edit |

### Przykład logowania
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"passwd"}'
```

## Zmienne środowiskowe

### API (`api/.env`)
```
BETA_MODE=true
JWT_SECRET=...
PORT=3001
DB_HOST=...      # tylko prod
DB_USER=...
DB_PASSWORD=...
DB_NAME=pakownik
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:3001
```

### Mobile (`app/.env`)
```
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_WEB_URL=http://localhost:5173
```

## Routing frontend (web)

| Ścieżka | Dostęp | Opis |
|---------|--------|------|
| `/` | Publiczny | Landing |
| `/login`, `/register` | Publiczny | Auth |
| `/guest` | Publiczny | Tryb gościa (localStorage) |
| `/app` | JWT | Dashboard list |
| `/app/lists/:id` | JWT | Widok listy |
| `/app/family` | JWT | Członkowie rodziny |
| `/share/:shareId` | Publiczny | Udostępniona lista |

## Nawigacja mobile (`app/`)

| Ekran | Opis |
|-------|------|
| Welcome / Login / Register | Auth — wymagane konto |
| ListsTab → Lists | Dashboard list |
| ListsTab → ListDetail | Widok listy z edycją |
| FamilyTab | Członkowie rodziny + logout |

- JWT w `expo-secure-store`
- Bottom tabs: Listy + Rodzina
- Stack na liście: Lists → ListDetail
- Design: ta sama paleta co web, native UI (bottom sheets, FAB)

## UI / Design

- Język: **polski** (`models/pl.ts`)
- Paleta: cream `#FAF7F2`, navy `#1E3A5F`, coral `#E8A87C`, sand `#D4A574`
- Fonty: DM Sans (nagłówki), Inter (body)
- Ikony: Font Awesome (`@fortawesome/react-fontawesome`) — oszczędnie
- Dialogi: własne `Modal`, `ConfirmDialog`, `Toast` — **nigdy** `window.alert`
- Mobile-first, dolna nawigacja na mobile, sidebar na desktop

## Progress bar

`calculateProgress(items)` → `{ totalQuantity, packedQuantity, totalItems, packedItems, percent }`

Procent = `packedQuantity / totalQuantity * 100` (po sztukach, nie po pozycjach)

## Tryb beta

- `BETA_MODE=true` → `FileRepository` zapisuje do `api/data/data.json`
- Atomic write: temp file + rename (bezpieczeństwo na Vercel serverless)
- Konto testowe: `user@example.com` / `passwd`
- Rejestracja działa — nowi użytkownicy trafiają do `data.json`

## Produkcja (roadmap)

1. Ustaw `BETA_MODE=false`
2. Zaimportuj `api/sql/schema.sql` na MySQL (SEOHOST)
3. Uzupełnij `MysqlRepository` o prawdziwe zapytania SQL
4. Deploy API na Vercel, frontend z `VITE_API_URL`

## Gdzie dodawać nowe funkcje

| Co | Gdzie |
|----|-------|
| Nowy endpoint | `routes/` → `controllers/` → `services/` → `repositories/` |
| Nowa strona | `pages/` + `router.tsx` + opcjonalnie `views/` |
| Nowy typ | `models/types.ts` (oba projekty) |
| Tekst UI | `frontend/src/models/pl.ts` lub `app/src/models/pl.ts` |
| Logika biznesowa | `services/` (api) lub `controllers/` (frontend) |
| Ekran mobilny | `app/src/screens/` + `navigation/` |

## Komendy

```bash
# API dev
cd api && npm run dev

# Frontend dev
cd frontend && npm run dev

# Mobile dev
cd app && npm start

# Build
cd api && npm run build
cd frontend && npm run build
```
