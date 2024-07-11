// src/components/SolanaWallet.js
import React, { useState, useEffect } from 'react';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { getOrca, OrcaPoolConfig, OrcaU64 } from '@orca-so/sdk';

const SolanaWallet = ({ embedded }) => {
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState(0);
  const [walletAddress, setWalletAddress] = useState('');
  const [solanaConnection, setSolanaConnection] = useState(null);
  const [swapFrom, setSwapFrom] = useState('ORCA');
  const [swapTo, setSwapTo] = useState('SOL');
  const [amount, setAmount] = useState(1);
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);

  const assets = ['ORCA', 'SOL', 'USDC', 'ETH']; // Add more assets as needed

  useEffect(() => {
    establishConnection();
    loadWallets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const establishConnection = async () => {
    try {
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      setSolanaConnection(connection);
    } catch (error) {
      console.error('Failed to connect to Solana network', error);
    }
  };

  const connectWallet = async () => {
    if (!window.solana || !window.solana.isPhantom) {
      console.error('Phantom wallet is not installed');
      return;
    }

    try {
      // Connect to Phantom wallet
      await window.solana.connect();
      const publicKey = window.solana.publicKey;

      // Fetch balance
      const balance = await solanaConnection.getBalance(publicKey);
      setBalance(balance / 10 ** 9); // Convert lamports to SOL
      setWalletAddress(publicKey.toBase58());
      setConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet', error);
    }
  };

  const disconnectWallet = () => {
    if (window.solana && window.solana.isPhantom) {
      window.solana.disconnect();
      setConnected(false);
      setBalance(0);
      setWalletAddress('');
    } else {
      console.error('Phantom wallet is not installed or not connected');
    }
  };

  const loadWallets = () => {
    // Fetch and set user's multiple wallet addresses from storage or API
    const storedWallets = []; // Replace with actual implementation to fetch stored wallets
    setWallets(storedWallets);
    if (storedWallets.length > 0) {
      setSelectedWallet(storedWallets[0]); // Select the first wallet by default
    }
  };

  const switchWallet = (wallet) => {
    setSelectedWallet(wallet);
    // Implement logic to switch between wallets and update state accordingly
  };

  const performSwap = async () => {
    if (!connected || !walletAddress || !solanaConnection) return;

    try {
      const orca = getOrca(solanaConnection);
      const owner = new PublicKey(walletAddress);
      let poolConfig;

      // Determine pool configuration based on selected assets
      if (swapFrom === 'ORCA' && swapTo === 'SOL') {
        poolConfig = OrcaPoolConfig.ORCA_SOL;
      } else if (swapFrom === 'SOL' && swapTo === 'ORCA') {
        poolConfig = OrcaPoolConfig.ORCA_SOL;
      } else if (swapFrom === 'ORCA' && swapTo === 'USDC') {
        poolConfig = OrcaPoolConfig.ORCA_USDC;
      } else if (swapFrom === 'USDC' && swapTo === 'ORCA') {
        poolConfig = OrcaPoolConfig.ORCA_USDC;
      } else if (swapFrom === 'SOL' && swapTo === 'USDC') {
        poolConfig = OrcaPoolConfig.SOL_USDC;
      } else if (swapFrom === 'USDC' && swapTo === 'SOL') {
        poolConfig = OrcaPoolConfig.SOL_USDC;
      } // Add more conditions for other assets

      if (!poolConfig) {
        console.error('Unsupported asset pair');
        return;
      }

      const pool = orca.getPool(poolConfig);

      const inputToken = swapFrom === pool.getTokenA().name ? pool.getTokenA() : pool.getTokenB();
      const outputToken = swapTo === pool.getTokenA().name ? pool.getTokenA() : pool.getTokenB();

      const inputAmount = OrcaU64.fromNumber(amount);

      // Get a quote for the swap
      const quote = await pool.getQuote(inputToken, inputAmount);

      // Perform the swap
      const swapPayload = await pool.swap(owner, inputToken, inputAmount, quote.minimumOutputAmount);

      // Send the transaction
      const swapTxId = await swapPayload.execute();

      console.log(`Swap transaction successful with txId: ${swapTxId}`);

      // Update transaction history
      updateTransactionHistory(swapTxId);
    } catch (error) {
      console.error('Failed to perform swap', error);
    }
  };

  const updateTransactionHistory = (txId) => {
    // Add the transaction to the history with timestamp, amount, and transaction details
    const newTransaction = {
      id: txId,
      date: new Date().toLocaleString(),
      amount: amount,
      from: swapFrom,
      to: swapTo,
      status: 'Pending', // Assuming initial status; update as necessary
    };
    setTransactionHistory([newTransaction, ...transactionHistory]);
  };

  const handleStaking = async () => {
    if (!connected || !walletAddress || !solanaConnection) return;

    try {
      // Placeholder for staking functionality
      console.log('Staking assets...');

      // Update transaction history
      const newTransaction = {
        id: 'stakingTxId', // Replace with actual transaction ID
        date: new Date().toLocaleString(),
        amount: amount,
        from: 'SOL', // Assume staking SOL for simplicity
        to: 'Staking Pool',
        status: 'Pending', // Assuming initial status; update as necessary
      };
      setTransactionHistory([newTransaction, ...transactionHistory]);

      console.log('Staking successful');
    } catch (error) {
      console.error('Failed to stake assets', error);
    }
  };

  const handleYieldFarming = async () => {
    if (!connected || !walletAddress || !solanaConnection) return;

    try {
      // Placeholder for yield farming functionality
      console.log('Yield farming assets...');

      // Update transaction history
      const newTransaction = {
        id: 'yieldFarmingTxId', // Replace with actual transaction ID
        date: new Date().toLocaleString(),
        amount: amount,
        from: 'SOL', // Assume yield farming with SOL for simplicity
        to: 'Farming Pool',
        status: 'Pending', // Assuming initial status; update as necessary
      };
      setTransactionHistory([newTransaction, ...transactionHistory]);

      console.log('Yield farming successful');
    } catch (error) {
      console.error('Failed to yield farm assets', error);
    }
  };

  const viewTransactionHistory = () => {
    // Toggle the display of transaction history
    setShowTransactionHistory(!showTransactionHistory);
  };

  return (
    <div className={`p-4 ${embedded ? 'max-w-sm' : 'max-w-lg'} mx-auto bg-white rounded-xl shadow-md space-y-4`}>
      <div className="text-center text-xl font-medium text-black">Solana Wallet</div>
      <div className="space-y-2">
        <div className="text-gray-500">Connected: {connected ? walletAddress : 'No'}</div>
        <div className="text-gray-500">Balance: {balance} SOL</div>
        <button className="w-full bg-blue-500 text-white p-2 rounded" onClick={connected ? disconnectWallet : connectWallet}>
          {connected ? 'Disconnect Wallet' : 'Connect Wallet'}
        </button>
        {connected && (
          <>
            <div className="space-y-2">
              <label className="block text-gray-700">From:</label>
              <select
                value={swapFrom}
                onChange={(e) => setSwapFrom(e.target.value)}
                className="w-full p-2 border rounded"
              >
                {assets.map((asset) => (
                  <option key={asset} value={asset}>
                    {asset}
                  </option>
                ))}
              </select>
              <label className="block text-gray-700">To:</label>
              <select
                value={swapTo}
                onChange={(e) => setSwapTo(e.target.value)}
                className="w-full p-2 border rounded"
              >
                {assets.map((asset) => (
                  <option key={asset} value={asset}>
                    {asset}
                  </option>
                ))}
              </select>
              <label className="block text-gray-700">Amount:</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <button className="w-full bg-green-500 text-white p-2 rounded" onClick={performSwap}>
              Swap Tokens
            </button>
            <button className="w-full bg-yellow-500 text-white p-2 rounded" onClick={handleStaking}>
              Stake Assets
            </button>
            <button className="w-full bg-yellow-500 text-white p-2 rounded" onClick={handleYieldFarming}>
              Yield Farming
            </button>
            <button className="w-full bg-gray-500 text-white p-2 rounded" onClick={viewTransactionHistory}>
              {showTransactionHistory ? 'Hide' : 'View'} Transaction History
            </button>
          </>
        )}
        {showTransactionHistory && (
          <div className="mt-4 space-y-2">
            <h2 className="text-lg font-semibold text-gray-700">Transaction History</h2>
            <ul className="space-y-1">
              {transactionHistory.map((tx) => (
                <li key={tx.id} className="p-2 border rounded">
                  <div><strong>Date:</strong> {tx.date}</div>
                  <div><strong>Amount:</strong> {tx.amount}</div>
                  <div><strong>From:</strong> {tx.from}</div>
                  <div><strong>To:</strong> {tx.to}</div>
                  <div><strong>Status:</strong> {tx.status}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolanaWallet;
