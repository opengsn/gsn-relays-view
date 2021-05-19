import React from 'react';

import {Table,Card} from 'react-bootstrap';
import {Form, ButtonGroup} from 'react-bootstrap';
import Web3 from 'web3'
import RelayHubAbi from "@opengsn/gsn/dist/src/common/interfaces/IRelayHub.json"
import StakeManagerAbi from "@opengsn/gsn/dist/src/common/interfaces/IStakeManager.json"
//import {RelayProvider} from "@opengsn/gsn/dist/src/relayclient/RelayProvider";
import axios from 'axios'
import cookie from 'react-cookies'
import EventEmitter from 'events'
import { networks } from './networks'
import {NetworkLinks} from "./components/NetworkLinks";
// let p = new RelayProvider(global.web3.currentProvider)


// global.web3 = new Web3(p)
// let addr='0x'+'0'.repeat(40)

// global.web3.eth.getBalance(addr).then(b=>console.log( 'bal=', b/1e18))
// import './App.css';
let removedRelays = {}
let globalevent = new EventEmitter()

//new Web3.providers.HttpProvider(network))
//let hubaddr = '0xD216153c06E857cD7f72665E0aF1d7D82172F494'

let BLOCK_HISTORY_COUNT = 6000*30*30
const GETADDR_TIMEOUT = 5*1000

function same(a,b) { return a.toUpperCase() === b.toUpperCase() }

