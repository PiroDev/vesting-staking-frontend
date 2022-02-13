<template>
  <div class="px-3 flex h-full justify-between items-center bg-white rounded-xl" v-if="isWalletConnected">
    <div class="flex justify-between items-center mr-2">
      <div class="hidden basis-1/2 text-center select-all">{{ slicedUserAddress }}</div>
      <div class="text-center whitespace-nowrap">{{ userBalance }}</div>
    </div>
    <div class="flex h-1/2 justify-center items-center">
      <img src="/src/assets/logout.svg" alt="X" class="h-full hover:cursor-pointer" @click="logout">
    </div>
  </div>
  <div class="px-3 h-full flex justify-center items-center bg-white rounded-xl hover:cursor-pointer" v-else @click="connectWallet">
    Connect Wallet
  </div>
</template>

<script>
import {mapState, mapActions, mapGetters} from 'vuex';
import {BNToNumstr} from '/src/utils/formatting.js';

export default {
  computed: {
    ...mapState({
      wallet: state => state.wallet,
      token: state => state.rewardToken,
      isBalanceLoaded: state => state.wallet.isLoaded
    }),
    ...mapGetters([
       'isWalletConnected'
    ]),
    slicedUserAddress() {
      const {address} = this.wallet;
      return address.slice(0, 6) + '...' + address.slice(-4);
    },
    userBalance() {
      if (this.isBalanceLoaded === false) {
        return 'Loading...';
      } else {
        const balance = BNToNumstr(this.wallet.balance, this.token.decimals);
        return balance + ' ' + this.token.symbol;
      }
    }
  },
  methods: {
    ...mapActions([
        'connectMetamask',
        'updateUserBalance',
        'logout'
    ]),
    connectWallet() {
      this.connectMetamask()
          .then(() => this.updateUserBalance());
    }
  }
}
</script>

<style scoped>

</style>