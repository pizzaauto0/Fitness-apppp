import { useCallback, useEffect, useState } from 'react';
import { useNow, useWallet, WalletProvider } from './store';
import { HistoryTab, MarketTab, WalletTab } from './components/Home';
import { CoinDetail } from './components/CoinDetail';
import { SettingsSheet } from './components/SettingsSheet';
import { HistorySheet } from './components/HistorySheet';
import { ReceiveSheet, SendSheet, SwapSheet } from './components/TransferSheets';
import { IconChart, IconClock, IconInfo, IconSettings, IconWallet } from './components/Icons';

type Tab = 'wallet' | 'market' | 'history';
type SheetKind = 'settings' | 'history' | 'send' | 'receive' | 'swap';
type SheetState = { kind: SheetKind; coinId?: string } | null;

function Shell() {
  const { state } = useWallet();
  const now = useNow(3000);

  const [tab, setTab] = useState<Tab>('wallet');
  const [detail, setDetail] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => setToast(message), []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const closeSheet = useCallback(() => setSheet(null), []);
  const fallbackCoin = detail ?? 'bitcorn';

  return (
    <div className="frame">
      <div className="topbar">
        <button className="wallet-chip" onClick={() => setSheet({ kind: 'settings' })}>
          <div className="avatar" />
          <span className="name">{state.name}</span>
        </button>
        <div className="spacer" />
        <button
          className="icon-btn"
          onClick={() => setSheet({ kind: 'history' })}
          aria-label="Verlauf"
        >
          <IconClock />
        </button>
        <button
          className="icon-btn"
          onClick={() => setSheet({ kind: 'settings' })}
          aria-label="Einstellungen"
        >
          <IconSettings />
        </button>
      </div>

      {!detail && (
        <div className="sim-badge">
          <IconInfo />
          <div>
            <b>Simulation.</b> Alle Coins sind erfunden, alle Kurse werden hier im Gerät berechnet.
            Kein echtes Geld, keine Blockchain.
          </div>
        </div>
      )}

      <div className="scroll" key={detail ? `d-${detail}` : tab}>
        {detail ? (
          <CoinDetail
            coinId={detail}
            now={now}
            onBack={() => setDetail(null)}
            onSend={(coinId) => setSheet({ kind: 'send', coinId })}
            onReceive={(coinId) => setSheet({ kind: 'receive', coinId })}
            onSwap={(coinId) => setSheet({ kind: 'swap', coinId })}
          />
        ) : tab === 'wallet' ? (
          <WalletTab
            now={now}
            onOpen={setDetail}
            onSend={() => setSheet({ kind: 'send' })}
            onReceive={() => setSheet({ kind: 'receive' })}
            onSwap={() => setSheet({ kind: 'swap' })}
          />
        ) : tab === 'market' ? (
          <MarketTab now={now} onOpen={setDetail} />
        ) : (
          <HistoryTab />
        )}
      </div>

      <nav className="tabbar">
        {(
          [
            ['wallet', 'Wallet', <IconWallet key="w" />],
            ['market', 'Markt', <IconChart key="m" />],
            ['history', 'Verlauf', <IconClock key="h" size={21} />],
          ] as const
        ).map(([id, label, icon]) => (
          <button
            key={id}
            className={!detail && tab === id ? 'tab on' : 'tab'}
            onClick={() => {
              setDetail(null);
              setTab(id);
            }}
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>

      {toast && <div className="toast">{toast}</div>}

      {sheet?.kind === 'settings' && <SettingsSheet onClose={closeSheet} onToast={showToast} />}
      {sheet?.kind === 'history' && <HistorySheet onClose={closeSheet} />}
      {sheet?.kind === 'send' && (
        <SendSheet
          initialCoinId={sheet.coinId ?? fallbackCoin}
          onClose={closeSheet}
          onToast={showToast}
        />
      )}
      {sheet?.kind === 'receive' && (
        <ReceiveSheet
          initialCoinId={sheet.coinId ?? fallbackCoin}
          onClose={closeSheet}
          onToast={showToast}
        />
      )}
      {sheet?.kind === 'swap' && (
        <SwapSheet
          initialCoinId={sheet.coinId ?? fallbackCoin}
          onClose={closeSheet}
          onToast={showToast}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <Shell />
    </WalletProvider>
  );
}
