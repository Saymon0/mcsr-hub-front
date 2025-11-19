<template>
  <div class="min-h-screen bg-primary-bg">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style>
/* Убедимся, что фон применяется ко всей странице */
html, body {
  background-color: #0d0d0f;
  margin: 0;
  padding: 0;
}
</style>
