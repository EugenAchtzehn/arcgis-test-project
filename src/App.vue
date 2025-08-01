<template>
  <header>
    <nav class="header__navigation">
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/dashboard">Dashboard</RouterLink>
    </nav>
  </header>
  <RouterView />
</template>
<script setup lang="ts">
  import { RouterLink, RouterView } from "vue-router";
</script>
<style scoped>
  .header__navigation {
    display: flex;
    align-items: center;
    gap: 8px;
    height: var(--navigation-height);
    padding: 8px;
  }
</style>
