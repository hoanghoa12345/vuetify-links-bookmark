<template>
  <v-snackbar :modelValue="modelValue" @modelValue="emit('update:modelValue', modelValue)"  color="red-accent-4"
      elevation="24">
    <div class="text-subtitle-1 pb-2">{{ title }}</div>

    <p>{{ message }}</p>

    <template v-slot:actions>
      <v-btn color="white" variant="text" @click="emit('close')">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
defineProps({
  modelValue: Boolean,
  title: String,
  message: String,
})

const emit = defineEmits(['update:modelValue', 'close'])
</script>
