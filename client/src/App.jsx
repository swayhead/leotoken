import { useState, useEffect, useCallback } from "react";
import { BrowserProvider, Contract } from "ethers";
import LeoToken from "./contracts/LeoToken.json";
import MyTokenSale from "./contracts/MyTokenSale.json";
import KycContract from "./contracts/KycContract.json";
import deployments from "./contracts/deployments.json";
import Card from "./components/Card.jsx";
import "./App.css";

const styles = {
  rotorImg: "h-12 w-12",
  alertStrip:
    "fixed flex justify-center items-center h-10 w-screen text-white font-bold transition-all duration-500 ease-in-out",
  cardLabel:
    "rounded-t-xl text-center text-white bg-purple-400 font-bold h-6",
};

const SUPPORTED_CHAINS = {
  SEPOLIA: 11155111n,
  LOCAL: 31337n,
};

function App() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [kycAllowedAddress, setKycAllowedAddress] = useState("0x123...");
  const [tokenSaleAddress, setTokenSaleAddress] = useState(null);
  const [tokenAmount, setTokenAmount] = useState(0);
  const [inBuyingProcess, setInBuyingProcess] = useState(false);
  const [inWhitelistingProcess, setInWhitelistingProcess] = useState(false);
  const [contracts, setContracts] = useState(null);
  const [account, setAccount] = useState(null);

  const parseChainId = (chainId) => {
    if (typeof chainId === "string" && chainId.startsWith("0x")) {
      return parseInt(chainId, 16);
    }
    return Number(chainId);
  };

  const isChainSupported = (id) =>
    id === Number(SUPPORTED_CHAINS.SEPOLIA) ||
    (import.meta.env.DEV && (id === Number(SUPPORTED_CHAINS.LOCAL) || id === 1337 || id === 5777));

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });
    } catch (err) {
      console.error("Failed to switch network:", err);
    }
  };

  const checkNetwork = useCallback((chainId) => {
    const id = parseChainId(chainId);
    if (isChainSupported(id)) {
      setError(null);
      return true;
    }
    setError({ message: "wrong-network", disable: true });
    switchToSepolia();
    return false;
  }, []);

  const updateTokenAmount = useCallback(async () => {
    if (!contracts?.token || !account) return;
    const amount = await contracts.token.balanceOf(account);
    setTokenAmount(amount.toString());
  }, [contracts, account]);

  useEffect(() => {
    async function init() {
      try {
        if (!window.ethereum) {
          setLoaded(true);
          setError({ message: "metamask-missing", disable: true });
          return;
        }

        await window.ethereum.request({ method: "eth_requestAccounts" });

        // In dev mode, switch MetaMask to the local Hardhat network for this site
        if (import.meta.env.DEV) {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x7a69" }], // 31337
            });
          } catch (switchErr) {
            if (switchErr.code === 4902) {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [{
                  chainId: "0x7a69",
                  chainName: "Hardhat Local",
                  rpcUrls: ["http://127.0.0.1:8545"],
                  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                }],
              });
            }
          }
        }

        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
        const parsedChainId = parseInt(chainIdHex, 16);

        // In production, enforce Sepolia only
        if (!import.meta.env.DEV && !checkNetwork(chainIdHex)) {
          setLoaded(true);
          return;
        }

        const chainAddresses = deployments[parsedChainId.toString()];
        if (!chainAddresses) {
          setLoaded(true);
          setError({
            message: "Contracts not yet deployed on this network",
            disable: true,
          });
          return;
        }

        const tokenInstance = new Contract(
          chainAddresses.LeoToken,
          LeoToken.abi,
          signer
        );
        const tokenSaleInstance = new Contract(
          chainAddresses.MyTokenSale,
          MyTokenSale.abi,
          signer
        );
        const kycInstance = new Contract(
          chainAddresses.KycContract,
          KycContract.abi,
          signer
        );

        setContracts({
          token: tokenInstance,
          tokenSale: tokenSaleInstance,
          kyc: kycInstance,
        });
        setAccount(address);
        setTokenSaleAddress(chainAddresses.MyTokenSale);
        setLoaded(true);
      } catch (err) {
        setLoaded(true);
        setError({ message: "metamask-missing", disable: true });
        console.error(err);
      }
    }

    init();
  }, [checkNetwork]);

  // Listen for token transfers
  useEffect(() => {
    if (!contracts?.token || !account) return;

    const filter = contracts.token.filters.Transfer(null, account);
    const handler = () => {
      updateTokenAmount();
      setInBuyingProcess(false);
      setSuccess({ message: "Tokens successfully acquired." });
    };

    contracts.token.on(filter, handler);
    return () => contracts.token.off(filter, handler);
  }, [contracts, account, updateTokenAmount]);

  // Reload page on network or account change (cleanest way to reinitialize)
  useEffect(() => {
    if (!window.ethereum) return;

    const reload = () => window.location.reload();
    window.ethereum.on("chainChanged", reload);
    window.ethereum.on("accountsChanged", reload);
    return () => {
      window.ethereum.removeListener("chainChanged", reload);
      window.ethereum.removeListener("accountsChanged", reload);
    };
  }, []);

  // Fetch initial token amount
  useEffect(() => {
    updateTokenAmount();
  }, [updateTokenAmount]);

  const handleKycAllow = async () => {
    setInWhitelistingProcess(true);
    setError(null);
    setSuccess(null);
    try {
      const tx = await contracts.kyc.setKycStatus(kycAllowedAddress, true);
      await tx.wait();
      setSuccess({
        message: `Address ${kycAllowedAddress} has been whitelisted`,
      });
    } catch (err) {
      setError({ message: err.reason || err.message || "Transaction failed" });
    }
    setInWhitelistingProcess(false);
  };

  const handleBuyTokens = async () => {
    setInBuyingProcess(true);
    setError(null);
    setSuccess(null);
    try {
      const tx = await contracts.tokenSale.buyTokens(account, { value: 100n });
      await tx.wait();
    } catch (err) {
      setError({ message: err.reason || err.message || "Transaction failed" });
      setInBuyingProcess(false);
    }
  };

  if (!loaded) {
    return (
      <div className="flex h-screen justify-center items-center">
        Loading Web3, accounts, and contract...
      </div>
    );
  }

  let alert = { className: "", message: "" };
  if (error) {
    alert = { className: "bg-red-400", message: error.message };
  }
  if (success) {
    alert = { className: "bg-green-400", message: success.message };
  }

  const isDisabled = error?.disable;

  return (
    <>
      <div className={`${styles.alertStrip} ${alert.className}`}>
        {alert.message === "metamask-missing" ? (
          <span>
            Please install{" "}
            <a
              href="https://metamask.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              MetaMask
            </a>{" "}
            first
          </span>
        ) : alert.message === "wrong-network" ? (
          <span>Please switch to Sepolia test network in MetaMask</span>
        ) : (
          alert.message
        )}
      </div>

      <div className="flex justify-center items-start min-h-screen bg-gray-200 py-16">
        <div>
          <Card styles={styles}>
            <div className="py-2 text-xl font-medium text-black">
              Leonardo Token (LEO)
            </div>
            <div className="text-gray-600 text-sm leading-relaxed space-y-3">
              <p>
                This is a demo dApp for an <b>ERC-20 token crowdsale</b> on the
                Ethereum <b>Sepolia</b> test network. You can buy LEO tokens
                using test ETH &mdash; no real funds are involved.
              </p>
              <div>
                <p className="font-semibold text-gray-700 mb-1">Prerequisites</p>
                <ol className="list-decimal list-inside space-y-1 ml-1">
                  <li>
                    Install the{" "}
                    <a
                      href="https://metamask.io/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-500 underline"
                    >
                      MetaMask
                    </a>{" "}
                    browser extension
                  </li>
                  <li>Switch MetaMask to the <b>Sepolia</b> test network</li>
                  <li>
                    Get free test ETH from a{" "}
                    <a
                      href="https://www.alchemy.com/faucets/ethereum-sepolia"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-500 underline"
                    >
                      Sepolia faucet
                    </a>
                  </li>
                </ol>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">How it works</p>
                <ol className="list-decimal list-inside space-y-1 ml-1">
                  <li>
                    <b>KYC Whitelist</b> &mdash; The contract owner must first
                    whitelist your wallet address before you can buy tokens.
                  </li>
                  <li>
                    <b>Buy Tokens</b> &mdash; Once whitelisted, click
                    &ldquo;Buy tokens&rdquo; to send a small amount of test ETH
                    and receive LEO tokens at a 1:1 rate.
                  </li>
                </ol>
              </div>
              <p className="text-xs text-gray-400">
                Rate: 1 wei = 1 LEO &middot; Contract owner only can whitelist
                addresses
              </p>
            </div>
          </Card>

          <Card styles={styles} inProcess={inWhitelistingProcess}>
            <div className="py-2 text-xl font-medium text-black">
              Whitelist
            </div>
            <div>
              <p className="py-3 text-gray-500">Enter Address</p>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  className="w-full min-w-0 shadow appearance-none border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none font-mono disabled:bg-gray-300"
                  name="kycAllowedAddress"
                  disabled={isDisabled || inWhitelistingProcess}
                  value={kycAllowedAddress}
                  onChange={(e) => setKycAllowedAddress(e.target.value)}
                />
                <button
                  type="button"
                  className="p-2 text-white bg-gray-400 rounded-lg hover:bg-gray-700 active:shadow-lg mouse shadow transition ease-in duration-200 focus:outline-none disabled:bg-gray-300"
                  disabled={isDisabled || inWhitelistingProcess}
                  onClick={handleKycAllow}
                >
                  Add to whitelist
                </button>
              </div>
            </div>
          </Card>

          <Card styles={styles} inProcess={inBuyingProcess}>
            <div className="py-2 text-xl font-medium text-black">
              Buy Tokens
            </div>
            <div>
              <p className="py-3 text-gray-500">
                Using this Address: <code>{tokenSaleAddress}</code>
              </p>
              <p className="py-3 text-gray-500">
                You currently have: <b>{tokenAmount}</b> token
                {tokenAmount === "1" ? "" : "s"}
              </p>
              <p>
                <button
                  type="button"
                  className="p-2 text-white bg-gray-400 rounded-lg hover:bg-gray-700 active:shadow-lg mouse shadow transition ease-in duration-200 focus:outline-none disabled:bg-gray-300"
                  onClick={handleBuyTokens}
                  disabled={isDisabled || inBuyingProcess}
                >
                  Buy tokens
                </button>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

export default App;
