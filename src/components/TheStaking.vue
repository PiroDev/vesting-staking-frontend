<template>
  <div class="flex grow flex-col">
    <div class="flex items-center mb-5 tablet:mb-10 laptop-xl:mb-16">
      <div class="basis-5/6 text-2xl font-extrabold tablet:text-3xl laptop:text-4xl laptop-xl:text-5xl">Staking with Vesting</div>
    </div>
    <div class="flex flex-col justify-around items-center tablet:flex-row">
        <div
            v-for="staking in $store.state.stakingStrategies"
            key="{{staking.id}}"
            class="w-full mb-3 flex flex-col rounded-3xl px-5 py-4 shadow-lg select-none hover:cursor-pointer
                   tablet:mb-0 tablet:mr-4 tablet:basis-[300px] laptop-lg:basis-[320px]"
            :class="{ 'bg-selection-color': isSelected(staking.id) }"
            @click="selectStrategy(staking.id)"
        >
          <div class="text-xl font-bold tablet:text-2xl laptop:text-3xl laptop-xl:text-4xl">{{ staking.duration }} Days</div>
          <div class="text-[#db5f54] font-bold text-base laptop:text-lg laptop-xl:text-xl">Daily pool: {{
              staking.rewardsPerDay + ' ' + tokenSymbol
            }}
          </div>
          <div class="text-[#db5f54] font-bold text-base laptop:text-lg laptop-xl:text-xl">APY: {{ calcAPY[staking.id - 1] }}</div>
          <div class="text-base laptop:text-lg laptop-xl:text-xl">{{ staking.vesting.cliff }} days cliff and {{ staking.vesting.release }} days vesting period
          </div>
        </div>
      </div>
    <div class="flex flex-col justify-between mt-2 mb-4 tablet:mt-10 tablet:mb-10 laptop-xl:mt-14 laptop-xl:mb-10" v-if="isWalletConnected && !isStaking">
      <div class="flex items-center mb-2 tablet:mb-6">
        <input type="text" v-model.number="stake" class="w-full border border-gray-200 pl-2 py-3 rounded-lg focus:outline-none
                                                         text-base laptop:text-lg laptop-xl:text-xl">
      </div>
      <div class="flex items-center">
        <div class="text-base laptop:text-lg laptop-xl:text-xl">Reward for {{ stakingStrategies[selectedStrategy - 1].duration }} days:</div>
        <div class="text-[#db5f54] text-lg font-bold ml-2 laptop:text-xl laptop-xl:text-2xl">{{ calcRewardsPerMonth[selectedStrategy - 1] }}</div>
      </div>
    </div>
    <div class="py-2 px-6 mt-8 mb-8 w-full flex items-center border border-gray-200 rounded-xl bg-selection-color
                tablet:py-4" v-else-if="!isWalletConnected">
      To perform actions on the page, connect your wallet
    </div>
    <div v-else>
      User is staking
    </div>
    <div class="flex flex-col justify-between items-center tablet:flex-row">
      <div
          class="basis-[56px] mb-4 w-full flex justify-center items-center bg-main-color rounded-xl hover:cursor-pointer select-none
                 tablet:basis-[230px] tablet:h-[56px] laptop:text-lg laptop-xl:text-xl"
          v-if="isWalletConnected">
        Stake
      </div>
      <div
          class="basis-[56px] mb-4 w-full flex justify-center items-center bg-main-color rounded-xl hover:cursor-pointer select-none
                 tablet:basis-[230px] tablet:h-[56px] laptop:text-lg laptop-xl:text-xl"
          v-else @click="connectWallet">
        Connect wallet
      </div>
      <div
          class="basis-[56px] w-full flex justify-center items-center border border-gray-200 rounded-xl hover:cursor-pointer select-none
                 tablet:basis-[230px] tablet:h-[56px] laptop:text-lg laptop-xl:text-xl">
        View Contract
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapState} from 'vuex';
import {BNToNumstr, numstrToBN} from "/src/utils/formatting.js";

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
      tokenSymbol: state => state.rewardToken.symbol,
      isStaking: state => state.wallet.isStaking
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
      'updateUserBalance',
      'loadUserStakingInfo'
    ]),
    connectWallet() {
      this.connectMetamask()
          .then(() => this.updateUserBalance())
          .then(() => this.loadUserStakingInfo());
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
