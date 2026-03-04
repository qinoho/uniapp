<template>
  <wd-config-provider :theme="themeStore.theme">
    <view :class="['home-page', themeStore.theme === 'dark' ? 'dark' : '']">
      <!-- Search Section -->
      <view class="search-section" @click="handleSearch">
        <view class="search-box" hover-class="opacity-80">
          <image class="search-icon" :src="searchIcon" mode="aspectFit" />
          <text class="search-text">Search</text>
        </view>
      </view>

      <!-- Grid Nav Section -->
      <view class="grid-nav-section">
        <scroll-view class="grid-scroll" scroll-x="true" show-scrollbar="false">
          <view class="grid-container">
            <view
              class="grid-item"
              v-for="(item, index) in navData"
              :key="index"
              @click="handleNav(item)"
              hover-class="opacity-80"
            >
              <view class="icon-wrapper">
                <image class="grid-icon" :src="item.icon" mode="aspectFit" />
              </view>
              <text class="grid-text">{{ item.name }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- Banner Section -->
      <view class="banner-section">
        <swiper
          class="banner-swiper"
          :indicator-dots="true"
          :autoplay="true"
          :circular="true"
          indicator-color="rgba(255,255,255,0.4)"
          indicator-active-color="#ffffff"
        >
          <swiper-item v-for="(item, index) in bannerList" :key="index" @click="handleBanner(item)">
            <view class="banner-item" hover-class="opacity-80">
              <!-- No banner image was exported; placeholder styling applied -->
              <view class="banner-bg"></view>
              <text class="banner-title">{{ item.title }}</text>
            </view>
          </swiper-item>
        </swiper>
      </view>

      <!-- Section: Title & Scroll List -->
      <view class="section-container mt-32">
        <view class="section-header" @click="handleMore('scroll')">
          <text class="section-title">Title</text>
          <view class="more-btn" hover-class="opacity-80">
            <image class="arrow-right" :src="arrowRight" mode="aspectFit" />
          </view>
        </view>

        <scroll-view class="card-scroll" scroll-x="true" show-scrollbar="false">
          <view class="card-list">
            <view
              class="card-item"
              v-for="(item, index) in scrollList"
              :key="index"
              @click="handleCard(item)"
              hover-class="opacity-80"
            >
              <image class="card-img" :src="item.img" mode="aspectFill" />
              <text class="card-title">{{ item.title }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- Section: Hot Products -->
      <view class="section-container mt-32">
        <view class="section-header" @click="handleMore('hot')">
          <text class="section-title">Title</text>
          <view
            class="more-btn arrow-bg"
            :style="{ backgroundImage: `url(${arrowBg})` }"
            hover-class="opacity-80"
          >
            <image class="arrow-right-inner" :src="arrowRight" mode="aspectFit" />
          </view>
        </view>

        <scroll-view class="product-scroll" scroll-x="true" show-scrollbar="false">
          <view class="product-list">
            <view
              class="product-item"
              v-for="(item, index) in productList"
              :key="index"
              @click="handleProduct(item)"
              hover-class="opacity-80"
            >
              <image class="product-img" :src="item.img" mode="aspectFill" />
              <view class="product-info">
                <text class="brand-text">{{ item.brand }}</text>
                <text class="product-name">{{ item.name }}</text>
                <text class="product-price">{{ item.price }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- Section: Square Products Bottom -->
      <view class="section-container mt-0 last-section">
        <view class="section-header" @click="handleMore('square')">
          <text class="section-title">Title</text>
          <view
            class="more-btn arrow-bg"
            :style="{ backgroundImage: `url(${arrowBg})` }"
            hover-class="opacity-80"
          >
            <image class="arrow-right-inner" :src="arrowRight" mode="aspectFit" />
          </view>
        </view>

        <scroll-view class="square-scroll" scroll-x="true" show-scrollbar="false">
          <view class="square-list">
            <view
              class="square-item"
              v-for="(item, index) in squareList"
              :key="index"
              @click="handleSquare(item)"
              hover-class="opacity-80"
            >
              <image class="square-img" :src="item.img" mode="aspectFill" />
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="safe-bottom"></view>

      <!-- 悬浮主题切换按钮(仅供测试验证) -->
      <view class="theme-toggle-btn" @click="themeStore.toggleTheme" hover-class="opacity-80">
        <text class="toggle-text">{{ themeStore.theme === 'dark' ? '☀️' : '🌙' }}</text>
      </view>
    </view>
  </wd-config-provider>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useThemeStore } from '@/store/useThemeStore'

const themeStore = useThemeStore()

// Local Assets
import searchIcon from '@/static/images/home/search_icon.png'
import gridFavorites from '@/static/images/home/grid_favorites.png'
import gridHistory from '@/static/images/home/grid_history.png'
import gridFollowing from '@/static/images/home/grid_following.png'
import gridOrders from '@/static/images/home/grid_orders.png'

import arrowRight from '@/static/images/home/arrow_right.png'
import arrowBg from '@/static/images/home/arrow_bg.png'

import scrollItem1 from '@/static/images/home/scroll_item_1.png'
import scrollItem2 from '@/static/images/home/scroll_item_2.png'
import scrollItem3 from '@/static/images/home/scroll_item_3.png'
import scrollItem4 from '@/static/images/home/scroll_item_4.png'

import product1 from '@/static/images/home/product_1.png'
import product2 from '@/static/images/home/product_2.png'
import product3 from '@/static/images/home/product_3.png'

import productSq1 from '@/static/images/home/product_sq_1.png'
import productSq2 from '@/static/images/home/product_sq_2.png'
import productSq3 from '@/static/images/home/product_sq_3.png'
import productSq4 from '@/static/images/home/product_sq_4.png'

// 数据模型 (Mock Data)
const navData = reactive([
  { name: 'Favorites', icon: gridFavorites },
  { name: 'History', icon: gridHistory },
  { name: 'Following', icon: gridFollowing },
  { name: 'Orders', icon: gridOrders },
])

const bannerList = reactive([
  { title: 'Banner title 1' },
  { title: 'Banner title 2' },
  { title: 'Banner title 3' },
])

const scrollList = reactive([
  { title: 'Title', img: scrollItem1 },
  { title: 'Title', img: scrollItem2 },
  { title: 'Title', img: scrollItem3 },
  { title: 'Title', img: scrollItem4 },
])

const productList = reactive([
  { brand: 'Brand', name: 'Product name', price: '$10.99', img: product1 },
  { brand: 'Brand', name: 'Product name', price: '$10.99', img: product2 },
  { brand: 'Brand', name: 'Product name', price: '$10.99', img: product3 },
])

const squareList = reactive([
  { img: productSq1 },
  { img: productSq2 },
  { img: productSq3 },
  { img: productSq4 },
])

// 事件交互逻辑 (Event Handlers)
const handleSearch = () => {
  console.log('Search clicked')
}

const handleNav = (item: any) => {
  console.log('Nav clicked:', item.name)
}

const handleBanner = (item: any) => {
  console.log('Banner clicked:', item.title)
}

const handleMore = (type: string) => {
  console.log('More clicked for:', type)
}

const handleCard = (item: any) => {
  console.log('Card clicked:', item.title)
}

const handleProduct = (item: any) => {
  console.log('Product clicked:', item.name)
}

const handleSquare = (item: any) => {
  console.log('Square product clicked')
}
</script>

<style lang="scss" scoped>
.home-page {
  width: 750rpx;
  min-height: 100vh;
  background-color: var(--bg-color, #ffffff);
  color: var(--text-color, #000000);
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  transition:
    background-color 0.3s,
    color 0.3s;
}

/* 悬浮切换按钮 */
.theme-toggle-btn {
  position: fixed;
  right: 40rpx;
  bottom: 200rpx;
  width: 80rpx;
  height: 80rpx;
  background-color: var(--text-color);
  border-radius: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
  z-index: 999;
}
.toggle-text {
  font-size: 40rpx;
  color: var(--bg-color);
}

/* Base Interactions */
.opacity-80 {
  opacity: 0.8;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Search */
.search-section {
  padding: 16rpx 32rpx;
}
.search-box {
  width: 100%;
  height: 80rpx;
  background-color: var(--card-bg-color, #f5f5f5);
  border-radius: 16rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 24rpx;
  box-sizing: border-box;
}
.search-icon {
  width: 48rpx;
  height: 48rpx;
  flex-shrink: 0;
}
.search-text {
  font-family: Inter, sans-serif;
  font-size: 32rpx;
  color: var(--text-color-secondary, #828282);
  margin-left: 24rpx;
  flex: 1;
}

/* Grid Nav */
.grid-nav-section {
  margin-top: 16rpx;
  padding-left: 32rpx;
}
.grid-scroll {
  width: 100%;
}
.grid-container {
  white-space: nowrap;
  padding-bottom: 8rpx;
}
.grid-item {
  height: 64rpx;
  border: 2rpx solid var(--border-color, #e6e6e6);
  border-radius: 12rpx;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  padding: 0 20rpx;
  margin-right: 16rpx;
  box-sizing: border-box;
  vertical-align: top;
}
.icon-wrapper {
  width: 36rpx;
  height: 36rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}
.grid-icon {
  width: 100%;
  height: 100%;
}
.grid-text {
  font-family: Inter, sans-serif;
  font-size: 28rpx;
  color: var(--text-color, #1a1a1a);
  font-weight: 500;
  margin-left: 8rpx;
}

/* Banner */
.banner-section {
  margin-top: 32rpx;
  padding: 0 32rpx;
}
.banner-swiper {
  width: 100%;
  height: 272rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #e0e0e0, #f5f5f5);
  transform: translateY(0); /* Bugfix for swiper border-radius in some environments */
}
.banner-item {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 108rpx 0 0 40rpx;
  box-sizing: border-box;
  position: relative;
}
.banner-title {
  font-family: Inter, sans-serif;
  font-size: 40rpx;
  color: var(--text-color, #000000);
  font-weight: 600;
  letter-spacing: -0.4rpx;
}

/* Section Common */
.section-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.mt-32 {
  margin-top: 32rpx;
}
.mt-0 {
  margin-top: 0;
}
.section-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 32rpx;
  height: 76rpx;
}
.section-title {
  font-family: Inter, sans-serif;
  font-size: 32rpx;
  color: var(--text-color, #000000);
  font-weight: 600;
  letter-spacing: -0.32rpx;
}
.more-btn {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}
.arrow-right {
  width: 12rpx;
  height: 20rpx;
}
.arrow-bg {
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.arrow-right-inner {
  width: 12rpx;
  height: 20rpx;
  margin-right: 2rpx;
}

/* Title & Scroll List */
.card-scroll {
  width: 100%;
}
.card-list {
  white-space: nowrap;
  padding: 16rpx 32rpx;
}
.card-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin-right: 48rpx;
  vertical-align: top;
}
/* Ensure the last item margin is not cut off completely in some viewports */
.card-item:last-child {
  margin-right: 0rpx;
}
.card-img {
  width: 152rpx;
  height: 152rpx;
  border-radius: 8rpx;
}
.card-title {
  font-family: Inter, sans-serif;
  font-size: 28rpx;
  color: var(--text-color, #161823);
  font-weight: 500;
  margin-top: 16rpx;
  text-align: center;
}

/* Hot Products */
.product-scroll {
  width: 100%;
}
.product-list {
  white-space: nowrap;
  padding: 0 32rpx 32rpx 32rpx;
}
.product-item {
  display: inline-flex;
  flex-direction: column;
  margin-right: 24rpx;
  vertical-align: top;
}
.product-item:last-child {
  margin-right: 0;
}
.product-img {
  width: 296rpx;
  height: 296rpx;
  border-radius: 8rpx;
}
.product-info {
  display: flex;
  flex-direction: column;
  margin-top: 24rpx;
}
.brand-text {
  font-family: Inter, sans-serif;
  font-size: 24rpx;
  color: var(--text-color-secondary, #000000);
}
.product-name {
  font-family: Inter, sans-serif;
  font-size: 28rpx;
  color: var(--text-color, #000000);
  margin-top: 4rpx;
  @extend .text-ellipsis;
  width: 296rpx;
}
.product-price {
  font-family: Inter, sans-serif;
  font-size: 32rpx;
  color: var(--text-color, #000000);
  font-weight: 500;
  margin-top: 4rpx;
}

/* Square Products Bottom */
.square-scroll {
  width: 100%;
}
.square-list {
  white-space: nowrap;
  padding: 0 32rpx 32rpx 32rpx;
}
.square-item {
  display: inline-flex;
  margin-right: 24rpx;
  vertical-align: top;
}
.square-item:last-child {
  margin-right: 0;
}
.square-img {
  width: 192rpx;
  height: 192rpx;
  border-radius: 8rpx;
}

/* Tabbar Spacer */
.safe-bottom {
  height: 100rpx;
  width: 100%;
  flex-shrink: 0;
}
</style>
