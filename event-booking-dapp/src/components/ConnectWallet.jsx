import React from 'react';

function ConnectWallet({ account, connectWallet }) {
  return (
    <div className="wallet-section">
      {account ? (
        <div className="account-info">
          <p>Compte connecté: {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}</p>
        </div>
      ) : (
        <button className="connect-button" onClick={connectWallet}>
          Connecter à MetaMask
        </button>
      )}
    </div>
  );
}

export default ConnectWallet;