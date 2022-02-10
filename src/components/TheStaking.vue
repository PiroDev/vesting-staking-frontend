<template>
  <div class="h-full w-full flex flex-col justify-between">
    <div class="h-1/6 w-full flex items-center justify-between">
      <div class="text-3xl font-extrabold">Staking with Vesting</div>
    </div>
    <div class="h-4/6 w-full flex flex-col justify-around">
      <div class="h-3/6 flex justify-around">
        <div v-for="staking in stakingStrategies" class="w-1/3 flex flex-col justify-around rounded-3xl px-6 shadow-lg ">
          <div class="text-2xl font-bold">{{ staking.days }} Days</div>
          <div class="text-[#db5f54] font-bold">APY: {{ staking.apy }}</div>
          <div>{{ staking.vesting }}</div>
        </div>
      </div>

      <div class="h-1/4 flex flex-col justify-between" v-if="isWalletConnected">
        <div class="h-1/2 flex items-center">
            <input type="text" v-model.number="stake" class="w-full border border-gray-200 pl-2 py-3 rounded-lg focus:outline-none">
        </div>
        <div class="h-1/4 flex items-center">
          <div>Reward for 30 days:</div>
          <div class="text-[#db5f54] text-lg font-bold ml-2">25 CRT</div>
        </div>
      </div>
      <div class="h-2/6 flex items-center" v-else>
        <div class="h-1/2 pl-2 w-full flex items-center border border-gray-200 rounded-xl bg-selection-color">
          To perform actions on the page, connect your wallet
        </div>
      </div>

    </div>
    <div class="h-1/6 w-full flex justify-between items-center">
      <div class="w-1/5 h-2/3 flex justify-center items-center bg-main-color rounded-xl" v-if="isWalletConnected">
        Stake
      </div>
      <div class="w-1/5 h-2/3 flex justify-center items-center bg-main-color rounded-xl" v-else @click="connectWallet">
        Connect wallet
      </div>
      <div class="w-1/5 h-2/3 flex justify-center items-center border border-gray-200 rounded-xl">View Contract</div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters} from 'vuex';

export default {
  data() {
    return {
      stakingStrategies: [
        {days: 30, apy: '125.3%', vesting: 'Linear vesting strategy: 10 days cliff with 20 days vesting'},
        {days: 60, apy: '227.8%', vesting: 'Linear vesting strategy: 20 days cliff with 40 days vesting'},
      ],
      stake: 100
    }
  },
  computed: {
    ...mapGetters([
      'isWalletConnected'
    ])
  },
  methods: {
    ...mapActions([
      'connectMetamask',
      'updateUserBalance'
    ]),
    connectWallet() {
      this.connectMetamask()
          .then(() => this.updateUserBalance().then(res => {})
          );
    }
  }
}
</script>

<style scoped>

</style>