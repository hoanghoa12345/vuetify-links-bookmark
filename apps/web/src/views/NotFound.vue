<template>
  <v-container class="d-flex justify-center align-center text-center h-100">
    <div>
      <v-img :width="500" :height="500" :src="errorImg" />
      <h2 class="text-h4 pt-3 font-weight-bold">Opps!!!</h2>
      <p class="text-h6 my-8 font-weight-medium">
        This page you are looking for could not be found.
      </p>
      <v-btn
        class="me-4 text-subtitle-1 text-white"
        color="#5d87ff"
        to="/"
        variant="flat"
        >Go back to home</v-btn
      >
    </div>
  </v-container>
</template>

<script setup lang="ts">
import errorImg from "@/assets/images/error-img.svg";
</script>

<style lang="scss" scoped></style>
