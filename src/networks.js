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

    maticMumbai: {
        group: "Matic",
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
        RelayHub: "0x3A7083E709BCCd0Fc5fb53cC0Ce9DBd3b5a82DcB",
    },

    /*
        matic: {
            group: "Matic",
            name: "Polygon (Matic)",
            token: 'Matic',
            url: "https://rpc-mainnet.matic.network",
            etherscan: "https://explorer-mainnet.maticvigil.com/address/",
            RelayHub: "0x4DEb80d7dbcD0Df91F301fe89993194E16735b58",
        },

        mainnet: {
            group: "Ethereum",
          token: 'ETH',
            name: "Mainnet",
            RelayHub: "0xB1E47968aD4909b9eb693c212feA22D0419D2D56",
            //old RelayHub: "0x515e39f12590a94B102903363336AF9761ebF621",
            url: "https://mainnet.infura.io/v3/" + infura,
            etherscan: "https://etherscan.io/search?q="
        },

        kovan: {
            group: "Ethereum",
            name: "Kovan",
            token: 'kETH',
            url: "https://kovan.infura.io/v3/" + infura,
            etherscan: "https://kovan.etherscan.io/search?q=",
            RelayHub: "0xE9dcD2CccEcD77a92BA48933cb626e04214Edb92",
        },

        rinkeby: {
            group: "Ethereum",
            name: "Rinkeby",
            token: 'rETH',
            url: "https://rinkeby.infura.io/v3/" + infura,
            etherscan: "https://rinkeby.etherscan.io/search?q=",
            RelayHub: "0x53C88539C65E0350408a2294C4A85eB3d8ce8789",
        },

        ropsten: {
            group: "Ethereum",
            name: "Ropsten",
            token: 'rETH',
            url: "https://ropsten.infura.io/v3/" + infura,
            etherscan: "https://ropsten.etherscan.io/search?q=",
            RelayHub: "0x29e41C2b329fF4921d8AC654CEc909a0B575df20",
        },

        goerli: {
            group: "Ethereum",
            name: "Görli (Goerli)",
            token: 'gETH',
            url: "https://goerli.infura.io/v3/" + infura,
            etherscan: "https://goerli.etherscan.io/search?q=",
            RelayHub: "0x1F3d1C33977957EA41bEdFDcBf7fF64Fd3A3985e",
        },

        etc: {
            group: "Ethereum Classic",
            name: "Mainnet",
            token: 'ETC',
            RelayHub: "0x183443070efdc1B18eb3E232F67bff4746c803E2",
            url: "https://etc.connect.bloq.cloud/v1/roast-blossom-sentence",
            etherscan: "https://blockscout.com/etc/mainnet/address/"
        },

        kotti: {
            group: "Ethereum Classic",
            name: "Kotti",
            token: 'kETC',
            RelayHub: "0x28708de1d5c681427C3F36170929D31184C113B4",
            // url: "https://www.ethercluster.com/kotti",
            url: "https://kotti.connect.bloq.cloud/v1/roast-blossom-sentence",
            etherscan: "https://blockscout.com/etc/kotti/address/"
        },

        bsc: {
            group: "Binance",
            name: "Smart Chain",
            token: 'BNB',
            url: "https://bsc-dataseed.binance.org/",
            etherscan: "https://bscscan.com/address/",
            RelayHub: "0x3A7083E709BCCd0Fc5fb53cC0Ce9DBd3b5a82DcB",
        },

        xdai: {
            group: "xDAI",
            name: "xDAI",
            token: 'DAI',
            url: "https://dai.poa.network",
            etherscan: "https://blockscout.com/poa/xdai/address/",
            RelayHub: "0x63dd60b79cb8e3d2fa20a6d2ec92e101553a3920",
        },


    /*
        kovanBeta3:  {
            name: "Kovan-V2 beta.3",
            url: "https://kovan.infura.io/v3/" + infura,
            etherscan: "https://kovan.etherscan.io/search?q=",
            RelayHub: "0xc76DaB4e73b5a2af24375D7C2A668C0B6bCdE0Df",
        },

        rinkebyBeta3:  {
            name: "Rinkeby-V2 beta.3",
            url: "https://rinkeby.infura.io/v3/" + infura,
            etherscan: "https://rinkeby.etherscan.io/search?q=",
            RelayHub: "0xD6b9b2eA2b2799ACcfb38c0FcE423f80407D3E72",
        },

        ropstenBeta3:  {
            name: "Ropsten-V2 beta.3",
            url: "https://ropsten.infura.io/v3/" + infura,
            etherscan: "https://ropsten.etherscan.io/search?q=",
            RelayHub: "0xbfA4b7A75F8e38a453508A86B3b7833F3627C40c",
        },
        kovanv2beta1:  {
            name: "Kovan-V2 beta.1",
            url: "https://kovan.infura.io/v3/" + infura,
            etherscan: "https://kovan.etherscan.io/search?q=",
            RelayHub: "0xcfcb6017e8ac4a063504b9d31b4AbD618565a276",
        },

        ropstenv2beta1:  {
            name: "Ropsten-V2 beta.1",
            url: "https://ropsten.infura.io/v3/" + infura,
            etherscan: "https://ropsten.etherscan.io/search?q=",
            RelayHub: "0xF0851c3333a9Ba0D61472de4C0548F1160F95f17",
        },
        mainnetAlpha:  {
            name: "Mainnet-v2 alpha",
          "RelayHub": "0x5648B6306380689AF8d2DE7Bdd23D916b9eE0db5",
            url: "https://mainnet.infura.io/v3/" + infura,
            etherscan: "https://etherscan.io/search?q="
        },

    */
/*    
    xdaiv2alpha: {
        name: "xDAI-V2 alpha",
        token: 'DAI',
        url:"https://dai.poa.network",
        etherscan:"https://blockscout.com/poa/xdai/address/",
        RelayHub: "0xA58B6fC9264ce507d0B0B477ceE31674341CB27e",      
    },
    kovanv09:  {
        name: "Kovan 0.9",
        "RelayHub": "0x2E0d94754b348D208D64d52d78BcD443aFA9fa52",
        url: "https://kovan.infura.io/v3/" + infura,
        etherscan: "https://kovan.etherscan.io/search?q="
    },
    ropstenv09:  {
        name: "Ropsten 0.9",
        url: "https://ropsten.infura.io/v3/" + infura,
        etherscan: "https://ropsten.etherscan.io/search?q=",
        RelayHub: "0xEF46DD512bCD36619a6531Ca84B188b47D85124b"
    }
*/

}

// eslint-disable-next-line
let otherNetworks = {
    rinkeby: {
        name: "Rinkeby",
        RelayHub: "0xEF46DD512bCD36619a6531Ca84B188b47D85124b",
        url: "https://rinkeby.infura.io/v3/" + infura,
        etherscan: "https://rinkeby.etherscan.io/search?q="
    },
    mainnet: {
        name: "Mainnet",
        url: "https://mainnet.infura.io/v3/c3422181d0594697a38defe7706a1e5b",
        etherscan: "https://etherscan.io/search?q="
    },

    ETC: {
        name: "Ethereum Classic (ETC)",
        url: "https://www.ethercluster.com/etc",
        etherscan: "https://etcblockexplorer.com/addr/"
    },
    xdai: {
        name: "xDai",
        url: "https://dai.poa.network",
        etherscan: "https://blockscout.com/poa/xdai/address/"
    },
    local: {
        name: "Local (Ganache)",
        url: "http://127.0.0.1:8545",
        etherscan: ""
    },
}

module.exports=networks
