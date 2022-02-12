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
            balance: null,
            isLoaded: false
        },
        rewardToken: {
            symbol: null,
            decimals: null
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
        },
        setRewardToken(state, rewardToken) {
            state.rewardToken = rewardToken;
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
        async updateUserBalance({state, commit, dispatch}) {
            commit('setBalanceToNotLoaded');

            const provider = new ethers.providers.JsonRpcProvider(rewardTokenInfo.provider);
            const rewardTokenContract = new ethers.Contract(
                rewardTokenInfo.address,
                JSON.stringify(rewardTokenInfo.abi),
                provider
            );

            await dispatch('loadTokenInfo');

            return rewardTokenContract.balanceOf(state.wallet.address)
                .then(res => commit('setWalletBalance', res))
                .catch(err => console.log(err));
        },
        async loadContractsInfo({commit, dispatch}) {
            const provider = new ethers.providers.JsonRpcProvider(stakingInfo.provider);

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
                const rewardsPerDay = vesting['rewardsPerDay'];
                const tvl = await stakingContract.totalStaked(id);

                let staking = {
                    id,
                    tvl: tvl.toNumber(),
                    duration: (cliff.toNumber() + release.toNumber()) / day,
                    vesting: {
                        cliff: cliff.toNumber() / day,
                        release: release.toNumber() / day
                    },
                    rewardsPerDay: rewardsPerDay.toNumber()
                };
                stakingStrategies.push(staking);
            }

            commit('setStakingStrategies', stakingStrategies);
            dispatch('loadTokenInfo');
        },
        async loadTokenInfo({commit}) {
            const provider = new ethers.providers.JsonRpcProvider(rewardTokenInfo.provider);
            const tokenContract = new ethers.Contract(
                rewardTokenInfo.address,
                JSON.stringify(rewardTokenInfo.abi),
                provider
            );

            const symbol = await tokenContract.symbol();
            const decimals = await tokenContract.decimals();
            commit('setRewardToken', {symbol, decimals});
        }
    }
});