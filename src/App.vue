<template>
  <div class="h-16 px-10 py-1 border-b border-b-white bg-main-color-light massive:h-[83px] small:h-[88px] extra-small:h-[44px]">
    <the-header/>
  </div>

  <div class="flex grow justify-center items-center bg-main-color-light py-8">
    <div class="w-2/3 h-4/5 pt-10 pb-8 px-10 flex flex-col bg-white rounded-3xl shadow-lg
                big:w-[1170px] big:h-[634px]
                medium:h-[579px] medium:w-[974px]
                small:h-[525px] small:w-[722px]

">
      <the-staking/>
    </div>
  </div>

  <div class="p-1 bg-white massive:h-[102px] big:h-[54px] medium:h-[33px]">

  </div>
</template>

<script>
import TheHeader from "/src/components/TheHeader.vue";
import TheStaking from "/src/components/TheStaking.vue";
import {mapActions} from "vuex";

export default {
  components: {TheStaking, TheHeader},
  async created() {
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