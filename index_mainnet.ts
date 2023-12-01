import { ethers } from "ethers";
import dotenv from "dotenv";
import axios, { AxiosRequestConfig } from "axios";
dotenv.config();

async function sendCalldataTransaction() {
  if (!process.env.PK || !process.env.RPC)
    throw new Error("Update the .env file with your PK and RPC");

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
        "x-integrator-id": "Your-integrator-id", // Set your authorization token here.
      },
    };

    const response = await axios.post(url, data, headers);
    console.log("Response data:", response.data);
    routeResponse = response.data.route;
    console.log(routeResponse);
  } catch (error) {
    console.error("Error:", error);
  }

  const rpcUrl = process.env.RPC;
  const provider = ethers.getDefaultProvider(rpcUrl);
  const wallet = new ethers.Wallet(process.env.PK, provider);

  // Create a transaction object
  const transaction = {
    to: routeResponse.transactionRequest.target,
    data: routeResponse.transactionRequest.data,
  };

  // Estimate gas cost
  const gasEstimate = await wallet.estimateGas(transaction);

  //transaction["gasLimit"] = routeResponse.transactionRequest.gasLimit;
  transaction["gasLimit"] = gasEstimate;

  // Sign and send the transaction
  const tx = await wallet.sendTransaction(transaction);
  console.log("Transaction sent:", tx.hash);

  // Wait for the transaction to be confirmed
  console.log("Waiting to tx to be confirmed");
  await tx.wait();

  console.log("##############################################");
  console.log("Transaction confirmed in block:", tx.hash);

  console.log("checkig tx status....");
  async function waitForSuccess() {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    let isSuccess = false;
    while (!isSuccess) {
      try {
        const response = await axios.get(
          "https://v2.api.squidrouter.com/v1/status",
          {
            params: {
              transactionId: tx.hash,
              fromChainId: 1,
              bridgeType: "cctp",
              toChainId: "noble-1",
            },
          }
        );

        if (
          response.data &&
          response.data.squidTransactionStatus === "success"
        ) {
          console.log(response.data);
          console.log("Transaction successful!");
          isSuccess = true;
        } else {
          console.log(response.data);
          console.log("In progress....");
          await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before the next check
        }
      } catch (error) {
        console.log("Error:", error);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  await waitForSuccess();
}

sendCalldataTransaction()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
