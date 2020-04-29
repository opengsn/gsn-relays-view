import React from 'react';

import {Table,Card} from 'react-bootstrap';
import {Form, ButtonGroup} from 'react-bootstrap';
import Web3 from 'web3'
import RelayHubAbi from "@opengsn/gsn/src/common/interfaces/IRelayHub.js"
import rp from 'request-promise'
import cookie from 'react-cookies'

// import './App.css';

let networks={
    kovan:  {
        name: "Kovan",
    	"RelayHub": "0x2E0d94754b348D208D64d52d78BcD443aFA9fa52",
        url: "https://kovan.infura.io/v3/c3422181d0594697a38defe7706a1e5b",
        etherscan: "https://kovan.etherscan.io/search?q="
    },
    ropsten:  {
        name: "Ropsten",
        url: "https://ropsten.infura.io/v3/c3422181d0594697a38defe7706a1e5b",
        etherscan: "https://ropsten.etherscan.io/search?q=",
        RelayHub: "0xEF46DD512bCD36619a6531Ca84B188b47D85124b"
    }
}

// eslint-disable-next-line
let otherNetworks= {
    rinkeby:  {
        name: "Rinkeby",
        RelayHub: "0xEF46DD512bCD36619a6531Ca84B188b47D85124b",
        url: "https://rinkeby.infura.io/v3/c3422181d0594697a38defe7706a1e5b",
        etherscan: "https://rinkeby.etherscan.io/search?q="
    },
    mainnet:  {
        name: "Mainnet",
        url: "https://mainnet.infura.io/v3/c3422181d0594697a38defe7706a1e5b",
        etherscan: "https://etherscan.io/search?q="
    },

    kotti:  {
        name: "ETC-Kotti",
        url: "https://www.ethercluster.com/kotti",
        etherscan: "https://kotti.etccoopexplorer.com/address/"
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

//new Web3.providers.HttpProvider(network))
//let hubaddr = '0xD216153c06E857cD7f72665E0aF1d7D82172F494'

let BLOCK_HISTORY_COUNT = 6000*30
const GETADDR_TIMEOUT = 10*1000

function same(a,b) { return a.toUpperCase() === b.toUpperCase() }

// eslint-disable-next-line
class RelayInfo extends React.Component {
  render() {
  let relay = this.props.relay
  let network=this.props.network

	return <Card><Card.Body>
		<Card.Title> <RelayUrl url={relay.url}/></Card.Title>
		<Card.Subtitle>Status: {relay.status}
    <Address addr={relay.addr} network={network} />
    </Card.Subtitle>
		txfee: {relay.txfee}%, Bal:<Balance val={relay.bal} /> owner: {relay.owner}
	</Card.Body></Card>

  }
}

//simple stateless components:

//200b is zero-width space (allow wrapping.)
let RelayUrl = ({url}) => <a href={url+"/getaddr"} target="relayurl">{url.replace( /http(s)?:\/\//, "" ).replace( /[.]/g, "\u200B.")}</a>

// eslint-disable-next-line
let Balance = ({val}) => <span> { val || val == 0 ? val.toFixed(6) : "n/a" } </span>

let Address = ({addr,network} ) => <a href={network.etherscan+addr} target="etherscan" >
      <pre>{addr.replace(/^0x/, "").slice(0,8)+"\u2026"} </pre></a>

class GsnStatus extends React.Component {

  async updateRelays() {

    let web3=this.web3

    let curBlockNumber = await web3.eth.getBlockNumber()
    let fromBlock=Math.max(1, curBlockNumber-BLOCK_HISTORY_COUNT )
    let hub = new web3.eth.Contract(RelayHubAbi, this.state.network.RelayHub)
    let pastEventsAsync = hub.getPastEvents('RelayServerRegistered', {fromBlock});

    let res = await pastEventsAsync

    this.state.relaysDict={}
    this.state.ownersDict={}
    let owners=this.state.ownersDict
    function owner(relay) {
            let h = relay.owner
            if ( !owners[h] ) {
                let name = relay.url.match(/\b(\w+)\.\w+$/)[1]
                owners[h] = {
                  addr : h,
                  name: name || "owner-"+(Object.keys(owners).length+1)
                   }
            }
            return owners[h].name;
    }


    let relays = this.state.relaysDict
    let counter=0
    res.forEach(e=> {

        let r = e.returnValues

        console.log('r=',r)
        counter++
        if ( counter===123  ) {
          // counter=1;
          r.url = "https://relay1.duckdns.org:1234"
        }
        rp({url: r.url + '/getaddr', timeout:GETADDR_TIMEOUT, json:true})
          .then(ret => {
            let version = ret.Version || ""
            relays[r.relayManager].status = !same(r.relayManager,ret.RelayManagerAddress) ? "addr-mismatch @"+e.blockNumber //            ret.RelayServerAddress
              : ret.Ready ? "Ready "+version : "pending "+version
            this.updateDisplay()
          })
          .catch( err=> relays[r.relayManager].status = err.error && err.error.code ? err.error.code : err.message || err.toString() )

        web3.eth.getBalance(r.relayManager)
          .then(bal => { relays[r.relayManager].bal = bal / 1e18; this.updateDisplay() } )

        let aowner = owner(r);
        // console.log( e.blockNumber, e.event, r.url, aowner )
        const txfee = r.baseRelayFee + "+" +r.pctRelayFee+"%"
        relays[r.relayManager] = {addr:r.relayManager, url: r.url, owner: aowner, txfee, status: ""}
    })
    this.updateDisplay()

      if(false) {
          Object.keys(owners).forEach(k => {
              web3.eth.getBalance(k)
                  .then(bal => {
                      owners[k].bal = bal / 1e18;
                      this.updateDisplay()
                  })
              hub.methods.balanceOf(k).call()
                  .then(bal => {
                      owners[k].deposit = bal / 1e18;
                      this.updateDisplay()
                  })

          })
      }
  }

  //call to reflect current state (relays, owners) in the UI
  updateDisplay() {
      this.setState({relays:Object.values(this.state.relaysDict), owners: Object.values(this.state.ownersDict)})
  }
  constructor(props) {
    super(props)

    this.state={
      relays: []
    }
    let network = networks[this.props.network]
    this.state.network = network
    let web3provider = new Web3.providers.HttpProvider(network.url)
    let web3 = new Web3(web3provider)
    this.web3 = web3

    this.relayHeaders = this.headers(['addr', 'url', 'txfee', 'status', 'bal', 'owner'])
    this.ownerHeaders = this.headers(['addr','name','deposit', 'bal'])
    this.updateRelays()
}

  //table columns with special renderers
  renderers = {
    addr : (val) => <Address addr={val} network={this.state.network} />,
    bal : (val) => <Balance val={val} />,
    deposit : (val) => <Balance val={val} />,
    url : (val) =><RelayUrl url={val} />

  }
  headers(arr) {
    return arr.map(h=>( {title:h, dataIndex:h, render: this.renderers[h] }))
  }
 render() {
  return ( <>
    <Card> <Card.Body>

     <h3>Network: {this.state.network.name}</h3>
      Relays:
      {/* {this.state.relays.map(relay=><RelayInfo relay={relay} network={this.state.network} />)} */}
      <MyTable striped  data={this.state.relays} columns={this.relayHeaders} />

      {this.props.showOwners && <>
        Owners:
        <MyTable  data={this.state.owners} columns={this.ownerHeaders} />
      </>}


  </Card.Body></Card> <br/> </>
  );
}
}

function MyHeaderCol({header}) {
  return header.title || header.id
}

function MyDataCol({val, header}) {
  if ( header.render )
    return header.render(val)
  return val || header.nullValue || ""
}
function MyTable({
  columns,
  data,
  hideHeader,
  ...htmlprops
}) {

    return <Table {...htmlprops}>
      { (!hideHeader) && <thead><tr>
          {columns.map( (h,j)=> <th key={j}><MyHeaderCol header={h}/></th> ) }
        </tr></thead>}
        <tbody>
          {data && data.map((row,i)=><tr key={i}>
            {columns.map((h,j)=><td key={j}><MyDataCol val={row[h.id|| h.dataIndex]} header={h}/></td>)}
          </tr>)}
        </tbody>

    </Table>
}

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state=cookie.load('app') || { showAll:true }
  }

  toggle(item) {
    let change = {}
    change[item] = !this.state[item]
    this.setState(change)
  }

  componentDidUpdate() {
    cookie.save('app', this.state)
  }

  render() {


    return <>
     <Card.Body>

      {false &&<>
        <ButtonGroup>
           <Form.Check type="checkbox" label="all networks" checked={this.state.showAll} onChange={()=>this.toggle('showAll')}/>
           &nbsp;&nbsp;&nbsp;
           <Form.Check type="checkbox" label="show owners" checked={this.state.showOwners} onChange={()=>this.toggle('showOwners')}/>
        </ButtonGroup>
      </>}
      { Object.keys(networks).filter( net=>this.state.showAll ? true : net==="mainnet" ).map( net=> <GsnStatus key={net} network={net} showOwners={this.state.showOwners} /> ) }

    </Card.Body></>
  }
}
export default App;
