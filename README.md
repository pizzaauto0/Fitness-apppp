# Nova Wallet Sim

Eine Wallet-Oberfläche als Simulation — mit **frei erfundenen Kryptowährungen**.
Keine Blockchain, keine Netzwerkverbindung, kein echtes Geld.

<!-- Screenshots: siehe /docs oder die App selbst starten -->

## Was die App macht

- **Wallet** — Gesamtwert der eingetragenen Bestände, 24-h-Veränderung, Senden / Empfangen / Tauschen.
- **Markt** — alle zwölf erfundenen Coins mit Kurs, Tagesveränderung und Sparkline, plus Merkliste.
- **Coin-Detail** — Kurschart über 1H bis ALL mit Fadenkreuz, eigener Bestand, erfundene Kennzahlen
  (Marktkapitalisierung, Volumen, Umlaufmenge, Halter).
- **Buchungen** — Senden, Empfangen und Tauschen ändern die Bestände und landen im Verlauf.
- **Einstellungen** — Wallet-Name, Anzeigewährung, Bestände frei eintragen, Beträge verbergen,
  Adresse erneuern, zurücksetzen.

Alles wird in `localStorage` gespeichert und lebt nur im Browser des Geräts.

## Die Coins

Zwölf Fantasie-Währungen: Bitcorn (BEC), Etherion (ETR), Solara (SLR), Trinex (TNX), Bancoin (BNC),
Avalantis (AVX), Cardium (CDM), Polkanet (PKN), Ripplo (RPL), Shibark (SHK), Lumen X (LMX) und der
Stablecoin Stabler (STB). Keine davon existiert, keine bildet einen realen Kurs ab.

## Kurs-Simulation

`src/lib/prices.ts` berechnet den Kurs als reine Funktion aus `(Coin, Zeitpunkt)`: mehrere Oktaven
Gradient-Noise von Jahres-Zyklen bis Minutenrauschen, dazu ein gedämpfter Langfrist-Trend. Dadurch

- passen Chart-Historie und live tickender Kurs immer zusammen,
- sieht jeder Zeitraum von 1H bis ALL plausibel aus,
- bleibt der Verlauf über Reloads hinweg identisch — es wird nichts gespeichert.

Ein Coin ist über `basePrice`, `volatility`, `drift` und `supply` charakterisiert; ein neuer Coin
braucht nur einen Eintrag in `src/data/coins.ts`.

## Entwicklung

```bash
npm install
npm run dev        # Entwicklungsserver
npm run build      # Produktions-Build nach dist/
npm run preview    # Build lokal ansehen
npm run typecheck  # nur TypeScript prüfen
```

React 18 + TypeScript + Vite, keine weiteren Laufzeit-Abhängigkeiten. Charts und Icons sind
handgeschriebenes SVG.

## Aufbau

```
src/
  data/coins.ts          erfundene Coins
  lib/prices.ts          Kurs-Simulation (Noise + Trend)
  lib/format.ts          Währungen, Zahlenformate
  lib/wallet.ts          Zustand, Reducer, localStorage
  store.tsx              React-Context + Uhr für die Simulation
  components/            Oberfläche (Tabs, Detail, Sheets, Chart)
```

## Einordnung

Die App ist ein Spielzeug und eine UI-Übung. Sie zeigt bewusst nur erfundene Währungen und weist an
mehreren Stellen darauf hin, dass Beträge simuliert sind. Sie ist nicht dafür gedacht, echte
Guthaben, Depots oder Zahlungsfähigkeit vorzutäuschen.
