import { PrivyClient } from "@privy-io/server-auth";
import { ethers, Transaction, TransactionRequest } from "ethers";
import {
    _aavePoolAddressProviderAddresses,
    _Anvil_RPC_URLS,
    _ERC20_ABI,
    _PERMIT2_ABI,
    _PERMIT2_ADDRESS,
    _POOL_ABI,
    _POOL_ADDRESS_PROVIDER_ABI,
    _privyAppId,
    _privyAppSecret,
    _RPC_URLS,
    _secret_key_as_string,
    _USDC_ADDRESSES,
} from "./constants";

// const RPC_URLS = _RPC_URLS;
const RPC_URLS = _Anvil_RPC_URLS;

const privy = new PrivyClient(_privyAppId, _privyAppSecret, {
    walletApi: {
        authorizationPrivateKey: _secret_key_as_string,
    },
});

function checkConfigBit(config: bigint, position: number): boolean {
    const mask = 1n << BigInt(position);
    return (config & mask) !== 0n;
}

const getConfigBits = (configData: bigint, startBit: number, bits: number) => {
    const mask = (1n << BigInt(bits)) - 1n;
    return (BigInt(configData) >> BigInt(startBit)) & mask;
};

async function initializeAaveProtocol(chain: string): Promise<ethers.Contract> {
    const provider = new ethers.JsonRpcProvider(
        RPC_URLS[chain as keyof typeof RPC_URLS],
    );

    // Add logging to debug
    console.log("Chain:", chain);
    console.log("RPC URL:", RPC_URLS[chain as keyof typeof RPC_URLS]);

    const addressProviderAddress = _aavePoolAddressProviderAddresses[
        chain as keyof typeof _aavePoolAddressProviderAddresses
    ];
    console.log("Address Provider Address:", addressProviderAddress);

    const addressProviderContract = new ethers.Contract(
        addressProviderAddress,
        _POOL_ADDRESS_PROVIDER_ABI,
        provider,
    );

    try {
        // Add await here and store result
        const poolAddress = await addressProviderContract.getPool();
        console.log("Pool Address:", poolAddress);

        if (!poolAddress) {
            throw new Error("Pool address returned as null");
        }

        // Verify the pool address is valid
        if (!ethers.isAddress(poolAddress)) {
            throw new Error(`Invalid pool address: ${poolAddress}`);
        }

        const poolContract = new ethers.Contract(
            poolAddress,
            _POOL_ABI,
            provider,
        );

        return poolContract;
    } catch (error) {
        console.error("Error in initializeAaveProtocol:", error);
        throw error;
    }
}

async function approveUSDCForPermit2(chain: string, userAddress: string) {
    const provider = new ethers.JsonRpcProvider(
        RPC_URLS[chain as keyof typeof RPC_URLS],
    );

    // Check ETH balance first
    const ethBalance = await provider.getBalance(userAddress);
    console.log("ETH Balance:", ethers.formatEther(ethBalance), "ETH");
    // if (ethBalance < ethers.parseEther("0.001")) { // adjust threshold as needed
    //     throw new Error("Insufficient ETH for gas");
    // }

    const usdcAddress = _USDC_ADDRESSES[chain as keyof typeof _USDC_ADDRESSES];
    const usdcContract = new ethers.Contract(usdcAddress, _ERC20_ABI, provider);

    // Check current USDC -> Permit2 allowance
    const currentAllowance = await usdcContract.allowance(
        userAddress,
        _PERMIT2_ADDRESS,
    );
    if (currentAllowance > 0) {
        console.log("USDC already approved for Permit2");
        return;
    }

    const maxApproval = ethers.MaxUint256;
    const nonce = await provider.getTransactionCount(userAddress);

    const chainId = (() => {
        switch (chain) {
            case "BASE":
                return 8453;
            case "ARBITRUM":
                return 42161;
            case "POLYGON":
                return 137;
            case "ETHEREUM":
                return 1;
            default:
                throw new Error("Invalid chain");
        }
    })();

    const transactionData = {
        chainType: "ethereum",
        address: userAddress,
        method: "eth_signTransaction",
        params: {
            transaction: {
                to: usdcAddress,
                data: usdcContract.interface.encodeFunctionData("approve", [
                    _PERMIT2_ADDRESS,
                    maxApproval,
                ]),
                chainId: chainId,
                from: userAddress,
                gasLimit: "0x" + (100000).toString(16),
                maxFeePerGas: "0x" +
                    ethers.parseUnits("0.1", "gwei").toString(16),
                maxPriorityFeePerGas: "0x" +
                    ethers.parseUnits("0.05", "gwei").toString(16),
                nonce: "0x" + nonce.toString(16),
            },
        },
    };

    const { data } = await privy.walletApi.rpc(transactionData);
    const signedTx = data.signedTransaction;

    const txResponse = await provider.broadcastTransaction(
        signedTx as unknown as string,
    );
    // console.log("USDC Approval transaction sent! Hash:", txResponse.hash);

    const receipt = await txResponse.wait();
    // console.log("USDC Approval confirmed in block:", receipt?.blockNumber);
}

