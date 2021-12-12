import React from 'react';

import {Table,Card} from 'react-bootstrap';
import {Form, ButtonGroup} from 'react-bootstrap';
import Web3 from 'web3'
import {abi as RelayHubAbi } from "@opengsn/gsn/dist/src/cli/compiled/RelayHub.json"
import StakeManagerAbi from "@opengsn/gsn/dist/src/common/interfaces/IStakeManager.json"
//import {RelayProvider} from "@opengsn/gsn/dist/src/relayclient/RelayProvider";
import axios from 'axios'
import cookie from 'react-cookies'
import EventEmitter from 'events'
// import { networks } from './networks'
import {NetworkLinks} from "./components/NetworkLinks";

import {SparkLine} from "./SparkLine";
import { logWrap } from '@opengsn/gsn/dist/src/common/logWrapper'
import { sleep } from '@opengsn/gsn/dist/src/common/Utils'
// let p = new RelayProvider(global.web3.currentProvider)

const getConfigurationAbi = [
  {
    'inputs': [],
    'name': 'getConfiguration',
    'outputs': [
      {
        'components': [
          {
            'internalType': 'uint256',
            'name': 'maxWorkerCount',
            'type': 'uint256'
          },
          {
            'internalType': 'uint256',
            'name': 'gasReserve',
            'type': 'uint256'
          },
          {
            'internalType': 'uint256',
            'name': 'postOverhead',
            'type': 'uint256'
          },
          {
            'internalType': 'uint256',
            'name': 'gasOverhead',
            'type': 'uint256'
          },
          {
            'internalType': 'uint256',
            'name': 'maximumRecipientDeposit',
            'type': 'uint256'
          },
          {
            'internalType': 'uint256',
            'name': 'minimumUnstakeDelay',
            'type': 'uint256'
          },
          {
            'internalType': 'uint256',
            'name': 'minimumStake',
            'type': 'uint256'
          },
          {
            'internalType': 'uint256',
            'name': 'dataGasCostPerByte',
            'type': 'uint256'
          },
          {
            'internalType': 'uint256',
            'name': 'externalCallDataCostOverhead',
            'type': 'uint256'
          }
        ],
        'internalType': 'struct IRelayHub.RelayHubConfig',
        'name': '',
        'type': 'tuple'
      }
    ],
    'stateMutability': 'view',
    'type': 'function'
  },
]
//single-event ABI, just for handling alpha "TransactionRelayed" event.
const RelayHubAlphaAbi = [
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "relayManager",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "relayWorker",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "paymaster",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "bytes4",
                    "name": "selector",
                    "type": "bytes4"
                },
                {
                    "indexed": false,
                    "internalType": "enum IRelayHub.RelayCallStatus",
                    "name": "status",
                    "type": "uint8"
                },
                {
                    "indexed": false,
                    "internalType": "bytes",
                    "name": "returnValue",
                    "type": "bytes"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "charge",
                    "type": "uint256"
                }
            ],
            "name": "TransactionRelayed",
            "type": "event"
        },
]

// global.web3 = new Web3(p)
// let addr='0x'+'0'.repeat(40)

