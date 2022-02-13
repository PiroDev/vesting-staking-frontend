<template>
  <div class="flex grow h-full justify-between items-center">
      <div class="hidden"></div>
      <div class="flex flex-none justify-center items-center">
        <div class="text-xl font-semibold tablet:text-2xl laptop:text-3xl laptop-xl:text-4xl">Staking App</div>
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