async function approveWithPermit2(chain: string, userAddress: string) {
    const provider = new ethers.JsonRpcProvider(
        RPC_URLS[chain as keyof typeof RPC_URLS],
    );
    const permit2Contract = new ethers.Contract(
        _PERMIT2_ADDRESS,
        _PERMIT2_ABI,
        provider,
    );
    const aavePool = await initializeAaveProtocol(chain);

    const usdcAddress = _USDC_ADDRESSES[chain as keyof typeof _USDC_ADDRESSES];

    const approvalAmount = ethers.parseUnits("100000", 6); // 100,000 USDC
    const oneYearFromNow = Math.floor(Date.now() / 1000) + 31536000;

    const nonce = await provider.getTransactionCount(userAddress);

    const chainId = (() => {
        switch (chain) {
            case "BASE":
                return 8453;
            case "ARBITRUM":
                return 42161;
            case "POLYGON":
                return 137;
            case "ETHEREUM":
                return 1;
            default:
                throw new Error("Invalid chain");
        }
    })();

    const transactionData = {
        chainType: "ethereum",
        address: userAddress,
        method: "eth_signTransaction",
        params: {
            transaction: {
                to: _PERMIT2_ADDRESS,
                data: permit2Contract.interface.encodeFunctionData("approve", [
                    usdcAddress, // token
                    aavePool.target, // spender
                    approvalAmount, // amount (max approval)
                    oneYearFromNow, // expiration (max)
                ]),
                chainId: chainId,
                from: userAddress,
                gasLimit: "0x" + (100000).toString(16),
                maxFeePerGas: "0x" +
                    ethers.parseUnits("0.1", "gwei").toString(16),
                maxPriorityFeePerGas: "0x" +
                    ethers.parseUnits("0.05", "gwei").toString(16),
                nonce: "0x" + nonce.toString(16),
            },
        },
    };

    const { data } = await privy.walletApi.rpc(transactionData);
    const signedTx = data.signedTransaction;

    // Send the transaction
    const txResponse = await provider.broadcastTransaction(
        signedTx as unknown as string,
    );
    console.log("Approval transaction sent! Hash:", txResponse.hash);

    // Wait for confirmation
    const receipt = await txResponse.wait();
    console.log("Approval confirmed in block:", receipt?.blockNumber);

    // Add verification check
    const allowance = await permit2Contract.allowance(
        userAddress,
        usdcAddress,
        aavePool.target,
    );

    // Permit2 returns [amount, expiration, nonce]
    const [allowanceAmount] = allowance;

    console.log(
        "New allowance:",
        ethers.formatUnits(allowanceAmount, 6),
        "USDC",
    );

    // Verify the allowance matches what we expected
    if (allowanceAmount < approvalAmount) {
        throw new Error(
            `Approval failed: Expected allowance of ${
                ethers.formatUnits(approvalAmount, 6)
            } USDC but got ${ethers.formatUnits(allowanceAmount, 6)} USDC`,
        );
    }

    console.log("✅ Approval verified successfully!");
}

