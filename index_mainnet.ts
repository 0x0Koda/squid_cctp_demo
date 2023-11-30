import { ethers } from "ethers";
import dotenv from "dotenv";
import axios, { AxiosRequestConfig } from "axios";
dotenv.config();

async function sendCalldataTransaction() {
  if (!process.env.PK) throw new Error("process.env.PK is undefined");
  const PK = process.env.PK;

  let routeResponse;
  try {
    const url = "https://v2.api.squidrouter.com/v2/route";
    const data = {
      fromChain: "1",
      fromToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      fromAddress: "0xb13CD07B22BC5A69F8500a1Cb3A1b65618d50B22",
      fromAmount: "1000000",
      toChain: "noble-1",
      toToken: "uusdc",
      toAddress: "noble1zqnudqmjrgh9m3ec9yztkrn4ttx7ys64p87kkx",
      quoteOnly: false,
      slippage: 1,
      slippageConfig: {
        autoMode: 1,
      },
      enableBoost: true,
    };

    const headers: AxiosRequestConfig = {
      headers: {
        "x-integrator-id": "Squid-team", // Set your authorization token here.
      },
    };

    const response = await axios.post(url, data, headers);
    console.log("Response data:", response.data);
    routeResponse = response.data.route;
    console.log(routeResponse);
  } catch (error) {
    console.error("Error:", error);
  }

  const rpcUrl =
    "https://mainnet.infura.io/v3/273aad656cd94f9aa022e4899b87dd6c";
  const provider = ethers.getDefaultProvider(rpcUrl);
  const wallet = new ethers.Wallet(PK, provider);

  // Create a transaction object
  const transaction = {
    to: routeResponse.transactionRequest.target,
    data: routeResponse.transactionRequest.data,
  };

  // Estimate gas cost
  const gasEstimate = await wallet.estimateGas(transaction);

  transaction["gasLimit"] = ethers.BigNumber.from("150000");

  // Sign and send the transaction
  const tx = await wallet.sendTransaction(transaction);
  console.log("Transaction sent:", tx.hash);

  // Wait for the transaction to be confirmed
  await tx.wait();
  console.log("Transaction confirmed in block:", tx);
}

sendCalldataTransaction()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
