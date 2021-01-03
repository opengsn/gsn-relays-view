import React from 'react'
import SparklineObject  from "sparklines";

export class SparkLine extends React.Component {
    constructor(props) {
        super(props)
        this.sparkRef = React.createRef()
        if ( props.data.length>0 ) {
            console.log('=== spark data=', props.id, props.data)
        }
    }

    render() {
        if ( this.sparks ) {
            this.sparks.draw(this.props.data)
        }
        return <span ref={this.sparkRef}></span>
    }

    componentDidMount() {
        this.sparks = new SparklineObject(this.sparkRef.current, {})
        this.sparks.draw(this.props.data)
    }
}