async function investInAave(chain: string) {
    try {
        chain = chain.toUpperCase();
        const amount = 0.4; // USD
        const userAddress = "0xb547eB7173236dBBfF75C5994A26560Bd26d1699";

        // Add debug logging
        console.log("Starting investment with params:", {
            chain,
            amount,
            userAddress,
        });

        // Step 1: Approve USDC -> Permit2
        await approveUSDCForPermit2(chain, userAddress);

        // step 2: Approve Permit2 -> aavePool
        await approveWithPermit2(chain, userAddress);

        console.log("\n\nApproved USDC -> Permit2 and Permit2 -> aavePool\n\n");

        const aaveProtocol = await initializeAaveProtocol(chain);

        const usdcAddress =
            _USDC_ADDRESSES[chain as keyof typeof _USDC_ADDRESSES];

        const reserveData = await aaveProtocol.getReserveData(usdcAddress);
        const ltv = getConfigBits(reserveData.configuration, 0, 16);
        const liquidationThreshold = getConfigBits(
            reserveData.configuration,
            16,
            16,
        );
        const isActive = getConfigBits(reserveData.configuration, 56, 1);
        const isFrozen = getConfigBits(reserveData.configuration, 57, 1);
        const isPaused = getConfigBits(reserveData.configuration, 58, 1);
        const borrowingEnabled = getConfigBits(
            reserveData.configuration,
            59,
            1,
        );

        console.log("USDC Reserve Status:", {
            isActive: Boolean(isActive),
            isFrozen: Boolean(isFrozen),
            isPaused: Boolean(isPaused),
            borrowingEnabled: Boolean(borrowingEnabled),
            ltv: Number(ltv) / 100, // Convert basis points to percentage
            liquidationThreshold: Number(liquidationThreshold) / 100,
            liquidityIndex: ethers.formatUnits(reserveData.liquidityIndex, 27), // RAY units (27 decimals)
            currentLiquidityRate: ethers.formatUnits(
                reserveData.currentLiquidityRate,
                27,
            ),
        });

        // throw new Error("Test");
        const provider = new ethers.JsonRpcProvider(
            RPC_URLS[chain as keyof typeof RPC_URLS],
        );
        const nonce = await provider.getTransactionCount(userAddress);

        // console.log(
        //     "-------provider url-------\n",
        //     RPC_URLS[chain as keyof typeof RPC_URLS],
        // );

        // Add debug logging for contract state
        // console.log("Contract setup:", {
        //     aavePoolAddress: aaveProtocol.target,
        //     usdcAddress,
        //     nonce,
        // });

        // Verify USDC balance before proceeding
        const usdcContract = new ethers.Contract(
            usdcAddress,
            _ERC20_ABI,
            provider,
        );
        const balance = await usdcContract.balanceOf(userAddress);
        console.log("USDC Balance:", ethers.formatUnits(balance, 6));

        const depositAmount = ethers.parseUnits(amount.toString(), 6);
        console.log("Deposit amount in wei:", depositAmount.toString());

        // Add allowance check
        const permit2Contract = new ethers.Contract(
            _PERMIT2_ADDRESS,
            _PERMIT2_ABI,
            provider,
        );
        const [allowanceAmount] = await permit2Contract.allowance(
            userAddress,
            usdcAddress,
            aaveProtocol.target,
        );
        console.log(
            "Current Permit2 allowance:",
            ethers.formatUnits(allowanceAmount, 6),
        );
        if (allowanceAmount < depositAmount) {
            throw new Error(
                "Insufficient Permit2 allowance. Please approve USDC first.",
            );
        }

        console.log("--- Pre-deposit checks ---");
        console.log(
            "ETH Balance:",
            ethers.formatEther(await provider.getBalance(userAddress)),
        );
        console.log(
            "USDC Balance:",
            ethers.formatUnits(await usdcContract.balanceOf(userAddress), 6),
        );
        console.log(
            "USDC -> Permit2 Allowance:",
            ethers.formatUnits(
                await usdcContract.allowance(userAddress, _PERMIT2_ADDRESS),
                6,
            ),
        );
        const [permit2Allowance] = await permit2Contract.allowance(
            userAddress,
            usdcAddress,
            aaveProtocol.target,
        );
        console.log(
            "Permit2 -> Aave Allowance:",
            ethers.formatUnits(permit2Allowance, 6),
        );

        // get chainId from chain
        const chainId = (() => {
            switch (chain) {
                case "BASE":
                    return 8453;
                case "ARBITRUM":
                    return 42161;
                case "POLYGON":
                    return 137;
                case "ETHEREUM":
                    return 1;
                default:
                    throw new Error("Invalid chain");
            }
        })();

        const network = await provider.getNetwork();
        console.log("Network verification:", {
            chainId: network.chainId,
            expectedChainId: chainId,
            match: network.chainId === BigInt(chainId),
        });

        // Verify USDC decimals
        const usdcDecimals = await usdcContract.decimals();
        if (usdcDecimals !== BigInt(6)) {
            console.log(
                "-------usdcDecimals-------\n",
                usdcDecimals,
                typeof usdcDecimals,
            );
            throw new Error(`Unexpected USDC decimals: ${usdcDecimals}`);
        }

        // Check minimum deposit
        const minAmount = ethers.parseUnits("0.000001", 6); // Example minimum
        if (depositAmount < minAmount) {
            throw new Error("Deposit amount might be too small");
        }

        const feeData = await provider.getFeeData();
        const maxFeePerGas = feeData.maxFeePerGas ||
            ethers.parseUnits("0.1", "gwei");
        const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ||
            ethers.parseUnits("0.05", "gwei");

        const transactionData = {
            chainType: "ethereum",
            address: userAddress,
            method: "eth_signTransaction",
            params: {
                transaction: {
                    to: aaveProtocol.target,
                    data: aaveProtocol.interface.encodeFunctionData("supply", [
                        usdcAddress,
                        depositAmount,
                        userAddress,
                        0,
                    ]),
                    chainId: chainId,
                    nonce: "0x" + nonce.toString(16),
                    from: userAddress,
                    gasLimit: `0x${(250000).toString(16)}`, // Increased gas limit
                    maxFeePerGas: `0x${maxFeePerGas.toString(16)}`,
                    maxPriorityFeePerGas: `0x${
                        maxPriorityFeePerGas.toString(16)
                    }`,
                } as unknown as TransactionRequest,
            },
        };

        // Try to estimate gas before sending
        try {
            const gasEstimate = await provider.estimateGas(
                transactionData.params.transaction,
            );
            console.log("Estimated gas:", gasEstimate.toString());
            // Update gas limit with estimate plus buffer
            transactionData.params.transaction.gasLimit = "0x" +
                (Number(gasEstimate) * 1.2).toString(16);
        } catch (gasError: unknown) {
            // Enhanced error logging
            console.error("Error whilie estimating gas: \n", {
                to: transactionData.params.transaction.to,
                from: transactionData.params.transaction.from,
                data: transactionData.params.transaction.data,
                value: transactionData.params.transaction.value,
            });

            // Try to simulate the transaction to get more error details
            try {
                await provider.call(transactionData.params.transaction);
            } catch (simulationError: any) {
                console.error("Transaction simulation failed:", {
                    error: simulationError.message,
                    data: simulationError.data,
                });
            }

            throw gasError;
        }

        const { data } = await privy.walletApi.rpc(transactionData);
        console.log("-------data-------\n", data);
        const signedTx = data.signedTransaction;
        console.log("-------signedTx-------\n", signedTx);

        // Verify the transaction
        const tx = ethers.Transaction.from(signedTx as unknown as string);
        if (!tx.from) {
            throw new Error(
                "Transaction verification failed - from address is null",
            );
        }
        if (tx.from.toLowerCase() !== userAddress.toLowerCase()) {
            throw new Error(
                "Transaction verification failed - from address does not match user address",
            );
        }

        // throw new Error("Test");

        // Send the transaction
        const txResponse = await provider.broadcastTransaction(
            signedTx as unknown as string,
        );
        console.log("Transaction sent! Hash:", txResponse.hash);

        // Wait for confirmation
        const receipt = await txResponse.wait();
        console.log("Transaction confirmed in block:", receipt?.blockNumber);

        return receipt;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Investment failed:");
        } else {
            console.error("Investment failed:", error);
        }
        throw error;
    }
}

