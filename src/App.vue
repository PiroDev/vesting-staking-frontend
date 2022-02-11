<template>
  <div class="h-16 px-10 py-1 border-b border-b-white bg-main-color-light">
    <the-header/>
  </div>

  <div class="h-full flex justify-center items-center bg-main-color-light">
    <div class="w-2/3 h-4/5 pt-10 pb-8 px-10 flex flex-col bg-white rounded-3xl shadow-lg">
      <the-staking/>
    </div>
  </div>

  <div class="h-12 p-1 border-t border-t-white bg-main-color-light">

  </div>
</template>

<script>
import TheHeader from "/src/components/TheHeader.vue";
import TheStaking from "/src/components/TheStaking.vue";
import {mapActions} from "vuex";

export default {
  components: {TheStaking, TheHeader},
  async mounted() {
    await this.loadContractsInfo();
  },
  methods: {
    ...mapActions([
      'loadContractsInfo'
    ])
  }
}
</script>

<style>

</style>