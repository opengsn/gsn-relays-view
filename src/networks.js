//use #infura=xxxx, or default one.
const infura = (document.location.href.match(/#.*infura=([^&]*)/) || [])[1] || '127b8c9f6d0d46f69a42963b5cd0d0ac'

//NOTE: this file is loaded dynamically (using eval) by the app. thus just updating it is enough instead of re-build entire react app
const networks = {

    mainnet220: {
        group: "Ethereum",
        name: "Mainnet",
        token: 'ETH',
        url: "https://mainnet.infura.io/v3/" + infura,
        etherscan: "https://etherscan.io/search?q=",
        RelayHub: "0x9e59Ea5333cD4f402dAc320a04fafA023fe3810D",
    },
    rinkeby220: {
        group: "Ethereum",
        name: "Rinkeby",
        token: 'rinkEth',
        url: "https://rinkeby.infura.io/v3/" + infura,
        etherscan: "https://rinkeby.etherscan.io/search?q=",
        RelayHub: "0x6650d69225CA31049DB7Bd210aE4671c0B1ca132",
    },
    ropsten220: {
        group: "Ethereum",
        name: "Ropsten",
        token: 'ropsEth',
        url: "https://ropsten.infura.io/v3/" + infura,
        etherscan: "https://ropsten.etherscan.io/search?q=",
        RelayHub: "0xAa3E82b4c4093b4bA13Cb5714382C99ADBf750cA",
    },
    kovan: {
        group: "Ethereum",
        name: "Kovan",
        token: 'kovEth',
        url: "https://kovan.infura.io/v3/" + infura,
        etherscan: "https://kovan.etherscan.io/search?q=",
        RelayHub: "0x727862794bdaa3b8Bc4E3705950D4e9397E3bAfd",
    },

    kotti: {
        group: "Ethereum Classic",
        name: "Kotti",
        token: 'kETC',
        RelayHub: "0xAdB0B519873860F396F8d6642286C179A5A0770D",
        url: "https://kotti.connect.bloq.cloud/v1/roast-blossom-sentence",
        etherscan: "https://blockscout.com/etc/kotti/address/"
    },

    etc: {
        group: "Ethereum Classic",
        name: "Mainnet",
        token: 'ETC',
        RelayHub: "0xDC8B38D05Be14818EE6d1cc4E5245Df6C52A684E",
        url: "https://etc.connect.bloq.cloud/v1/roast-blossom-sentence",
        etherscan: "https://blockscout.com/etc/mainnet/address/"
    },

    maticMainnet: {
        group: "Polygon / Matic",
        name: "Mainnet",
        token: 'Matic',
        url: "https://matic-mainnet.chainstacklabs.com",
        fromBlock: "0xba9389",
        etherscan: "https://explorer-mainnet.maticvigil.com/address/",
        RelayHub: "0x6C28AfC105e65782D9Ea6F2cA68df84C9e7d750d",
        lookupWindow: 1000
    },

    maticMumbai: {
        group: "Polygon / Matic",
        name: "Matic Mumbai",
        token: 'Matic',
        url: "https://matic-testnet-archive-rpc.bwarelabs.com",
        fromBlock: "0xba9389",
        etherscan: "https://explorer-mumbai.maticvigil.com/address/",
        RelayHub: "0x6646cD15d33cE3a6933e36de38990121e8ba2806",
    },

    xdai: {
        group: "xDAI",
        name: "xDAI",
        token: 'DAI',
        url: "https://dai.poa.network",
        etherscan: "https://blockscout.com/poa/xdai/address/",
        RelayHub: "0x727862794bdaa3b8Bc4E3705950D4e9397E3bAfd",
    },


    testbsc: {
        group: "Binance",
        name: "Testnet",
        token: 'tBNB',
        url: "https://data-seed-prebsc-1-s1.binance.org:8545",
        etherscan: "https://testnet.bscscan.com/address/",
        RelayHub: "0xAa3E82b4c4093b4bA13Cb5714382C99ADBf750cA"
    },


    bsc: {
        group: "Binance",
        name: "Smart Chain",
        token: 'BNB',
        url: "https://bsc-dataseed.binance.org/",
        etherscan: "https://bscscan.com/address/",
        RelayHub: "0xAa3E82b4c4093b4bA13Cb5714382C99ADBf750cA",
        lookupWindow: 4000
    },
}

// eslint-disable-next-line
let otherNetworks = {
    local: {
        name: "Local (Ganache)",
        url: "http://127.0.0.1:8545",
        etherscan: ""
    },
}

module.exports=networks