async function _checkCurrentEthValue(chain: string): Promise<number> {
    try {
        const userAddress = "0xfdc28c8AE597B228ef0Fd1b8101b659eb26A52fC";
        console.log("Checking ETH value for address:", userAddress);

        const aaveProtocol = await initializeAaveProtocol(chain);
        const usdcAddress = _USDC_ADDRESSES[chain as keyof typeof _USDC_ADDRESSES];

        // Get user data
        const userData = await aaveProtocol.getUserAccountData(userAddress);

        // Get total collateral in USDC (not ETH)
        // Note: totalCollateralBase is in USD with 8 decimals
        const totalCollateralUSDC = Number(userData.totalCollateralBase) / (10 ** 8);
        console.log("\nUser Position in USDC:", totalCollateralUSDC);
        return totalCollateralUSDC;
    } catch (error) {
        console.error("Error in _checkCurrentEthValue:", error);
        throw error;
    }
}

async function _withdrawAllFunds(chain: string, amount: number) {
    chain = chain.toUpperCase();
    const userAddress = "0xfdc28c8AE597B228ef0Fd1b8101b659eb26A52fC";

    // Step 1: Approve USDC -> Permit2
    await approveUSDCForPermit2(chain, userAddress);

    // step 2: Approve Permit2 -> aavePool
    await approveWithPermit2(chain, userAddress);

    console.log("\n\nApproved USDC -> Permit2 and Permit2 -> aavePool\n\n");

    const aaveProtocol = await initializeAaveProtocol(chain);
    const provider = new ethers.JsonRpcProvider(
        RPC_URLS[chain as keyof typeof RPC_URLS],
    );
    const nonce = await provider.getTransactionCount(userAddress);

    const chainId = (() => {
        switch (chain) {
            case "BASE":
                return 8453;
            case "ARBITRUM":
                return 42161;
            case "POLYGON":
                return 137;
            case "ETHEREUM":
                return 1;
            default:
                throw new Error("Invalid chain");
        }
    })();

    const usdcAddress = _USDC_ADDRESSES[chain as keyof typeof _USDC_ADDRESSES];
    console.log("-------userAddress-------\n", userAddress);


    const feeData = await provider.getFeeData();
    const maxFeePerGas = feeData.maxFeePerGas ||
        ethers.parseUnits("0.1", "gwei");
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ||
        ethers.parseUnits("0.05", "gwei");

    const transactionData = {
        chainType: "ethereum",
        address: userAddress,
        method: "eth_signTransaction",
        params: {
            transaction: {
                to: aaveProtocol.target,
                data: aaveProtocol.interface.encodeFunctionData("withdraw", [
                    usdcAddress,
                    // ethers.parseUnits("0.5", 6),
                    ethers.MaxUint256,
                    userAddress,
                ]),
                chainId: chainId,
                nonce: "0x" + nonce.toString(16),
                from: userAddress,
                gasLimit: `0x${(250000).toString(16)}`, // Increased gas limit
                maxFeePerGas: `0x${maxFeePerGas.toString(16)}`,
                maxPriorityFeePerGas: `0x${
                    maxPriorityFeePerGas.toString(16)
                }`,
            } as unknown as TransactionRequest,
        },
    };

    // try {
    //     const gasEstimate = await provider.estimateGas(
    //         transactionData.params.transaction,
    //     );
    //     console.log("Estimated gas:", gasEstimate.toString());
    //     // Update gas limit with estimate plus buffer
    //     transactionData.params.transaction.gasLimit = "0x" +
    //         (Number(gasEstimate) * 1.2).toString(16);
    // } catch (gasError: unknown) {
    //     // Enhanced error logging
    //     console.error("Error whilie estimating gas: \n", {
    //         to: transactionData.params.transaction.to,
    //         from: transactionData.params.transaction.from,
    //         data: transactionData.params.transaction.data,
    //         value: transactionData.params.transaction.value,
    //     });

    //     // Try to simulate the transaction to get more error details
    //     try {
    //         await provider.call(transactionData.params.transaction);
    //     } catch (simulationError: any) {
    //         console.error("Transaction simulation failed:", {
    //             error: simulationError.message,
    //             data: simulationError.data,
    //         });
    //     }

    //     throw gasError;
    // }

    console.log("-------transactionData-------\n", transactionData);

    let signedTx: any;
    try {
        const { data } = await privy.walletApi.rpc(transactionData);
        console.log("-------data-------\n", data);
        signedTx = data.signedTransaction;
        console.log("-------signedTx-------\n", signedTx);
    } catch (error) {
        console.error("Error while signing transaction:", error);
        return;
        // throw error;
    }

    // throw new Error("Test");

    // Verify the transaction
    const tx = ethers.Transaction.from(signedTx as unknown as string);
    if (!tx.from) {
        throw new Error(
            "Transaction verification failed - from address is null",
        );
    }
    // if (tx.from.toLowerCase() !== userAddress.toLowerCase()) {
    //     throw new Error(
    //         "Transaction verification failed - from address does not match user address",
    //     );
    // }

    // throw new Error("Test");

    console.log("--- Pre-withdrawal checks ---");
    console.log("ETH Balance:", ethers.formatEther(await provider.getBalance(userAddress)));
    // Add other relevant balance checks

    // Add transaction simulation
    try {
        await provider.call(transactionData.params.transaction);
    } catch (simulationError) {
        console.error("Withdrawal simulation failed:", simulationError);
        throw simulationError;
    }

    // Send the transaction
    const txResponse = await provider.broadcastTransaction(
        signedTx as unknown as string,
    );
    console.log("Transaction sent! Hash:", txResponse.hash);

    // Wait for confirmation
    const receipt = await txResponse.wait();
    console.log("Transaction confirmed in block:", receipt?.blockNumber);

    return receipt;

    // const signature = await signTransactionWithPrivy(
    //     userAddress,
    //     transactionData,
    // );
    // console.log(`Successfully signed transaction: ${signature}`);
}

