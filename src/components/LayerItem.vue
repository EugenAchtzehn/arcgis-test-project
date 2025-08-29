<template>
  <div>{{ layer.name }}</div>
</template>
<script setup lang="ts">
  import { Layer } from "@/types/Layer";
  const props = defineProps<{
    layer: Layer;
  }>();
</script>
