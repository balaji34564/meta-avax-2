import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [receipts, setReceipts] = useState([]);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once the wallet is set, we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      const amount = 1;
      let tx = await atm.deposit(amount);
      await tx.wait();
      getBalance();

      // Update receipts with deposit details
      addReceipt("Deposit", amount);
    }
  };

  const withdraw = async () => {
    if (atm) {
      const amount = 1;
      let tx = await atm.withdraw(amount);
      await tx.wait();
      getBalance();

      // Update receipts with withdraw details
      addReceipt("Withdraw", amount);
    }
  };

  const addReceipt = (type, amount) => {
    const newReceipt = {
      serialNumber: receipts.length + 1,
      ownerName: "Balaji YS", 
      address: "191 Main St, MG Road", 
      accountType: "Current", 
      transactionType: type,
      transactionAmount: amount,
      timestamp: new Date().toLocaleString(),
    };

    setReceipts((prevReceipts) => [...prevReceipts, newReceipt]);
  };

  const fetchBalance = () => {
    getBalance();
  };

  const initUser = () => {
    // Check to see if the user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask to use this ATM.</p>;
    }

    // Check to see if the user is connected. If not, connect to their account
    if (!account) {
      return (
        <div>
          <button onClick={connectAccount}>
            Please connect your Metamask wallet
          </button>
        </div>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <div>
          <p>Your Account: {account}</p>
          <button onClick={deposit}>Deposit 1 ETH</button>
          <button onClick={withdraw}>Withdraw 1 ETH</button>
          <button onClick={fetchBalance}>Fetch Balance</button>
          {balance !== undefined && <p>Your Balance: {balance}</p>}
        </div>
        <div className="receipt">
          <h2>Digitial Receipt's</h2>
          {receipts.map((receipt, index) => (
            <div key={index}>
              <h3>Receipt #{receipt.serialNumber}</h3>
              <p>Owner Name: {receipt.ownerName}</p>
              <p>Address: {receipt.address}</p>
              <p>Account Type: {receipt.accountType}</p>
              <p>Transaction Type: {receipt.transactionType}</p>
              <p>Transaction Amount: {receipt.transactionAmount} ETH</p>
              <p>Timestamp: {receipt.timestamp}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          background-color: #d2b48c; /* Light Brown background color */
          min-height: 100vh; /* Set minimum height to full viewport height */
        }
        .receipt {
          border: 1px solid #ccc;
          padding: 10px;
          margin-top: 20px;
        }
      `}</style>
    </main>
  );
}
