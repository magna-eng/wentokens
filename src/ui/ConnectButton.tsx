import { ConnectButton as BaseButton } from '@rainbow-me/rainbowkit';
import { tw } from 'typewind';
import Button from './Button';

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
                  <Button className={tw.btn.btn_primary + ' btn-logo'} onClick={openConnectModal}>
                    Connect Wallet
                  </Button>
                );
              }
              if (chain.unsupported) {
                return (
                  <button className={tw.btn.btn_primary} onClick={openChainModal}>
                    Wrong network
                  </button>
                );
              }
              return (
                <div className={tw.btn_group}>
                  <button className={tw.btn.btn_outline} onClick={openChainModal}>
                    {chain.hasIcon && (
                      <div
                        className={tw.h_6}
                        style={{
                          background: chain.iconBackground,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img className={tw.h_6} alt={chain.name ?? 'Chain icon'} src={chain.iconUrl} />
                        )}
                      </div>
                    )}
                    <span className={tw.text_base_100}>{chain.name}</span>
                  </button>
                  <button className={tw.btn.btn_outline} onClick={openAccountModal} type="button">
                    <span className={tw.text_base_100}>{account.displayName}</span>
                    {account.displayBalance ? (
                      <span className={tw.text_primary.ml_1}> ({account.displayBalance})</span>
                    ) : (
                      ''
                    )}
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
