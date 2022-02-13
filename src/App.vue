<template>
  <div class="flex flex-none basis-16 max-h-20 py-2 px-4 border-b border-b-white bg-main-color-light
              tablet:px-10 laptop-lg:max-h-30 laptop-xl:max-h-36">
    <the-header/>
  </div>

  <div class="flex grow px-4 py-8 justify-center items-center bg-main-color-light
              tablet:px-6 laptop:px-36 laptop-lg:px-72 laptop-xl:px-96">
    <div class="flex grow flex-col p-6 bg-white rounded-3xl shadow-lg laptop:p-8 laptop-lg:p-10 laptop-xl:p-12">
      <the-staking/>
    </div>
  </div>

  <div class="bg-white py-2 px-4 basis-[61px] max-h-[61px]">
    <the-footer/>
  </div>
</template>

<script>
import TheHeader from "/src/components/TheHeader.vue";
import TheStaking from "/src/components/TheStaking.vue";
import TheFooter from "/src/components/TheFooter.vue";
import {mapActions} from "vuex";

export default {
  components: {TheStaking, TheHeader, TheFooter},
  async created() {
    return await this.loadContractsInfo();
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