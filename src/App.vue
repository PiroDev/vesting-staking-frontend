<template>
  <div class="flex flex-none basis-[61px] max-h-[61px] py-2 px-4 border-b border-b-white bg-main-color-light">
    <the-header/>
  </div>

  <div class="flex grow px-4 py-8 justify-center items-center bg-main-color-light">
    <div class="flex grow flex-col p-6 bg-white rounded-3xl shadow-lg">
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