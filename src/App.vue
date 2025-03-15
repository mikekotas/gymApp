<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
import { Capacitor } from '@capacitor/core';
import UpdateService from 'src/services/UpdateService';

onMounted(async () => {
  // Only check for updates on native platforms
  if (Capacitor.isNativePlatform()) {
    await UpdateService.checkForUpdates();

    // Set up periodic update checks (every 24 hours)
    setInterval(() => {
      UpdateService.checkForUpdates();
    }, 24 * 60 * 60 * 1000);
  }
});
</script>