let showDetailStatus=window.location.href.match(/#.*debug/)
// global.web3.eth.getBalance(addr).then(b=>console.log( 'bal=', b/1e18))
// import './App.css';
let removedRelays = {}
let globalevent = new EventEmitter()

//# of active relayers per network (displayed by NetworkLinks)
let relayCounts = {}
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

function toList(x) {
  if ( Array.isArray(x) ) return x
  return [x]
}
// eslint-disable-next-line
let Balance = ({val, counter=0}) => <span> { toList(val).map(val=>{
  return <span key={++counter}>{val || val === 0 ? val.toFixed(6) : "n/a"}<br/></span>
}) } </span>

function formatDays(days) {
  if ( !days) return ''
  if (days>2)
    return Math.round(days)+' days'
  const hours = days*24
  if (hours > 2)
    return Math.round(hours) +' hrs'

  const min = hours*60
  return Math.round(min)+' mins'
}
let HubStatus = ( {ver, net, token, countsPerDay, counts, minstake, unstakedelay, unstakedelayDays } ) => <span>
      <b>{ver}</b> MinStake ({token})={minstake} Unstake blocks={unstakedelay} ({formatDays(unstakedelayDays)})
      { showDetailStatus && counts.month !==0 && <table border="1"><tbody><tr>
        <td>Counts in the past</td>
        <td> hour:{counts.hour}</td>
        <td> day:{counts.day} </td>
        <td> week:{counts.week}</td>
        <td> month:{counts.month}</td>
        <td><SparkLine data={countsPerDay}/></td>
        </tr></tbody></table>
      }
  </span>


function RelayStats({mgr, eventsInfo}) {
  if ( !eventsInfo || !showDetailStatus ) return <span/>
  const {hour,day,week, month } = mgrStats(eventsInfo, mgr)
  const data = sparklineData(eventsInfo, mgr)
  return <div>
      {hour}/{day}/{week}/{month}
      { month!==0 && <SparkLine data={data}></SparkLine> }
      </div>
}

async function getBlockNumber(web3) {

  while (true) {
    try {
      console.log('== before getBlockNumber')
      return await web3.eth.getBlockNumber()
    }catch (e) {
      console.log('=== failed to get block, e=', e.message)
      await sleep(5000)
    } finally {
      console.log('== AFTER getBlockNumber')

    }
  }
}

// eslint-disable-next-line
async function getPastEvents(contract, eventName, options) {
    try {
        return await contract.getPastEvents(eventName, options)
    } catch(e) {
        const matchrange = e.message.match(/block range.*\b(\d+)/)
        if ( !matchrange )
            throw e
        const range = parseInt(matchrange[1])
        const web3 = contract.web3
        const last = options.toBlock || await getBlockNumber(web3)
        let list=[]
        const from = options.fromBlock
        for ( let i=last-range; (i-range) > from; i-= range ) {
            const newOptions = {...options, fromBlock: i, toBlock: i+range }
            console.log( '===', newOptions)
            list.push( contract.getPastEvents(eventName, newOptions ) )
        }
        console.log( '=== runnning parallel: ', list.length)
        const all = await Promise.all(list)
        return all.flat()
    }
}

    async function collectEventsInfo(web3,hub) {
        //calc time per block:
        const {number, timestamp}= await web3.eth.getBlock('latest')
        const N=100000
        const ts = await web3.eth.getBlock(number-N).then(b=>b.timestamp)
        const secPerBlock = (timestamp-ts) / N
        const blocksPerHour = Math.trunc(3600 / secPerBlock)
        let events = await hub.getPastEvents('TransactionRelayed', {fromBlock: number- blocksPerHour*24*40, toBlock: number})
        //hack to support old (alpha) relayhub events
        if ( events.length===0 ) {
          const hubAlpha = new web3.eth.Contract(RelayHubAlphaAbi, hub._address)

          events = await hubAlpha.getPastEvents('TransactionRelayed', {fromBlock: number- blocksPerHour*24*40, toBlock: number})
        }

        return {events, number, blocksPerHour}
    }

    function collectStats(collectEventsInfoRes, filter) {

        const {events, number, blocksPerHour} = collectEventsInfoRes
        let hour=0, day=0, week=0, month=0
        events.filter(filter).forEach(e=>{
          const blockPast = number - e.blockNumber
          if ( blockPast < blocksPerHour ) hour++
          if ( blockPast < blocksPerHour* 24 ) day++
          if ( blockPast < blocksPerHour* 24*7 ) week++
          if ( blockPast < blocksPerHour* 24*30 ) month++

        })
        return {hour,day,week,month}
    }

    function mgrFilter(worker) {
        return e=>e.returnValues.relayManager.toLowerCase() === worker.toLowerCase()
    }

    function sparklineData(collectEventsInfoRes, mgr) {
        if ( !collectEventsInfoRes) return []
        const filter = mgr ? mgrFilter(mgr) : (()=>true)
        const {events, number, blocksPerHour} = collectEventsInfoRes
	//bins are not "day" but "day/4" (should be renamed "bin")
        const historyDays = 30 * 2
        let blocksPerDay = 24 * blocksPerHour / 2;
        const lastMonthBlock = number - historyDays * blocksPerDay

        const counts =
            events.filter(filter).filter(e=>e.blockNumber > lastMonthBlock)
            .map( e=>  Math.round((e.blockNumber-lastMonthBlock)/blocksPerDay))
            .reduce((list,val)=>{list[val] = (list[val]||0)+1; return list}, [])

        //counts is a "sparse" array, with counts in all days, but "empty" on zero-days.
        // these zero-days are not "real" array elements: e.g. not returned by "forEach" etc.

        const ret = new Array(historyDays)
        for ( let i=1; i<=historyDays; i++ ) {
            ret[i-1] = counts[i] || 0
        }
        return ret
    }

    function hubStats(collectEventsInfoRes) {
        return collectStats(collectEventsInfoRes, ()=>true)
    }

    function mgrStats(collectEventsInfoRes, mgr) {
        return collectStats(collectEventsInfoRes, mgrFilter((mgr)))
    }

let Address = ({addr,network} ) => <a href={network.etherscan+addr} target="etherscan" >
      <font family="monospaces">{addr?addr.replace(/^0x/, "").slice(0,8)+"\u2026":'null'} </font></a>

class GsnStatus extends React.Component {

  async updateRelays() {

    let web3=this.web3

    let curBlockNumber = await getBlockNumber(web3)

      let net = this.props.networks[this.props.network];
      let blockhistorycount = net.lookupWindow || BLOCK_HISTORY_COUNT;
      console.log('== hist', blockhistorycount, net)
      let fromBlock=Math.max(1, curBlockNumber- blockhistorycount )
    let hub = new web3.eth.Contract(RelayHubAbi, this.state.network.RelayHub)

    //TODO: temporary solution, until we have a package that exposes getConfiguration
    // (we still need backward-compatible API to show older versions)
    let hubGetConfiguration = new web3.eth.Contract(getConfigurationAbi, this.state.network.RelayHub)

    hubGetConfiguration.methods.getConfiguration().call().then(async (conf)=>{
        this.state.hubstate.minstate = conf.minimumStake.toString()
        this.state.hubstate.unstakedelay = conf.minimumUnstakeDelay.toString()
        const curblock = await web3.eth.getBlock('latest')
        const pastblock = await web3.eth.getBlock(curblock.number-conf.minimumUnstakeDelay.toString())
        this.state.hubstate.unstakedelayDays = (curblock.timestamp-pastblock.timestamp)/3600/24
    }).catch(e=>{
      //older relayers, before conf
      hub.methods.minimumStake().call().then(s=>{this.state.hubstate.minstake =s.toString()/1e18})
      hub.methods.minimumUnstakeDelay().call().then(async (s)=>{
        this.state.hubstate.unstakedelay = s.toString()
        const curblock = await web3.eth.getBlock('latest')
        const pastblock = await web3.eth.getBlock(curblock.number-s.toString())
        this.state.hubstate.unstakedelayDays = (curblock.timestamp-pastblock.timestamp)/3600/24

      })
    })
    hub.methods.versionHub().call().then(ver=>{this.state.hubstate.version = ver.replace(/\+opengsn.*/,'')}).catch(err=>this.state.hubstate.version='(no version)')

    collectEventsInfo(web3,hub).then(res=>{
      this.eventsInfo=res
      this.state.hubstate.counts = hubStats(this.eventsInfo)
    }).finally(()=>{
      this.updateDisplay()
    })
    this.state.relaysDict={}
    this.state.ownersDict={}

    let relays = this.state.relaysDict

    hub.methods.stakeManager().call().then(async sma=>{
      let sm = new web3.eth.Contract(StakeManagerAbi, sma)
      let smEvents = await sm.getPastEvents(null,{fromBlock:0x1})
      smEvents.forEach(e=>{
        if ( e.event === 'HubUnauthorized' || e.event === 'StakeUnlocked') {
          //we don't know if we processs this unstaked/unlocked event or "RelayRegistered" event first.
          // so we mark it in removedRelays, AND remove it from relays, just in case..
          let relayManager = e.returnValues.relayManager
          removedRelays[relayManager] = 1
          console.log('== removing relay', net.name, e.event, relayManager, (relays[relayManager]||{}).url)
          delete relays[relayManager]
          this.updateDisplay()
        }
      })
    })
    let pastEventsAsync = hub.getPastEvents('RelayServerRegistered', {fromBlock});

    // let start = Date.now()
    let res = await pastEventsAsync
    // let elapsed = Date.now() - start
    // console.log( '===network=',this.state.network.name, "events time=", elapsed)

    let owners=this.state.ownersDict
    function owner(relay) {
            let h = relay.owner
            if ( !owners[h] ) {
                const url = relay.url || relay.relayUrl
                let name = ( (url+"/").match(/\b(\w+)(\.\w+)?(:\d+)?\//)||[])[1]
                owners[h] = {
                  addr: h,
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
    if ( status.level === 'green' ) {
      const net = this.props.network
      relayCounts[net] = relayCounts[net]+1 || 1
    }
    if (worker) {
      const rr = relays[r.relayManager]
		  rr.worker = worker
		  web3.eth.getBalance(worker).then(bal=>{
        if ( !rr.bal )
          rr.bal = []
        rr.bal[1] = bal / 1e18
        this.updateDisplay()
      })
	  } else {
      this.updateDisplay()
    }
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
          .then(bal => {
            const rr = relays[r.relayManager]
            if (rr) {
              if ( !rr.bal) rr.bal=[]
              rr.bal[0] = bal / 1e18;
              this.updateDisplay()
            }
          } )

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
      relays: [],
      hubstate: {
        counts:{}
      }
    }
    let network = props.networks[this.props.network]
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
    bal : (val) => <> <Balance val={(val||[])[0]} /> <Balance val={(val||[])[1]} /> </>,
    deposit : (val) => <Balance val={val} />,
    url : (val,row) =><><RelayUrl url={val} /><RelayStats mgr={row.addr} worker={row.worker} eventsInfo={this.eventsInfo} /></>,
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

      {/*eslint-disable-next-line*/}
     <a name={this.props.network}></a>
     <h3>Network: {netName(this.state.network)}</h3>
      RelayHub: <Address addr={this.state.network.RelayHub} network={this.state.network} />
      <HubStatus net={this.state.network.name} token={this.state.network.token} countsPerDay={sparklineData(this.eventsInfo)} ver={this.state.hubstate.version} counts={this.state.hubstate.counts} minstake={this.state.hubstate.minstake} unstakedelay={this.state.hubstate.unstakedelay} unstakedelayDays={this.state.hubstate.unstakedelayDays} />
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

function MyDataCol({val, row, header}) {
  if ( header.render )
    return header.render(val,row)
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
            {columns.map((h,j)=><td key={j}><MyDataCol val={row[h.id|| h.dataIndex]} row={row} header={h}/></td>)}
          </tr>)}
        </tbody>

    </Table>
}

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state=cookie.load('app') || { showAll:true }
  }

  componentDidMount () {
    axios.get('networks.js').then(ret => {
      try {
        const networks = eval(ret.data)
        this.setState({ networks })
      } catch (e) {
        this.setState({error: e.message})
      }
    })
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

    let onlyNet
    const m = window.location.href.match(/#.*only=([,\w]+)/)
    if ( m ) {
      onlyNet = m[1].split(/,/)
    }

    if ( !this.state.networks ) {
      return <>
        Loading...
        {this.state.error && <div>{this.state.error}</div>}
      </>
    }
    return <>
     <Card.Body>
    <h2>&nbsp;<img src="favicon.ico" height="50px" alt=""/> GSN (v2.2.2) Relay Servers</h2>

         <NetworkLinks networks={this.state.networks} relayCounts={relayCounts} />
        <button onClick={()=>globalevent.emit('refresh')}>Refresh</button>

      {false &&<>
        <ButtonGroup>
           <Form.Check type="checkbox" label="all networks" checked={this.state.showAll} onChange={()=>this.toggle('showAll')}/>
           &nbsp;&nbsp;&nbsp;
           <Form.Check type="checkbox" label="show owners" checked={this.state.showOwners} onChange={()=>this.toggle('showOwners')}/>
        </ButtonGroup>
      </>}
      {
        Object.keys(this.state.networks)
            .filter( net=>this.state.showAll ? true : net==="mainnet" )
            .filter( net=> onlyNet === undefined || onlyNet.includes(net) )
            .map( net=> <GsnStatus key={net} networks={this.state.networks} network={net} showOwners={this.state.showOwners} /> ) }
      <button onClick={()=>globalevent.emit('refresh')}>Refresh</button>

    </Card.Body></>
  }
}
export default App;