async function _checkCurrentValue(chain: string) {
    try {
        const userAddress = "0xfdc28c8AE597B228ef0Fd1b8101b659eb26A52fC";
        console.log("Checking value for address:", userAddress);

        const aaveProtocol = await initializeAaveProtocol(chain);
        const usdcAddress =
            _USDC_ADDRESSES[chain as keyof typeof _USDC_ADDRESSES];

        // Get user data
        const userData = await aaveProtocol.getUserAccountData(userAddress);

        // Get price oracle to convert base units to USDC
        const addressProvider = new ethers.Contract(
            _aavePoolAddressProviderAddresses[
                chain as keyof typeof _aavePoolAddressProviderAddresses
            ],
            _POOL_ADDRESS_PROVIDER_ABI,
            new ethers.JsonRpcProvider(
                RPC_URLS[chain as keyof typeof RPC_URLS],
            ),
        );

        const priceOracleAddress = await addressProvider.getPriceOracle();
        const baseUsdPrice = await new ethers.Contract(
            priceOracleAddress,
            ["function getAssetPrice(address) view returns (uint256)"],
            addressProvider.runner,
        ).getAssetPrice(usdcAddress);

        // Convert values to USDC (considering price scaling and decimals)
        const values = {
            totalCollateralUSDC: Number(userData.totalCollateralBase) /
                (10 ** 8), // Convert to USDC
            totalDebtUSDC: Number(userData.totalDebtBase) / (10 ** 8),
            availableBorrowsUSDC: Number(userData.availableBorrowsBase) /
                (10 ** 8),
            currentLiquidationThreshold: `${
                Number(userData.currentLiquidationThreshold) / 100
            }%`,
            ltv: `${Number(userData.ltv) / 100}%`,
            healthFactor:
                Number(userData.healthFactor) === Number(ethers.MaxUint256)
                    ? "∞"
                    : ethers.formatEther(userData.healthFactor),
        };

        console.log("\nUser Position in USDC:");
        console.log(JSON.stringify(values, null, 2));
    } catch (error) {
        console.error("Error in _checkCurrentValue:", error);
        throw error;
    }
}

// Wire them together
async function withdrawUserFunds(chain: string) {
    const usdcValue = await _checkCurrentEthValue(chain);
    if (usdcValue <= 0) {
        console.log("No funds to withdraw");
        return;
    }
    
    // Round to 6 decimal places before withdrawing
    const roundedValue = Number(usdcValue.toFixed(6));
    console.log(`Withdrawing ${roundedValue} USDC worth of funds`);
    return await _withdrawAllFunds(chain, roundedValue);
}

// Use this function to initiate withdrawal
// withdrawUserFunds("BASE");
// _withdrawAllFunds("BASE", 0.5);

investInAave("BASE").then((receipt) => {
    console.log("-------receipt-------\n", receipt);
});

// _checkCurrentValue("BASE");
