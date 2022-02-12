<template>
  <div class="h-full w-full flex flex-col justify-between">
    <div class="h-1/6 w-full flex items-center justify-between">
      <div class="text-3xl font-extrabold">Staking with Vesting</div>
    </div>
    <div class="h-4/6 w-full flex flex-col justify-around">
      <div class="h-3/6 flex justify-around">
        <div
            v-for="staking in $store.state.stakingStrategies"
            key="{{staking.id}}"
            class="w-1/3 flex flex-col justify-around rounded-3xl px-6 shadow-lg select-none hover:cursor-pointer"
            :class="{ 'bg-selection-color': isSelected(staking.id) }"
            @click="selectStrategy(staking.id)"
        >
          <div class="text-2xl font-bold">{{ staking.duration }} Days</div>
          <div class="text-[#db5f54] font-bold">Rewards pool (daily): {{
              staking.rewardsPerDay + ' ' + tokenSymbol
            }}
          </div>
          <div class="text-[#db5f54] font-bold">APY: {{ calcAPY[staking.id - 1] }}</div>
          <div>Linear vesting with {{ staking.vesting.cliff }} days cliff and {{ staking.vesting.release }} days vesting
            period
          </div>
        </div>
      </div>

      <div class="h-1/4 flex flex-col justify-between" v-if="isWalletConnected">
        <div class="h-1/2 flex items-center">
          <input type="text" v-model.number="stake"
                 class="w-full border border-gray-200 pl-2 py-3 rounded-lg focus:outline-none">
        </div>
        <div class="h-1/4 flex items-center">
          <div>Reward for {{ stakingStrategies[selectedStrategy - 1].duration }} days (with current TVL):</div>
          <div class="text-[#db5f54] text-lg font-bold ml-2">{{ calcRewardsPerMonth[selectedStrategy - 1] }}</div>
        </div>
      </div>
      <div class="h-2/6 flex items-center" v-else>
        <div class="h-1/2 pl-2 w-full flex items-center border border-gray-200 rounded-xl bg-selection-color">
          To perform actions on the page, connect your wallet
        </div>
      </div>

    </div>
    <div class="h-1/6 w-full flex justify-between items-center">
      <div
          class="w-1/5 h-2/3 flex justify-center items-center bg-main-color rounded-xl hover:cursor-pointer select-none"
          v-if="isWalletConnected">
        Stake
      </div>
      <div
          class="w-1/5 h-2/3 flex justify-center items-center bg-main-color rounded-xl hover:cursor-pointer select-none"
          v-else @click="connectWallet">
        Connect wallet
      </div>
      <div
          class="w-1/5 h-2/3 flex justify-center items-center border border-gray-200 rounded-xl hover:cursor-pointer select-none">
        View Contract
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapState} from 'vuex';
import {BNToNumstr, numstrToBN} from "/src/utils/formatting.js";
import {BigNumber} from "ethers";

export default {
  data() {
    return {
      stake: 100,
      selectedStrategy: 1
    }
  },
  computed: {
    ...mapGetters([
      'isWalletConnected'
    ]),
    ...mapState({
      stakingStrategies: state => state.stakingStrategies,
      tokenSymbol: state => state.rewardToken.symbol
    }),
    calcAPY() {
      let apys = [];

      if (this.isWalletConnected === false) {
        apys = '-'.repeat(this.stakingStrategies.length).split('');
      } else {
        this.stakingStrategies.forEach(staking => {
          let newTvl = staking.tvl + this.stake;

          if (newTvl <= 0) {
            newTvl = 0;
          }

          let apy = null;
          try {
            apy = numstrToBN((staking.rewardsPerDay * 365 * 100 / newTvl).toString());
            apy = BNToNumstr(apy) + '%';
          } catch {
            apy = '0%';
          }

          apys.push(apy);
        });
      }

      return apys;
    },
    calcRewardsPerMonth() {
      let rpms = [];

      if (this.isWalletConnected === false) {
        rpms = '-'.repeat(this.stakingStrategies.length).split('');
      } else {
        this.stakingStrategies.forEach(staking => {
          let newTvl = staking.tvl + this.stake;
          if (newTvl <= 0) {
            newTvl = 0;
          }

          let rpm = null;
          try {
            rpm = numstrToBN((staking.rewardsPerDay * 31 * this.stake / newTvl).toString());
            rpm = BNToNumstr(rpm) + ' ' + this.tokenSymbol;
          } catch {
            rpm = '0 ' + this.tokenSymbol;
          }
          rpms.push(rpm);
        });
      }

      return rpms;
    }
  },
  methods: {
    ...mapActions([
      'connectMetamask',
      'updateUserBalance'
    ]),
    connectWallet() {
      this.connectMetamask()
          .then(() => this.updateUserBalance());
    },
    isSelected(id) {
      return this.isWalletConnected && this.selectedStrategy === id;
    },
    selectStrategy(id) {
      this.selectedStrategy = id;
    }
  }
}
</script>

<style scoped>

</style>
