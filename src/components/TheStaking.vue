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
          <div class="text-[#db5f54] font-bold">APY: -</div>
          <div>Linear vesting with {{ staking.vesting.cliff }} days cliff and {{ staking.vesting.release }} vesting period</div>
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
      <div class="w-1/5 h-2/3 flex justify-center items-center bg-main-color rounded-xl hover:cursor-pointer select-none" v-if="isWalletConnected">
        Stake
      </div>
      <div class="w-1/5 h-2/3 flex justify-center items-center bg-main-color rounded-xl hover:cursor-pointer select-none" v-else @click="connectWallet">
        Connect wallet
      </div>
      <div class="w-1/5 h-2/3 flex justify-center items-center border border-gray-200 rounded-xl hover:cursor-pointer select-none">View Contract</div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters} from 'vuex';

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
    ])
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