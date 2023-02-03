import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function Connect() {
  const { connector, isConnected } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div>
      <div>
        {isConnected && <button className="btn" onClick={() => disconnect()}>Disconnect</button>}

        {connectors
          .filter(x => x.ready && x.id !== connector?.id)
          .map(x => (
            <button key={x.id} onClick={() => connect({ connector: x })} className="btn">
              {x.name}
              {isLoading && x.id === pendingConnector?.id && ' (connecting)'}
            </button>
          ))}
      </div>

      {error && <div>{error.message}</div>}
    </div>
  );
}
