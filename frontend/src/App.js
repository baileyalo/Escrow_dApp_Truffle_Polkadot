import React, { Component } from 'react';
import getWeb3 from "./utils";
import './App.css';
import Escrow from './Escrow.json';




class App extends Component {
  state = {
    web3: null,
    accounts: [],
    currentAccount: null,
    contract: null,
    balance: null,
   
  }

  async componentDidMount() {
    let web3 = await getWeb3();


    const accounts = await web3.eth.getAccounts();

    const networkId =  await web3.eth.net.getId();
    const deployedNetwork = await Escrow.networks[networkId];
    const instance = new web3.eth.Contract(
      Escrow.abi,
     deployedNetwork && deployedNetwork.address
    )
    this.setState({ web3, accounts, contract: instance }, this.update())
  }

  async update() {
    const {  contract } = this.state;
    
    const balance = await contract.methods.balanceOf().call();
  
    this.setState({ balance });
  }

  async deposit(e) {
    e.preventDefault();
    const { contract, accounts } = this.state;
    await contract.methods.deposit().send({
      from: accounts[0],
      value: e.target.elements[0].value
    });
    this.update()
  }
  async release(e) {
  e.preventDefault();
  const { contract, accounts } = this.state;
  await contract.methods.release().send({
    from: accounts[0]
  });
  this.update()
  }

  render() {
    const { balance } = this.state;
    if(!this.state.web3) {
      return <div>Loading....</div>
    }
    return (
      <div className="App">
       <h1> Escrow</h1>
  
       <div>
         <p> Balance:   <b>{balance}</b>DEV</p>
       </div>
        <div>
          <form onSubmit={e => this.deposit(e)}>
            <div>
            <label> Deposit</label>
            <input type="number" placeholder="Deposit"></input>
            </div>
            
            <button type="submit">Submit</button>
          </form>
        </div>
        <div>
        
          <button onClick={e => this.release(e)} type="submit">Release</button>
        </div>
      </div>
    );
  }
}

export default App;