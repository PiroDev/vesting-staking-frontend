import {createStore} from 'vuex';
import {Contract, ethers} from 'ethers';
import rewardTokenInfo from '/src/const/RewardToken.json';
import vestingInfo from '/src/const/LinearVesting.json';
import stakingInfo from '/src/const/Staking.json';
import vestingIds from '/src/const/Vesting.js';

export default createStore({
    state: () => ({
        wallet: {
            address: null,
            balance: 0,
            isLoaded: false
        },
        rewardToken: {
            symbol: 'CRT',
            decimals: 18
        },
        stakingStrategies: null
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
            state.wallet.isLoaded = true;
        },
        setBalanceToNotLoaded(state) {
            state.wallet.isLoaded = false;
        },
        setStakingStrategies(state, stakingStrategies) {
            state.stakingStrategies = stakingStrategies;
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

            const provider = new ethers.providers.JsonRpcProvider(rewardTokenInfo.provider);
            const rewardTokenContract = new ethers.Contract(
                rewardTokenInfo.address,
                JSON.stringify(rewardTokenInfo.abi),
                provider
            );

            return rewardTokenContract.balanceOf(state.wallet.address)
                .then(res => commit('setWalletBalance', res.toNumber() / Math.pow(10, state.rewardToken.decimals)))
                .catch(err => console.log(err));
        },
        async loadContractsInfo({commit}) {
            const provider = new ethers.providers.JsonRpcProvider(stakingInfo.provider);
            console.log(provider);

            const stakingContract = new ethers.Contract(
                stakingInfo.address,
                JSON.stringify(stakingInfo.abi),
                provider
            );

            const stakingStrategies = [];
            const day = 24 * 3600;
            for (const id of vestingIds) {
                const vesting = await stakingContract.vestings(id);
                const vestingContract = new ethers.Contract(
                    vesting['strategy'],
                    JSON.stringify(vestingInfo.abi),
                    provider
                );
                const release = await vestingContract.releaseDuration();
                const cliff = await vestingContract.cliffDuration();
                const reward = vesting['rewardsPerDay'];

                let staking = {
                    id,
                    duration: (cliff.toNumber() + release.toNumber()) / day,
                    vesting: {
                        cliff: cliff.toNumber() / day,
                        release: release.toNumber() / day
                    },
                    reward: reward.toNumber()
                };
                stakingStrategies.push(staking);
            }

            commit('setStakingStrategies', stakingStrategies);
        }
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