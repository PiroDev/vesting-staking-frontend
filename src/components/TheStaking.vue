<template>
  <div class="h-full w-full flex flex-col justify-between">
    <div class="h-1/6 w-full flex items-center justify-between">
      <div class="text-2xl">Staking with Vesting</div>
    </div>
    <div class="h-4/6 w-full flex flex-col justify-between">
      <div class="h-2/3 flex justify-around">
        <div v-for="staking in stakingStrategies" class="w-1/3 flex flex-col justify-around border">
          <div>{{ staking.days }} Days</div>
          <div>{{ staking.apy }} APY</div>
          <div>{{ staking.vesting }}</div>
        </div>
      </div>

      <div class="h-2/6 flex flex-col" v-if="isWalletConnected">
        <div class="h-1/2 flex items-center">
          <input type="text" v-model.number="stake" class="w-full border">
        </div>
        <div class="h-1/2 flex items-center">
          Reward for 30 days: 25 CRT
        </div>
      </div>
      <div class="h-2/6 flex items-center" v-else>
        <div class="h-1/2 w-full flex items-center border">
          To perform actions on the page, connect your wallet
        </div>
      </div>

    </div>
    <div class="h-1/6 w-full flex justify-between items-center">
      <div class="w-1/5 h-2/3 flex justify-center items-center border" v-if="isWalletConnected">
        Stake
      </div>
      <div class="w-1/5 h-2/3 flex justify-center items-center border" v-else @click="connectWallet">
        Connect wallet
      </div>
      <div class="w-1/5 h-2/3 flex justify-center items-center border">View Contract</div>
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