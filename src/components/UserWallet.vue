<template>
  <div class="h-full w-96 flex justify-between items-center bg-white rounded-xl" v-if="isWalletConnected">
    <div class="w-5/6 flex justify-between items-center">
      <div class="w-1/2 text-center select-all">{{ slicedUserAddress }}</div>
      <div class="w-5/12 text-center select-all">{{ isBalanceLoaded ? wallet.balance + ' ' + tokenSymbol : 'Fetching balance...' }}</div>
    </div>
    <div class="w-1/6 h-2/3 flex justify-center items-center">
      <img src="/src/assets/logout.svg" alt="X" class="h-full hover:cursor-pointer" @click="logout">
    </div>
  </div>

  <div class="h-full w-1/3 flex justify-center items-center bg-white rounded-xl hover:cursor-pointer" v-else @click="connectWallet">
    Connect Wallet
  </div>
</template>

<script>
import {mapState, mapActions, mapGetters} from 'vuex';

export default {
  computed: {
    ...mapState({
      wallet: state => state.wallet,
      tokenSymbol: state => state.token.symbol,
      isBalanceLoaded: state => state.wallet.isBalanceLoaded
    }),
    ...mapGetters([
       'isWalletConnected'
    ]),
    slicedUserAddress() {
      const {address} = this.wallet;
      return address.slice(0, 6) + '...' + address.slice(-4);
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