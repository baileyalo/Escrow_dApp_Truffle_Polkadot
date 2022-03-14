const Escrow = artifacts.require('Escrow');

// will a function call result in an error inside the smart contract
const assertError = async (promise, error) => {
    try {
        await promise;
    } catch (e) {
        assert(e.message.includes(error))
        return;
    }
    assert(false);
}

contract('Escrow', accounts => {
    let escrow = null;
    const [arbiter, buyer, recipient] = accounts;
    before(async () => {
        escrow = await Escrow.deployed();
    })
    it('Should deposit', async () => {
        await escrow.deposit({ from: buyer, value: 900 })
        
      
        const escrowBalance = parseInt(await web3.eth.getBalance(escrow.address));
        assert(escrowBalance === 900)
    });
    it('Should NOT deposit if the sender is not the buyer', async () => {
        assertError(
            escrow.deposit({ from: accounts[5], value: 100 }),
            'Sender must be the buyer'
        )
    });
    it('Should NOT deposit if transfer exceed amount', async () => {
        assertError(
            // Value has to be more than the amount declared in the escrow migration file
            escrow.deposit({ from: buyer, value: 2000 }),
            'Cant send more than escrow amount'
        );
    });
    it('Should NOT release funds if full amount has not been received', async () => {
        assertError(
            escrow.release({ from: arbiter }),
            'cannot release money before the full amount was sent'
        );
    });
    it('Should NOT release funds if the sender is not arbiter', async () => {
        await escrow.deposit({ from: buyer, value: 100 });
        assertError(
            escrow.release({ from: accounts[5] }),
            'Only arbiter can release funds'
        );
    });
    it('Should release funds', async () => {
        const balanceRecipientBefore = web3.utils.toBN(
            await web3.eth.getBalance(recipient)
        );
        await escrow.release({ from: arbiter })
        const balanceRecipientAfter = web3.utils.toBN(
            await web3.eth.getBalance(recipient)
        );
        assert(balanceRecipientAfter.sub(balanceRecipientBefore).toNumber() === 1000);
    })
})