<template>
  <v-theme-provider :theme="theme">
    <v-app>
      <default-bar @dark="handleDark" />
      <default-view />
    </v-app>
  </v-theme-provider>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import DefaultBar from "./AppBar.vue";
import DefaultView from "./View.vue";

const theme = ref("light");

const handleDark = () => {
  if (theme.value === "light") {
    theme.value = "dark";
  } else if (theme.value === "dark") {
    theme.value = "light";
  }
};
</script>
