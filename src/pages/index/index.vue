<template>
  <!-- <view class="bg" style="overflow: hidden; display: flex"> </view> -->
  <view>
    <image src="@/assets/111.png" mode="scaleToFill" />
  </view>
</template>

<script setup lang="ts">
const scrolltoupper = () => {
  console.log('scrolltoupper')
}
</script>

<style lang="scss" scoped>
.bg {
  width: 100rpx;
  height: 100rpx;
  background-color: #f00;
  .fz {
    font-size: 100rpx;
  }
}
.content {
  width: 100rpx;
}
.test > .test2 {
  color: #000;
}
</style>
