import {createStore} from 'vuex';
import {BigNumber, Contract, ethers} from 'ethers';
import rewardTokenInfo from '/src/const/abi/RewardToken.json';
import vestingInfo from '/src/const/abi/LinearVesting.json';
import stakingInfo from '/src/const/abi/Staking.json';
import vestingIds from '/src/const/VestingId.js';
import {provider as providerUrl, contractAddresses} from '/src/const/info.json';
import {numstrToBN} from "/src/utils/formatting.js";

export default createStore({
    state: () => ({
        wallet: {
            address: null,
            balance: null,
            isLoaded: false,
            isStaking: false
        },
        rewardToken: {
            symbol: null,
            decimals: null
        },
        stakingStrategies: null,
        isNetworkConnected: false,
        metamask: {
            provider: null
        }
    }),
    getters: {
        isWalletConnected: state => state.wallet.address !== null
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
        },
        setIsUserStaking(state, isStaking) {
            state.wallet.isStaking = isStaking;
        },
        setNetworkConnected(state) {
            state.isNetworkConnected = true;
        },
        setMetamaskProvider(state, provider) {
            state.metamask.provider = () => provider;
        }
    },
    actions: {
        async connectMetamask({commit}) {
            if (typeof window.ethereum === 'undefined') {
                console.log('MetaMask is not installed!');
                return;
            }

            const provider = new ethers.providers.Web3Provider(ethereum);
            commit('setMetamaskProvider', provider);

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

            const provider = new ethers.providers.JsonRpcProvider(providerUrl);
            const rewardTokenContract = new ethers.Contract(
                contractAddresses.rewardToken,
                JSON.stringify(rewardTokenInfo.abi),
                provider
            );

            await dispatch('loadTokenInfo');

            const balance = await rewardTokenContract.balanceOf(state.wallet.address);
            commit('setWalletBalance', balance);
        },
        async loadContractsInfo({commit, dispatch}) {
            const provider = new ethers.providers.JsonRpcProvider(providerUrl);

            const stakingContract = new ethers.Contract(
                contractAddresses.staking,
                JSON.stringify(stakingInfo.abi),
                provider
            );

            const stakingStrategies = [];
            const day = 24 * 3600;

            try {
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
                        tvl: tvl,
                        duration: (cliff.toNumber() + release.toNumber()) / day,
                        vesting: {
                            cliff: cliff.toNumber() / day,
                            release: release.toNumber() / day
                        },
                        rewardsPerDay
                    };
                    stakingStrategies.push(staking);
                }
            } catch (err) {
                console.log('load contract info err:', err);
            }

            commit('setStakingStrategies', stakingStrategies);
            dispatch('loadTokenInfo');
        },
        async loadTokenInfo({commit}) {
            const provider = new ethers.providers.JsonRpcProvider(providerUrl);
            await provider.ready;
            commit('setNetworkConnected');

            const tokenContract = new ethers.Contract(
                contractAddresses.rewardToken,
                JSON.stringify(rewardTokenInfo.abi),
                provider
            );

            try {
                const symbol = await tokenContract.symbol();
                const decimals = await tokenContract.decimals();
                commit('setRewardToken', {symbol, decimals});
            } catch (err) {
                console.log('load token info err:', err);
            }
        },
        async loadUserStakingInfo({state, commit}) {
            if (state.wallet.isLoaded === false) {
                return;
            }

            const stakingContract = new ethers.Contract(
                contractAddresses.staking,
                JSON.stringify(stakingInfo.abi),
                state.metamask.provider()
            );

            const staker = await stakingContract.stakers(state.wallet.address);
            const isUserStaking = staker.vesting !== 0;
            commit('setIsUserStaking', isUserStaking);
        },
        async stake({state, commit, dispatch}, {strategy, stakeSize}) {
            const signer = await state.metamask.provider().getSigner();

            const stakingContract = new ethers.Contract(
                contractAddresses.staking,
                JSON.stringify(stakingInfo.abi),
                signer
            );

            const tokenContract = new ethers.Contract(
                contractAddresses.rewardToken,
                JSON.stringify(rewardTokenInfo.abi),
                signer
            );


            stakeSize = numstrToBN(stakeSize.toString());

            await tokenContract.approve(stakingContract.address, stakeSize);
            await stakingContract.stake(strategy, stakeSize);
            await dispatch('updateUserBalance');
            commit('setIsUserStaking', true);
        }
    }
});