<template>
  <div class="flex grow flex-col">
    <div class="flex items-center mb-5 tablet:mb-10 laptop-xl:mb-16">
      <div class="basis-5/6 text-2xl font-extrabold tablet:text-3xl laptop:text-4xl laptop-xl:text-5xl">
        Staking with Vesting
      </div>
    </div>
    <div class="flex flex-col justify-around items-center tablet:flex-row" v-if="!isStaking">
      <div
          v-for="staking in $store.state.stakingStrategies"
          key="{{staking.id}}"
          class="w-full mb-3 flex flex-col rounded-3xl px-5 py-4 shadow-lg select-none hover:cursor-pointer
                   tablet:mb-0 tablet:mr-4 tablet:basis-[300px] laptop-lg:basis-[320px]"
          :class="{ 'bg-selection-color': isSelected(staking.id) }"
          @click="selectStrategy(staking.id)"
      >
        <div class="text-xl font-bold tablet:text-2xl laptop:text-3xl laptop-xl:text-4xl">{{ staking.duration }} Days
        </div>
        <div class="text-[#db5f54] font-bold text-base laptop:text-lg laptop-xl:text-xl">Daily pool: {{
            dailyPool[staking.id - 1]
          }}
        </div>
        <div class="text-[#db5f54] font-bold text-base laptop:text-lg laptop-xl:text-xl">APY: {{
            calcAPY[staking.id - 1]
          }}
        </div>
        <div class="text-base laptop:text-lg laptop-xl:text-xl">{{ staking.vesting.cliff }} days cliff and
          {{ staking.vesting.release }} days vesting period
        </div>
      </div>
    </div>
    <div class="flex flex-col items-center" v-else>
      <div class="w-full mb-2 p-2 text-lg font-bold text-[#db5f54] tablet:text-2xl laptop:text-3xl laptop-xl:text-4xl">
        {{ claimedRewards }}
      </div>
      <div class="flex justify-between w-full bg-selection-color mb-2 p-3 rounded-lg laptop:text-lg laptop-xl:text-xl">
        <div>From</div>
        <div class="font-bold">{{ formattedDate.start }}</div>
      </div>
      <div class="flex justify-between w-full bg-selection-color mb-2 p-3 rounded-lg laptop:text-lg laptop-xl:text-xl">
        <div>To</div>
        <div class="font-bold">{{ formattedDate.end }}</div>
      </div>
      <div class="flex justify-between w-full bg-selection-color mb-2 p-3 rounded-lg laptop:text-lg laptop-xl:text-xl">
        <div>Initial stake</div>
        <div class="font-bold">{{ initialStake }}</div>
      </div>
      <div class="flex justify-between w-full bg-selection-color mb-2 p-3 rounded-lg laptop:text-lg laptop-xl:text-xl">
        <div>Current stake</div>
        <div class="font-bold">{{ currentStake }}</div>
      </div>
      <div class="flex justify-between w-full bg-selection-color mb-2 p-3 rounded-lg laptop:text-lg laptop-xl:text-xl">
        <div>APY</div>
        <div class="font-bold">{{ currentApy }}</div>
      </div>
      <div class="flex justify-between w-full bg-selection-color mb-2 p-3 rounded-lg laptop:text-lg laptop-xl:text-xl">
        <div>Could be unstaked</div>
        <div class="font-bold">{{ couldBeUnstaked }}</div>
      </div>
    </div>
    <div class="flex flex-col justify-between mt-2 mb-4 tablet:mt-10 tablet:mb-10 laptop-xl:mt-14 laptop-xl:mb-10"
         v-if="isWalletConnected"
         :class="{'tablet:mb-0': isStaking, 'laptop-xl:mb-0': isStaking}">
      <div class="flex items-center mb-2 tablet:mb-6">
        <input type="text" v-model.number="inputValue" class="w-full border border-gray-200 pl-2 py-3 rounded-lg focus:outline-none
                                                         text-base laptop:text-lg laptop-xl:text-xl">
      </div>
      <div class="flex items-center" v-if="!isStaking">
        <div class="text-base laptop:text-lg laptop-xl:text-xl">Reward for
          {{ stakingStrategies[selectedStrategy - 1].duration }} days:
        </div>
        <div class="text-[#db5f54] text-lg font-bold ml-2 laptop:text-xl laptop-xl:text-2xl">
          {{ calcRewardsPerMonth[selectedStrategy - 1] }}
        </div>
      </div>
    </div>
    <div class="py-2 px-6 mt-8 mb-8 w-full flex items-center border border-gray-200 rounded-xl bg-selection-color
                tablet:py-4" v-else>
      To perform actions on the page, connect your wallet
    </div>
    <div class="flex flex-col justify-between items-center tablet:flex-row">
      <div class="w-full flex flex-col tablet:flex-row tablet:items-center">
        <div
            class="basis-[56px] mb-4 flex justify-center items-center bg-main-color rounded-xl hover:cursor-pointer select-none
                 tablet:mr-3 tablet:mb-0 tablet:basis-[230px] tablet:h-[56px] laptop:text-lg laptop-xl:text-xl"
            @click="buttonParams.handler" :class="{'opacity-50 hover:cursor-not-allowed': isTxPending}">
          {{ buttonParams.text }}
        </div>
        <div class="basis-[56px] mb-4 flex justify-center items-center bg-[#B7C6D8] rounded-xl hover:cursor-pointer select-none
                    tablet:mb-0 tablet:basis-[230px] tablet:h-[56px] laptop:text-lg laptop-xl:text-xl" v-if="isStaking"
                    :class="{'opacity-50 hover:cursor-not-allowed': isTxPending}">
          Claim Rewards
        </div>
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
import {BNToNumstr, dateTimeFromUnix, numstrToBN} from "/src/utils/formatting.js";
import {BigNumber} from "ethers";

