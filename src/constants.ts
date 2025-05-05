export const _privyAppId = "";
export const _privyAppSecret =
    "";
// export const _secret_key_as_string =
//     "";

export const _secret_key_as_string = ""

export const _POOL_ADDRESS_PROVIDER_ABI = [
    "function getPool() external view returns (address)",
    "function getPoolDataProvider() external view returns (address)",
    "function getPriceOracle() external view returns (address)",
    "function getACLManager() external view returns (address)",
    "function owner() external view returns (address)"
];


export const _ERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function name() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

export const _USDC_ADDRESSES = {
    MAINNET: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    ARBITRUM: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    OP: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    BASE: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    AVAX: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    POLYGON: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
};
export const _aavePoolAddressProviderAddresses = {
    MAINNET: '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e',
    ARBITRUM: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
    OP: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
    BASE: '0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D',
    AVAX: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
    POLYGON: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
};

export const _RPC_URLS = {
    MAINNET: 'https://mainnet.infura.io/v3/4cb67d93b67f48dc8afa0937a5ba0325',
    ARBITRUM: 'https://arbitrum-mainnet.infura.io/v3/4cb67d93b67f48dc8afa0937a5ba0325',
    OP: 'https://optimism-mainnet.infura.io/v3/4cb67d93b67f48dc8afa0937a5ba0325',
    BASE: 'https://base-mainnet.infura.io/v3/4cb67d93b67f48dc8afa0937a5ba0325',
    AVAX: 'https://avalanche-mainnet.infura.io/v3/4cb67d93b67f48dc8afa0937a5ba0325',
    POLYGON: 'https://polygon-mainnet.infura.io/v3/4cb67d93b67f48dc8afa0937a5ba0325',
};

export const _Anvil_RPC_URLS = {
    MAINNET: 'http://localhost:8545',
    ARBITRUM: 'http://localhost:8546',
    OP: 'http://localhost:8547',
    BASE: 'http://localhost:8548',
    AVAX: 'http://localhost:8549',
    POLYGON: 'http://localhost:8550',
};

export const _PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3";  // same on all chains
export const _PERMIT2_ABI = [
    "function approve(address token, address spender, uint160 amount, uint48 expiration)",
    "function allowance(address user, address token, address spender) view returns (uint160 amount, uint48 expiration, uint48 nonce)",
    "function permit(address owner, address spender, uint160 amount, uint48 expiration, uint48 nonce, uint8 v, bytes32 r, bytes32 s)",
    "function transferFrom(address from, address to, uint160 amount, address token)",
    "event Approval(address indexed owner, address indexed token, address indexed spender, uint160 amount, uint48 expiration)",
    "event Permit(address indexed owner, address indexed token, address indexed spender, uint160 amount, uint48 expiration, uint48 nonce)"
];

export const _POOL_ABI = [
    {
        "inputs": [
            {
                "internalType": "contract IPoolAddressesProvider",
                "name": "provider",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "onBehalfOf",
                "type": "address"
            },
            {
                "internalType": "uint16",
                "name": "referralCode",
                "type": "uint16"
            }
        ],
        "name": "supply",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            }
        ],
        "name": "withdraw",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "interestRateMode",
                "type": "uint256"
            },
            {
                "internalType": "uint16",
                "name": "referralCode",
                "type": "uint16"
            },
            {
                "internalType": "address",
                "name": "onBehalfOf",
                "type": "address"
            }
        ],
        "name": "borrow",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "interestRateMode",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "onBehalfOf",
                "type": "address"
            }
        ],
        "name": "repay",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getUserAccountData",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "totalCollateralBase",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "totalDebtBase",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "availableBorrowsBase",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "currentLiquidationThreshold",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "ltv",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "healthFactor",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            }
        ],
        "name": "getReserveData",
        "outputs": [
            {
                "components": [
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "data",
                                "type": "uint256"
                            }
                        ],
                        "internalType": "struct DataTypes.ReserveConfigurationMap",
                        "name": "configuration",
                        "type": "tuple"
                    },
                    {
                        "internalType": "uint128",
                        "name": "liquidityIndex",
                        "type": "uint128"
                    },
                    {
                        "internalType": "uint128",
                        "name": "currentLiquidityRate",
                        "type": "uint128"
                    },
                    {
                        "internalType": "uint128",
                        "name": "variableBorrowIndex",
                        "type": "uint128"
                    },
                    {
                        "internalType": "uint128",
                        "name": "currentVariableBorrowRate",
                        "type": "uint128"
                    },
                    {
                        "internalType": "uint128",
                        "name": "currentStableBorrowRate",
                        "type": "uint128"
                    },
                    {
                        "internalType": "uint40",
                        "name": "lastUpdateTimestamp",
                        "type": "uint40"
                    },
                    {
                        "internalType": "uint16",
                        "name": "id",
                        "type": "uint16"
                    },
                    {
                        "internalType": "address",
                        "name": "aTokenAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "stableDebtTokenAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "variableDebtTokenAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "interestRateStrategyAddress",
                        "type": "address"
                    }
                ],
                "internalType": "struct DataTypes.ReserveData",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "reserve",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "onBehalfOf",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "uint16",
                "name": "referralCode",
                "type": "uint16"
            }
        ],
        "name": "Supply",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "reserve",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "Withdraw",
        "type": "event"
    }
];