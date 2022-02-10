<template>
  <div class="h-full flex justify-between items-center">
      <div class="w-1/3"></div>
      <div class="w-1/3 flex justify-center items-center">
        <div class="text-2xl font-semibold">Staking App</div>
      </div>
      <div class="w-1/3 h-5/6 flex justify-center">
        <user-wallet/>
      </div>
  </div>
</template>

<script>
import UserWallet from "/src/components/UserWallet.vue";
export default {
  components: {UserWallet}
}
</script>

<style>

</style>