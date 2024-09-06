<template>
  <div>
    <v-breadcrumbs :items="['App', 'About']"></v-breadcrumbs>

    <v-footer>
      {{ new Date().getFullYear() }} - <strong>Vuetify</strong>
    </v-footer>
  </div>
</template>
<script setup></script>
