<template>
  <div class="h-12 px-10 py-1 border">
    <the-header/>
  </div>

  <div class="h-full flex justify-center items-center">
    <div class="w-2/3 h-2/3 p-5 flex flex-col border">
      <the-staking/>
    </div>
  </div>

  <div class="h-12 p-1 border">

  </div>
</template>

<script>
import TheHeader from "/src/components/TheHeader.vue";
import TheStaking from "/src/components/TheStaking.vue";

export default {
  components: {TheStaking, TheHeader}
}
</script>

<style>

</style>