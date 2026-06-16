# Pakownik — aplikacja mobilna (Expo Go)

Aplikacja działa w **Expo Go** — nie wymaga budowania natywnego projektu.

## Szybki start

### 1. Uruchom API (w osobnym terminalu)

```bash
cd ../api
npm run dev
```

API musi działać na porcie **3001**.

### 2. Uruchom Expo

```bash
cd app
npm install
npm start
```

W terminalu pojawi się **kod QR**.

### 3. Otwórz w Expo Go

1. Zainstaluj **Expo Go** na telefonie:
   - [Android — Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS — App Store](https://apps.apple.com/app/expo-go/id982107779)
2. Upewnij się, że telefon i komputer są w **tej samej sieci Wi‑Fi**
3. Zeskanuj QR:
   - **Android** — w Expo Go wybierz „Scan QR code”
   - **iOS** — otwórz aparat i zeskanuj kod (lub Expo Go)

Alternatywnie w terminalu naciśnij:
- `a` — emulator Android (na tym komputerze)
- `i` — symulator iOS (tylko macOS)

## Połączenie z API

Telefon nie widzi `localhost` z Twojego komputera. Ustaw adres API w pliku `.env`:

### Emulator Android (na PC)
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3001
```

### Telefon fizyczny (Expo Go)
Znajdź IP komputera w sieci LAN (np. `192.168.1.10`) i ustaw:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:3001
EXPO_PUBLIC_WEB_URL=http://192.168.1.10:5173
```

Po zmianie `.env` zrestartuj Expo (`Ctrl+C`, potem `npm start`).

### Inna sieć / problemy z Wi‑Fi
Użyj tunelu (wolniejsze, ale działa bez wspólnej sieci):

```bash
npm run start:tunnel
```

**Windows (PowerShell)** — jeśli widzisz błąd *„running scripts is disabled”*, użyj:

```bash
npm.cmd run start:tunnel
```

albo bezpośrednio:

```bash
npx expo start --tunnel
```

## Dane testowe

- E-mail: `user@example.com`
- Hasło: `passwd`

## Rozwiązywanie problemów

| Problem | Rozwiązanie |
|---------|-------------|
| PowerShell: *scripts is disabled* | Użyj `npm.cmd run start` zamiast `npm run start`, lub `npx expo start` |
| „Incompatible SDK” | Zaktualizuj Expo Go w sklepie do najnowszej wersji |
| Błąd sieci / login nie działa | Sprawdź `EXPO_PUBLIC_API_URL` — musi być IP komputera, nie `localhost` |
| QR się nie ładuje | `npm run start:tunnel` lub sprawdź firewall (port 8081) |
| Metro nie startuje | `npx expo start -c` (wyczyść cache) |

## Uwaga

Expo Go obsługuje wszystkie użyte biblioteki (`expo-secure-store`, `@react-navigation`, picker). Do publikacji w sklepach (Google Play / App Store) użyj później **EAS Build** — to osobny krok.
