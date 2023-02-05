import { ConnectButton as BaseButton } from '@rainbow-me/rainbowkit';
export default function ConnectButton() {
  return (
    <BaseButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');
        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button className="btn btn-secondary" onClick={openConnectModal}>
                    Connect Wallet
                  </button>
                );
              }
              if (chain.unsupported) {
                return (
                  <button className="btn btn-secondary" onClick={openChainModal}>
                    Wrong network
                  </button>
                );
              }
              return (
                <div className="btn-group">
                  <button className="btn" onClick={openChainModal}>
                    {chain.hasIcon && (
                      <div
                        className="h-6"
                        style={{
                          background: chain.iconBackground,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img className="h-6" alt={chain.name ?? 'Chain icon'} src={chain.iconUrl} />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>
                  <button className="btn btn-secondary" onClick={openAccountModal} type="button">
                    {account.displayName}
                    {account.displayBalance ? ` (${account.displayBalance})` : ''}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </BaseButton.Custom>
  );
}
