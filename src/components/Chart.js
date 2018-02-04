import React, { Component } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';

class Chart extends Component {
  componentDidMount(){
    this.callApi();
  }
  callApi = async () => {
    const response = await fetch('http://localhost:3000/api/show');
    const body = await response.json();
    if (response.status != 200) {
      throw Error(body.message);
    }
    var priceArr = [];
    var indexArr = [];
    var averagePriceArr = [];
    var districtArr = [];
    var map = new Map();

    body.map((item) => {
      let price = parseInt(item.price.match(/\d+/));
      if (price) {
        priceArr.push(price);
      }
      indexArr.push(item.name);
      var district = item.where.substring(0,2);
      if (typeof (map.get(district)) == 'undefined') {
        if (price) {
          map.set(district, {
            count: 1,
            averagePrice: price
          });
        }
      } else {
        if (price) {
          var info = map.get(district);
          var newCount = info.count + 1;
          var newAverage = Math.round((info.averagePrice * info.count + price) / newCount);
          map.set(district, {
            count: newCount,
            averagePrice: newAverage
          });
        }
      }
    });
    map.forEach((value, key, map) => {
      averagePriceArr.push(value.averagePrice);
      districtArr.push(key);
    });
    console.log(map);
    console.log(districtArr);
    console.log(averagePriceArr);
    this.setState({
      chartData: {
        labels: indexArr,
          datasets: [{
            label: 'price',
            borderWidth: 1,
            data: priceArr
          }]
      },
      chartData2: {
        labels: districtArr,
          datasets: [{
            label: 'average price',
            borderWidth: 1,
            data: averagePriceArr
        }]
      }
    });
  }
  constructor(props){
    super(props);
    this.state = {
    }
  }
  render(){
    return(
      <div>
      <div className="chart">
      <Bar
       data={this.state.chartData}
       width={100}
       height={400}
       options={{
        maintainAspectRatio: false,
}}
/>
      </div>
      <div className="chart">
      <Bar
       data={this.state.chartData2}
       width={100}
       height={400}
       options={{
        maintainAspectRatio: false,
}}
/>
      </div>
      </div>
    )
  }
}

export default Chart;
