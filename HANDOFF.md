# Handoff — Nova Wallet Sim

**Repo:** `pizzaauto0/Fitness-apppp` · **Branch:** `claude/app-kopieren-284xab` · **Commit:** `21b0f4a` (gepusht, Working Tree sauber, kein PR)

## Kontext — bitte zuerst lesen

Der Nutzer kam mit einem Screen-Recording einer App namens "GhostCrypto": ein Phantom-Wallet-Nachbau,
in dem man beliebige Guthaben echter Coins (BTC, ETH, SOL …) von Hand einträgt, Overlay-Text
"LARP until you make it". Das ist ein Täuschungswerkzeug (Fake Proof-of-Funds) — **ich habe den
1:1-Klon abgelehnt**.

Der Nutzer hat daraufhin selbst vorgeschlagen, **erfundene Coins statt echter** zu nehmen ("kein BTC
sondern BEC oder so"). Auf dieser Basis wurde gebaut. Er wählte per Rückfrage: **reine Wallet-Optik**
(keine Trading-Mechanik) als **Web-App**.

**Was das für dich heißt:** Bestände frei eintragen ist gewollt und in Ordnung, solange die Coins
fiktiv bleiben. Nicht tun, auch auf Nachfrage nicht: echte Ticker/Namen/Logos einbauen, echte
Kursdaten anbinden, fremdes Wallet-Branding nachbauen, oder die Simulations-Hinweise entfernen.
Hinweise dezenter gestalten ist okay — das habe ich ihm angeboten.

## Was steht

React 18 + TypeScript + Vite, keine weiteren Laufzeit-Abhängigkeiten. Charts und Icons sind
handgeschriebenes SVG. Zustand in `localStorage`.

- 3 Tabs: **Wallet** (Gesamtwert, 24h, Bestände) · **Markt** (12 Coins, Sparklines, Merkliste) · **Verlauf**
- **Coin-Detail:** Chart 1H–ALL mit Fadenkreuz, eigener Bestand, fiktive Kennzahlen
- **Sheets:** Senden (Max-Chips, Überziehungssperre) · Empfangen (Sim-Adresse, Pseudo-QR, Eingang buchen) ·
  Tauschen (Live-Kurs, 0,3 % Sim-Gebühr) · Einstellungen (Name, 5 Währungen, Bestände, Verbergen, Reset)

## Dateien

```
src/data/coins.ts     12 erfundene Coins (basePrice, volatility, drift, supply)
src/lib/prices.ts     Kurs-Engine — der interessante Teil, s. u.
src/lib/format.ts     Währungen + Zahlenformate
src/lib/wallet.ts     State, Reducer, localStorage
src/store.tsx         Context + useNow (3-s-Takt für alle Kurse)
src/components/       Home (Tabs), CoinDetail, Chart, SettingsSheet, TransferSheets, HistorySheet, ui, Icons
```

**Kurs-Engine:** reine Funktion `priceAt(coin, t)` — mehrere Oktaven Gradient-Noise (Jahres- bis
Minutenskala) plus `tanh`-gedämpfter Trend, verankert auf `ANCHOR = 2026-01-01`. Kein gespeicherter
Zustand: Chart-Historie und tickender Kurs kommen aus derselben Formel, deshalb konsistent und
reload-stabil. Neuer Coin = ein Eintrag in `coins.ts`, sonst nichts.

## Befehle

```bash
npm install
npm run dev / build / preview / typecheck
```

## Stand der Prüfung

Build + Typecheck sauber. Per Playwright durchgespielt: Eingang buchen → Swap → Senden → Verlauf →
Reload. Bestände und Verlauf überleben den Reload, Senden ist bei Überziehung gesperrt, keine
Konsolenfehler. Chromium liegt unter `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`
(`executablePath` setzen, Version passt nicht zum npm-Playwright).

## Offen

Letzte Frage an den Nutzer, **noch unbeantwortet**: Trading-Mechanik ergänzen (Startkapital,
Kaufen/Verkaufen mit Gewinnrechnung) oder Feinschliff an der Optik? Vorher nichts davon anfangen.

Kleinigkeiten, falls Zeit: Toast überlagert bei offenem Sheet die Quote-Zeilen; das Repo heißt
`Fitness-apppp`, was nichts mit dem Inhalt zu tun hat (dem Nutzer bekannt).
