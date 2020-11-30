//use #infura=xxxx, or default one.
const infura = (document.location.href.match(/#.*infura=([^&]*)/) ||[])[1] || '127b8c9f6d0d46f69a42963b5cd0d0ac'

export const networks = {

    kovanV2:  {
        name: "Kovan",
        url: "https://kovan.infura.io/v3/" + infura,
        etherscan: "https://kovan.etherscan.io/search?q=",
        RelayHub: "0xE9dcD2CccEcD77a92BA48933cb626e04214Edb92",
    },

    rinkebyV2:  {
        name: "Rinkeby",
        url: "https://rinkeby.infura.io/v3/" + infura,
        etherscan: "https://rinkeby.etherscan.io/search?q=",
        RelayHub: "0x53C88539C65E0350408a2294C4A85eB3d8ce8789",
    },

    ropstenV2:  {
        name: "Ropsten",
        url: "https://ropsten.infura.io/v3/" + infura,
        etherscan: "https://ropsten.etherscan.io/search?q=",
        RelayHub: "0x29e41C2b329fF4921d8AC654CEc909a0B575df20",
    },

    goerliV2:  {
        name: "Görli (Goerli)",
        url: "https://goerli.infura.io/v3/" + infura,
        etherscan: "https://goerli.etherscan.io/search?q=",
        RelayHub: "0x1F3d1C33977957EA41bEdFDcBf7fF64Fd3A3985e",
    },

    mainnetV2:  {
        name: "Mainnet",
        RelayHub: "0x515e39f12590a94B102903363336AF9761ebF621",
        url: "https://mainnet.infura.io/v3/" + infura,
        etherscan: "https://etherscan.io/search?q="
    },

    kotti:  {
        name: "ETC-Kotti",
        RelayHub: "0x28708de1d5c681427C3F36170929D31184C113B4",
        // url: "https://www.ethercluster.com/kotti",
        url: "https://kotti.connect.bloq.cloud/v1/roast-blossom-sentence",
        etherscan: "https://blockscout.com/etc/kotti/address/"
    },

    testbnb: {
      name: "Binance-Testnet",
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      etherscan: "https://testnet.bscscan.com/address/",
      RelayHub: "0x515B28E7638aC923f0dB63298658167A4e4dB770",
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

    xdaiv2alpha: {
        name: "xDAI-V2 alpha",
        url:"https://dai.poa.network",
        etherscan:"https://blockscout.com/poa/xdai/address/",
        RelayHub: "0xA58B6fC9264ce507d0B0B477ceE31674341CB27e",      
    },
/*    
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
let otherNetworks= {
    rinkeby:  {
        name: "Rinkeby",
        RelayHub: "0xEF46DD512bCD36619a6531Ca84B188b47D85124b",
        url: "https://rinkeby.infura.io/v3/" + infura,
        etherscan: "https://rinkeby.etherscan.io/search?q="
    },
    mainnet:  {
        name: "Mainnet",
        url: "https://mainnet.infura.io/v3/c3422181d0594697a38defe7706a1e5b",
        etherscan: "https://etherscan.io/search?q="
    },

    ETC:  {
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
