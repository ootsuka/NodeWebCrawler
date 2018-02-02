import React, { Component } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';

class Chart extends Component {
  constructor(props){
    super(props);
    this.state = {
      chartData: {
        labels: ["January", "February", "March", "April", "May", "June", "July"],
            datasets: [{
                label: 'Dataset 1',
                borderWidth: 1,
                data: [
                    10,
                    20,
                    5,
                    14,
                    17,
                    30,
                    40
                ]
            }, {
                label: 'Dataset 2',
                borderWidth: 1,
                data: [
                    32,
                    11,
                    -9,
                    8,
                    25,
                    49,
                    -20
                ]
            }]
      }
    }
  }
  render(){
    return(
      <div className="chart">
      <Bar
       data={this.state.chartData}
       width={100}
       height={200}
       options={{
        maintainAspectRatio: false
}}
/>
      </div>
    )
  }
}

export default Chart;