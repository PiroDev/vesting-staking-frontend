<template>
  <div class="h-full w-full flex justify-between items-center border" v-if="isWalletConnected">
    <div class="w-5/6 flex justify-between items-center">
      <div class="w-1/2 text-center">{{ slicedUserAddress }}</div>
      <div class="w-5/12 text-center">{{ isBalanceLoaded ? wallet.balance + ' ' + tokenSymbol : 'Fetching balance...' }}</div>
    </div>
    <div class="w-1/6 h-2/3 flex justify-center items-center">
      <img src="/src/assets/logout.svg" alt="X" class="h-full" @click="logout">
    </div>
  </div>

  <div class="h-full w-1/2 flex justify-center items-center border" v-else @click="connectWallet">
    Connect Wallet
  </div>
</template>

<script>
import {mapState, mapActions, mapGetters} from 'vuex';

export default {
  data() {
    return {
      isBalanceLoaded: false
    }
  },
  computed: {
    ...mapState({
      wallet: state => state.wallet,
      tokenSymbol: state => state.token.symbol
    }),
    ...mapGetters([
       'isWalletConnected'
    ]),
    slicedUserAddress() {
      const {address} = this.wallet;
      return address.slice(0, 9) + '...' + address.slice(-4);
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
          .then(() => this.updateUserBalance().then(() => this.isBalanceLoaded = true));
    }
  }
}
</script>

<style scoped>

</style>