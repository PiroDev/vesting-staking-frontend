import {createStore} from "vuex";
import {ethers} from "ethers";
import {abi as rewardTokenAbi} from '/src/abi/RewardToken.json';
import {abi as vestingAbi} from '/src/abi/LinearVesting.json';
import {abi as stakingAbi} from '/src/abi/Staking.json';

export default createStore({
    state: () => ({
        wallet: {
            address: null,
            balance: 0,
            isBalanceLoaded: false
        },
        token: {
            symbol: 'CRT',
            address: '0xf038F5F26aa62C761A59608DDd1716BE9550fA5a',
            decimalsDiv: 1e18
        },
    }),
    getters: {
        isWalletConnected: state => state.wallet.address !== null,
    },
    mutations: {
        setWalletAddress(state, address) {
            state.wallet.address = address;
        },
        setWalletBalance(state, balance) {
            state.wallet.balance = balance;
            state.wallet.isBalanceLoaded = true;
        },
        setBalanceToNotLoaded(state) {
            state.wallet.isBalanceLoaded = false;
        }
    },
    actions: {
        async connectMetamask({state, commit}) {
            if (typeof window.ethereum === 'undefined') {
                console.log('MetaMask is not installed!');
                return;
            }

            return ethereum.request({method: 'eth_requestAccounts'})
                .then(res => commit('setWalletAddress', res[0]))
                .catch(err => console.log(err));
        },
        async logout({commit}) {
            commit('setWalletAddress', null);
            commit('setBalanceToNotLoaded');
        },
        async updateUserBalance({state, commit}) {
            commit('setBalanceToNotLoaded');

            const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
            const rewardToken = new ethers.Contract(
                state.token.address,
                JSON.stringify(rewardTokenAbi),
                provider
            );

            return rewardToken.balanceOf(state.wallet.address)
                .then(res => commit('setWalletBalance', res.toNumber() / state.token.decimalsDiv))
                .catch(err => console.log(err));
        },
        // async web3req({state}) {
        //     const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
        //     const owner = new ethers.Wallet('0x0fb5bb3ec79c65923289ec6da8d14fd38812885c2c93e3f4fdf8cb15f3919469', provider);
        //     const rewardToken = new ethers.Contract(
        //         state.token.address,
        //         JSON.stringify(rewardTokenAbi),
        //         provider
        //     );
        //     console.log(await rewardToken.balanceOf(owner.address));
        // }
    }
});