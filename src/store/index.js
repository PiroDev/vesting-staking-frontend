import {createStore} from 'vuex';
import {ethers} from 'ethers';
import rewardTokenInfo from '/src/const/abi/RewardToken.json';
import vestingInfo from '/src/const/abi/LinearVesting.json';
import stakingInfo from '/src/const/abi/Staking.json';
import vestingIds from '/src/const/VestingId.js';
import {provider as providerUrl, contractAddresses} from '/src/const/info.json';
import {numstrToBN} from "/src/utils/formatting.js";

const provider = new ethers.providers.JsonRpcProvider(providerUrl);

const rewardTokenContract = new ethers.Contract(
    contractAddresses.rewardToken,
    JSON.stringify(rewardTokenInfo.abi),
    provider
);

const stakingContract = new ethers.Contract(
    contractAddresses.staking,
    JSON.stringify(stakingInfo.abi),
    provider
);

const day = 24 * 3600;

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
        metamask: {
            provider: null
        },
        stakingVesting: {
            vestingId: null,
            startTime: null,
            endTime: null,
            initStake: null,
            currStake: null,
            claimedRewards: null,
            couldBeUnstaked: null
        },
        isTxPending: false
    }),
    getters: {
        isWalletConnected: state => state.wallet.address !== null,
        getSigner: state => state.metamask.provider().getSigner()
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
        setMetamaskProvider(state, provider) {
            state.metamask.provider = () => provider;
        },
        setStakingVesting(state, stakingVesting) {
            state.stakingVesting = stakingVesting;
        },
        setIsTxPending(state, isTxPending) {
            state.isTxPending = isTxPending;
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
        logout({commit}) {
            commit('setWalletAddress', null);
            commit('setBalanceToNotLoaded');
            commit('setIsUserStaking', false);
        },
        async updateUserBalance({state, commit, dispatch}) {
            commit('setBalanceToNotLoaded');

            await dispatch('loadTokenInfo');
            const balance = await rewardTokenContract.balanceOf(state.wallet.address);
            commit('setWalletBalance', balance);
        },
        async loadContractsInfo({commit, dispatch}) {
            commit('setIsTxPending', true);

            const stakingStrategies = [];
            try {
                for (const id of vestingIds) {
                    const vesting = await stakingContract.vestings(id);
                    const vestingContract = new ethers.Contract(
                        vesting['strategy'],
                        JSON.stringify(vestingInfo.abi),
                        provider
                    );

                    const [release, cliff, rewardsPerDay, tvl] = await Promise.all([
                        vestingContract.releaseDuration(),
                        vestingContract.cliffDuration(),
                        vesting['rewardsPerDay'],
                        stakingContract.totalStaked(id)
                    ]);

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
            await dispatch('loadTokenInfo');
            commit('setIsTxPending', false);
        },
        async loadTokenInfo({commit}) {
            commit('setIsTxPending', true);
            try {
                const [symbol, decimals] = await Promise.all([
                    rewardTokenContract.symbol(),
                    rewardTokenContract.decimals()
                ]);
                commit('setRewardToken', {symbol, decimals});
            } catch (err) {
                console.log(err);
            }
            commit('setIsTxPending', false);
        },
        async loadUserStakingInfo({state, getters, commit, dispatch}) {
            if (state.wallet.isLoaded === false) {
                return;
            }

            commit('setIsTxPending', true);
            const staker = await stakingContract.stakers(state.wallet.address);
            const isUserStaking = staker.vesting !== 0;
            commit('setIsUserStaking', isUserStaking);

            if (isUserStaking === true) {
                await dispatch('loadContractsInfo');
                const stake = staker.stake;
                const duration = state.stakingStrategies[staker.vesting - 1].duration;
                const claimedRewards = await stakingContract.claimedRewards(state.wallet.address);
                const signer = getters.getSigner;
                const couldBeUnstaked = await stakingContract.connect(signer).howMuchToClaimIsLeft();

                const stakingVesting = {
                    startTime: stake.startTime,
                    endTime: stake.startTime.add(duration * day),
                    initStake: stake.initialSize,
                    currStake: stake.currentSize,
                    claimedRewards,
                    couldBeUnstaked,
                    vestingId: staker.vesting
                }
                commit('setStakingVesting', stakingVesting);
            }
            commit('setIsTxPending', false);
        },
        async stake({commit, getters, dispatch}, {strategy, stakeSize}) {
            const signer = getters.getSigner;

            stakeSize = numstrToBN(stakeSize.toString());

            try {
                commit('setIsTxPending', true);
                let tx = await rewardTokenContract.connect(signer).approve(stakingContract.address, stakeSize);
                await tx.wait();
                tx = await stakingContract.connect(signer).stake(strategy, stakeSize);
                await tx.wait();

                await dispatch('updateUserBalance');
                await dispatch('loadUserStakingInfo');

                commit('setIsUserStaking', true);
            } catch (err) {
                console.log(err);
            } finally {
                commit('setIsTxPending', false);
            }
        },
        async unstake({commit, getters, dispatch}, amount) {
            amount = numstrToBN(amount.toString());

            try {
                const signer = getters.getSigner;

                commit('setIsTxPending', true);
                const tx = await stakingContract.connect(signer).unstake(amount);
                await tx.wait();

                await dispatch('updateUserBalance');
                await dispatch('loadUserStakingInfo');
            } catch (err) {
                console.log(err);
            } finally {
                commit('setIsTxPending', false);
            }
        },
        async claimRewards({getters, commit, dispatch}) {
            const signer = getters.getSigner;
            try {
                commit('setIsTxPending', true);
                const tx = await stakingContract.connect(signer).claimRewards();
                await tx.wait();

                await dispatch('updateUserBalance');
                await dispatch('loadUserStakingInfo');
            } catch (err) {
                console.log(err);
            } finally {
                commit('setIsTxPending', false);
            }
        }
    }
});