export default {
  data() {
    return {
      inputValue: 100,
      selectedStrategy: 1
    }
  },
  computed: {
    ...mapGetters([
      'isWalletConnected'
    ]),
    ...mapState({
      stakingStrategies: state => state.stakingStrategies,
      token: state => state.rewardToken,
      isStaking: state => state.wallet.isStaking,
      stakingVesting: state => state.stakingVesting,
      isTxPending: state => state.isTxPending
    }),
    calcAPY() {
      let apys = [];

      if (this.isWalletConnected === false) {
        apys = '-'.repeat(this.stakingStrategies.length).split('');
      } else {
        this.stakingStrategies.forEach(staking => {
          let newTvl = staking.tvl.add(this.inputValue);

          if (newTvl <= 0) {
            newTvl = 0;
          }

          let apy = null;
          try {
            apy = BNToNumstr(staking.rewardsPerDay.mul(365).mul(100).div(newTvl), this.token.decimals) + '%';
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
          let newTvl = staking.tvl.add(this.inputValue);
          if (newTvl <= 0) {
            newTvl = 0;
          }

          let rpm = null;
          try {
            rpm = BNToNumstr(staking.rewardsPerDay.mul(31).mul(this.inputValue).div(newTvl), this.token.decimals) + ' ' + this.token.symbol;
          } catch {
            rpm = '0 ' + this.token.symbol;
          }
          rpms.push(rpm);
        });
      }

      return rpms;
    },
    dailyPool() {
      let rewards = [];
      this.stakingStrategies.forEach(staking => {
        let reward = BNToNumstr(staking.rewardsPerDay) + ' ' + this.token.symbol;
        rewards.push(reward);
      });

      return rewards;
    },
    buttonParams() {
      let text = 'Connect wallet';
      let handler = this.connectWallet;

      if (this.isWalletConnected) {
        if (this.isStaking) {
          text = 'Unstake';
          handler = this.onUnstakeClick;
        } else {
          text = 'Stake';
          handler = this.onStakeClick;
        }
      }

      return {text, handler};
    },
    formattedDate() {
      if (this.stakingVesting.startTime === null || this.isTxPending === true) {
        return {start: 'Loading...', end: 'Loading...'};
      }

      const start = dateTimeFromUnix(this.stakingVesting.startTime.toNumber());
      const end = dateTimeFromUnix(this.stakingVesting.endTime.toNumber());
      return {start, end}
    },
    initialStake() {
      if (this.stakingVesting.initStake === null || this.isTxPending === true) {
        return 'Loading...';
      }

      return BNToNumstr(this.stakingVesting.initStake, this.token.decimals).toString() + ' ' + this.token.symbol;
    },
    currentStake() {
      if (this.stakingVesting.currStake === null || this.isTxPending === true) {
        return 'Loading...';
      }

      return BNToNumstr(this.stakingVesting.currStake, this.token.decimals).toString() + ' ' + this.token.symbol;
    },
    currentApy() {
      if (this.stakingVesting.currStake === null || this.isTxPending === true) {
        return 'Loading...';
      }

      const vesting = this.stakingStrategies[this.stakingVesting.vestingId - 1];

      return vesting.rewardsPerDay.mul(365).mul(100).div(vesting.tvl).toNumber() + '%';
    },
    couldBeUnstaked() {
      if (this.stakingVesting.couldBeUnstaked === null || this.isTxPending === true) {
        return 'Loading...';
      }

      return BNToNumstr(this.stakingVesting.couldBeUnstaked, this.token.decimals).toString() + ' ' + this.token.symbol;
    },
    claimedRewards() {
      if (this.stakingVesting.claimedRewards === null || this.isTxPending === true) {
        return 'Loading...';
      }

      return BNToNumstr(this.stakingVesting.claimedRewards, this.token.decimals).toString() + ' ' + this.token.symbol + ' earned';
    }
  },
  methods: {
    ...mapActions([
      'connectMetamask',
      'updateUserBalance',
      'loadUserStakingInfo',
      'stake',
      'unstake'
    ]),
    connectWallet() {
      if (this.isTxPending === true) {
        return;
      }

      this.connectMetamask()
          .then(async () => await this.updateUserBalance())
          .then(async () => await this.loadUserStakingInfo());
    },
    isSelected(id) {
      return this.isWalletConnected && this.selectedStrategy === id;
    },
    selectStrategy(id) {
      this.selectedStrategy = id;
    },
    onStakeClick() {
      if (this.isTxPending === true) {
        return;
      }

      this.stake({strategy: this.selectedStrategy, stakeSize: this.inputValue});
    },
    onUnstakeClick() {
      if (this.isTxPending === true) {
        return;
      }

      const amount = this.inputValue;
      this.unstake(amount);
    }
  }
}
</script>

<style scoped>

</style>
