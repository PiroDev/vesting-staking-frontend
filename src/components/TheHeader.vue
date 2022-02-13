<template>
  <div class="flex grow h-full justify-between items-center">
      <div class="hidden"></div>
      <div class="flex flex-none justify-center items-center">
        <div class="text-2xl font-semibold">Staking App</div>
      </div>
      <div class="flex h-5/6">
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