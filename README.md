# Pakownik

Aplikacja do tworzenia list pakowania na rodzinny wyjazd — web + mobile.

## Uruchomienie lokalne

### Wymagania
- Node.js 18+
- Expo Go (telefon) lub emulator Android/iOS (aplikacja mobilna)

### API (tryb beta)
```bash
cd api
cp .env.example .env   # jeśli brak .env
npm install
npm run dev            # http://localhost:3001
```

### Frontend (web)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev            # http://localhost:5173
```

### Aplikacja mobilna (Expo Go)

```bash
cd app
cp .env.example .env
npm install
npm start              # zeskanuj QR w aplikacji Expo Go
```

Pełna instrukcja: [app/README.md](app/README.md)

1. Zainstaluj **Expo Go** na telefonie (App Store / Google Play)
2. Uruchom API: `cd api && npm run dev`
3. Uruchom `npm start` w katalogu `app` i zeskanuj QR
4. Telefon i komputer muszą być w **tej samej sieci Wi‑Fi**

**Adres API na urządzeniu:**
- Emulator Android: domyślnie `http://10.0.2.2:3001`
- iOS Simulator: `http://localhost:3001`
- **Telefon (Expo Go):** ustaw w `.env` IP komputera, np. `EXPO_PUBLIC_API_URL=http://192.168.1.10:3001`
- Inna sieć: `npm.cmd run start:tunnel` (Windows PowerShell) lub `npx expo start --tunnel`

### Dane testowe (beta)
- E-mail: `user@example.com`
- Hasło: `passwd`
- Udostępnione listy: `/share/wakacje24`, `/share/gory2025`

## Struktura projektu

```
pakownik/
├── CLAUDE.md       # Dokumentacja dla AI
├── README.md       # Ten plik
├── frontend/       # Vite + React + Tailwind (web)
├── app/            # Expo React Native (iOS + Android)
└── api/            # Express REST API (Vercel)
    ├── data/data.json   # Persystencja w trybie beta
    └── sql/schema.sql   # Schema MySQL (SEOHOST)
```

## Tryb beta vs produkcja

| Zmienna | Beta | Produkcja |
|---------|------|-----------|
| `BETA_MODE` | `true` | `false` |
| Persystencja | `api/data/data.json` | MySQL na SEOHOST |

## Deploy

- **API**: Vercel — katalog `api/`, zmienne env w panelu
- **Frontend**: Vercel/Netlify — katalog `frontend/`, `VITE_API_URL` wskazuje na URL API
- **Mobile**: EAS Build / Expo — katalog `app/`, `EXPO_PUBLIC_API_URL` wskazuje na URL API

## Licencja

Projekt prywatny.
