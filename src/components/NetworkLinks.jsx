import React from 'react'
import {networks} from "../networks";

/**
 * create a table of links to various networks
 * the networks array is keyed by network unique ID (which we use as anchor)
 * we group networks based on net.group (ethereum, classic, binance, etc)
 * within each group, the "mainnet" is the first.
 */
export class NetworkLinks extends React.Component {

    render() {
        let networkArray = Object.values(networks);
        const netGroups = networkArray.map(n => n.group).reduce((set, g) => ({
            ...set,
            [g]: Object.keys(networks).filter(net => networks[net].group === g)
        }), {})

        return <table>
            {Object.keys(netGroups).map(g => <tr key={g}>
                <td>{g}:</td>
                <td>
                    {netGroups[g].map((net, index) => {
                        return <span key={index}> {index > 0 ? ", " : ""}<a href={"#" + net}>{networks[net].name}</a> </span>
                    })}
                </td>
            </tr>)}
        </table>
    }
}
