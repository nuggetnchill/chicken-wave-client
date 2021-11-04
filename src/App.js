import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import abi from './utils/ChickenWaves.json';

const App = () => {
  const RinkebyContractAddress = '0x70a48B4789C3cEC0142590C6dd9721929ebaE245';
  const HarmonyTestnetContractAddress =
    '0x8EF53DBF225FDA76FECF6b1e97A68D29bC9DBf74';
  const RinkebyNetworkVersion = '4';
  const HarmonyTestnetNetworkVersion = '1666700000';

  const [contractAddress, setContractAddress] = useState(
    RinkebyContractAddress
  );
  const [currentAccount, setCurrentAccount] = useState('');
  const [totalWaves, setTotalWaves] = useState([]);
  const [waveMessage, setWaveMessage] = useState('');
  const [numberOfYeets, setNumberOfYeets] = useState('');

  const contractABI = abi.abi;

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const chickenWaveContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const waves = await chickenWaveContract.getAllWaves();
        let count = await chickenWaveContract.getTotalWaves();

        setNumberOfYeets(count.toNumber());

        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        setTotalWaves(wavesCleaned.reverse());

        chickenWaveContract.on('NewWave', (from, timestamp, message) => {
          console.log('newWave, from, timestamp, message');

          setTotalWaves((prevState) => [
            {
              address: from,
              timestamp: new Date(timestamp * 100),
              message: message,
            },
            ...prevState,
          ]);
        });
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have metamask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log('No authorized account found');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get Metamask Bruv!!!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('Connected Account:', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const chickenWaveContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await chickenWaveContract.getTotalWaves();
        console.log('Getting total wave count...', count.toNumber());

        const waveTxn = await chickenWaveContract.wave(waveMessage, {
          gasLimit: 300000,
        });
        console.log('Waving.... -', waveTxn.hash);

        await waveTxn.wait();
        console.log('Waved --', waveTxn.hash);

        count = await chickenWaveContract.getTotalWaves();
        console.log('Getting total wave count...', count.toNumber());
      } else {
        console.log("Ethereum object doens't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    getAllWaves();
  }, [contractAddress]);

  const handleChange = (e) => {
    setContractAddress(e.target.value);
  };

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">👋 Sup brah!</div>

        <div>
          <label style={{ color: 'white' }}>Choose Network</label>
          <select onChange={handleChange}>
            <option value={RinkebyContractAddress}>Rinkeby</option>
            <option value={HarmonyTestnetContractAddress}>
              Harmony Testnet
            </option>
          </select>
        </div>

        <br />

        <button onClick={getAllWaves}>Refresh</button>

        {numberOfYeets && (
          <div className="total-yeet">Total Yeets: {numberOfYeets}</div>
        )}

        <br />
        {!currentAccount && (
          <div className="bio">Connect your wallet in order to yeet!</div>
        )}

        {!currentAccount && (
          <button className="connectBtn" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        <input
          type="text"
          name="message"
          placeholder="What do you want to say?"
          onChange={(e) => setWaveMessage(e.target.value)}
          value={waveMessage}
        ></input>

        {currentAccount && (
          <button className="waveButton" onClick={() => wave()}>
            Click to Yeet now!
          </button>
        )}

        {totalWaves.map((wave, index) => {
          // this is for account-avatar
          const from = wave.address.substr(2, 6);
          const to = wave.address.substr(wave.address.length - 6);
          return (
            <div key={index} className="yeet-container">
              <div
                className="account-avatar"
                style={{
                  backgroundImage: `linear-gradient(to bottom, #${from}, #${to})`,
                }}
              ></div>
              <div>
                <div>
                  From:
                  <a
                    href={`https://rinkeby.etherscan.io/address/${wave.address}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {wave.address}
                  </a>
                </div>
                <div>{wave.timestamp.toLocaleDateString('en-US')}</div>
                <div>Message: {wave.message}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default App;