// eslint-disable-next-line
class RelayInfo extends React.Component {
  render() {
  let relay = this.props.relay
  let network=this.props.network

	return <Card><Card.Body>
		<Card.Title> <RelayUrl url={relay.url}/></Card.Title>
		<Card.Subtitle>Status: <Status status={relay.status} />
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
      <font family="monospaces">{addr?addr.replace(/^0x/, "").slice(0,8)+"\u2026":'null'} </font></a>

class GsnStatus extends React.Component {

  async updateRelays() {

    let web3=this.web3

    let curBlockNumber = await web3.eth.getBlockNumber()
    let fromBlock=Math.max(1, curBlockNumber-BLOCK_HISTORY_COUNT )
    let hub = new web3.eth.Contract(RelayHubAbi, this.state.network.RelayHub)

    hub.methods.versionHub().call().then(ver=>{this.state.hubversion = ver}).catch(err=>this.state.hubversion=err.message)
    this.state.relaysDict={}
    this.state.ownersDict={}

    let relays = this.state.relaysDict

    hub.methods.stakeManager().call().then(async sma=>{
      let sm = new web3.eth.Contract(StakeManagerAbi, sma)
      let smEvents = await sm.getPastEvents(null,{fromBlock:1})
      smEvents.forEach(e=>{
        if ( e.event === 'HubUnauthorized' || e.event === 'StakeUnlocked') {
          let relayManager = e.returnValues.relayManager
          removedRelays[relayManager] = 1
          delete relays[relayManager]
          this.updateDisplay()
        }
      })
    })
    let pastEventsAsync = hub.getPastEvents('RelayServerRegistered', {fromBlock});

    let res = await pastEventsAsync

    let owners=this.state.ownersDict
    function owner(relay) {
            let h = relay.owner
            if ( !owners[h] ) {
                const url = relay.url || relay.relayUrl
                let name = ( (url+"/").match(/\b(\w+)(\.\w+)?(:\d+)?\//)||[])[1]
                owners[h] = {
                  addr : h,
                  name: name || "owner-"+(Object.keys(owners).length+1)
                   }
            }
            return owners[h].name;
    }


    let counter=0

    const visited={}
    res.reverse().forEach(e=> {

        let r = e.returnValues

        counter++
        if ( counter===123  ) {
          // counter=1;
          r.url = "https://relay1.duckdns.org:1234"
        }
        if ( removedRelays[r.relayManager] ) {
          return
        }

//r.url = 'https://34.89.42.190'
	let timeoutId
	let setStatus = (status,worker) => {
    //skip removed (unstaked) relays
    if ( !relays[r.relayManager] )
      return

	  relays[r.relayManager].status = status
    relays[r.relayManager].worker = worker
	  this.updateDisplay()
	  clearTimeout(timeoutId)
	}

  if ( visited[r.relayManager] ) return;
	visited[r.relayManager]=1
	timeoutId = setTimeout(()=>{
	  setStatus({ level: 'orange', value: 'Timed-out' })
	}, GETADDR_TIMEOUT)
        axios.get(r.relayUrl + '/getaddr', {timeout:GETADDR_TIMEOUT, json:true})
          .then(ret => {
            //support both beta.3 and older (beta.2, v0.9) response
            const ready = ret.data.Ready || ret.data.ready
            let version = ret.data.Version || ret.data.version || ""
            const worker = ret.data.RelayServerAddress || ret.data.relayWorkerAddress
            const manager = ret.data.RelayManagerAddress || ret.data.relayManagerAddress
            const status = !same(r.relayManager,manager) ? { level: "magenta", value:"addr-mismatch" }
              : ready ? { level:"green", value:"Ready "+version } : { level:"orange", value: "pending "+version };
            setStatus(status, worker )
//            this.updateDisplay()
          })
          .catch( err=> {
            if ( /timeout/.test(err.toString())) {
              setStatus( {level:"orange",value: 'Timeout'})
            } else {
              setStatus( {level:"red",value: err.error && err.error.code ? err.error.code : err.message || err.toString() } )
            }
          })

        web3.eth.getBalance(r.relayManager)
          .then(bal => { if (relays[r.relayManager]) { relays[r.relayManager].bal = bal / 1e18; this.updateDisplay() } } )

        let aowner = owner(r);
        // console.log( e.blockNumber, e.event, r.url, aowner )
        const txfee = `${r.baseRelayFee}+${r.pctRelayFee}%`  // + `\n${(curBlockNumber-e.blockNumber)}`
        relays[r.relayManager] = {addr:r.relayManager, worker:'', url: r.relayUrl, owner: aowner, txfee, status: {level:"gray", value:"waiting"}}
    })
    this.updateDisplay()

	// owner status not working.
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
      const levels = { green:1, gray:2, orange: 2, red:3, magenta:4 }
      function byLevel(a,b) {
        return levels[a.status.level] - levels[b.status.level]
      }
      this.setState({relays:Object.values(this.state.relaysDict).sort(byLevel), owners: Object.values(this.state.ownersDict)})
  }
  constructor(props) {
    super(props)

    this.state={
      relays: []
    }
    let network = networks[this.props.network]
    this.state.network = network
    let httpProvider = new Web3.providers.HttpProvider(network.url)
    // let web3provider = new RelayProvider( httpProvider, {verbose:true} )
    let web3provider = httpProvider
    let web3 = new Web3(web3provider)
    this.web3 = web3

    this.relayHeaders = this.headers(['addr', 'worker', 'url', 'txfee', 'status', 'bal' /*, 'owner'*/])
    this.ownerHeaders = this.headers(['addr','name','deposit', 'bal'])
    globalevent.on('refresh', e=> {
      this.updateRelays()
    })
    this.updateRelays()
}


  //table columns with special renderers
  renderers = {
    addr : (val) => <Address addr={val} network={this.state.network} />,
    worker : (val) => <Address addr={val} network={this.state.network} />,
    bal : (val) => <Balance val={val} />,
    deposit : (val) => <Balance val={val} />,
    url : (val) =><RelayUrl url={val} />,
    status: (val) => <Status status={val} />

  }
  headers(arr) {
    return arr.map(h=>( {title:h, dataIndex:h, render: this.renderers[h] }))
  }
 render() {

      //just to avoid "xDai xDai" (a group with a single network)
  const netName = ({name,group})=>group===name ? group : group+" "+name

  return ( <>
    <Card> <Card.Body>

     <a name={this.props.network}></a>
     <h3>Network: {netName(this.state.network)}</h3>
      RelayHub: <Address addr={this.state.network.RelayHub} network={this.state.network} />
      <b>{this.state.hubversion}</b>
      <br/>
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

const Status = ({status})=> <font color={status.level}>{status.value}</font>

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
        <h2>&nbsp;<img src="favicon.ico" height="50px" alt=""/> GSN Relay Servers</h2>

         <Card style={{ width:"60%"}}>
            <Card.Header style={{backgroundColor:"orange"}}>Warning:</Card.Header>

            <Card.Body style={{backgroundColor:"yellow"}}>
                This page is for the (now obsolete) contracts release <b>2.0.0</b> and relayers <b>2.1.0</b>
                <br/>
                Please use the <a href="https://relays.opengsn.org">latest release</a> instead.
            </Card.Body>
         </Card>
         <hr/>
         <NetworkLinks networks={networks} />
        <button onClick={()=>globalevent.emit('refresh')}>Refresh</button>

      {false &&<>
        <ButtonGroup>
           <Form.Check type="checkbox" label="all networks" checked={this.state.showAll} onChange={()=>this.toggle('showAll')}/>
           &nbsp;&nbsp;&nbsp;
           <Form.Check type="checkbox" label="show owners" checked={this.state.showOwners} onChange={()=>this.toggle('showOwners')}/>
        </ButtonGroup>
      </>}
      { Object.keys(networks).filter( net=>this.state.showAll ? true : net==="mainnet" ).map( net=> <GsnStatus key={net} network={net} showOwners={this.state.showOwners} /> ) }
      <button onClick={()=>globalevent.emit('refresh')}>Refresh</button>

    </Card.Body></>
  }
}
export default App;
