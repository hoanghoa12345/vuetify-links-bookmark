<template>
  <v-card width="500" class="mx-auto mt-8">
    <h1 class="text-center">Login</h1>
    <v-form v-model="valid" @submit.prevent="onSubmit">
      <v-container>
        <v-row>
          <v-col cols="12" md="12">
            <v-text-field
              v-model="email"
              :rules="emailRules"
              :counter="10"
              variant="outlined"
              density="compact"
              label="Email"
              type="email"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="12">
            <v-text-field
              v-model="password"
              :rules="passwordRules"
              :counter="10"
              variant="outlined"
              density="compact"
              :append-inner-icon="passwordVisible ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="passwordVisible = !passwordVisible"
              label="Password"
              type="password"
              required
            ></v-text-field>
          </v-col>
        </v-row>
      </v-container>
      <v-container>
        <v-btn type="submit" color="primary" block class="mt-2 text-subtitle-1"
          >Login</v-btn
        >
      </v-container>
    </v-form>
  </v-card>
  <snack-bar
    v-model="openSnackbar"
    :message="snackMessage"
    title="Authentication"
    @close="openSnackbar = false"
  />
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { authApi } from "@/services/auth";
import SnackBar from "@/components/snackbar/index.vue";

const router = useRouter();
const openSnackbar = ref<boolean>(false);
const snackMessage = ref<string>("");
const valid = ref<boolean>(false);
const email = ref<string>("");
const password = ref<string>("");
const passwordVisible = ref<boolean>(false);
const emailRules = [
  (value: string) => {
    if (value) return true;

    return "E-mail is required.";
  },
  (value: string) => {
    if (/.+@.+\..+/.test(value)) return true;

    return "E-mail must be valid.";
  },
];
const passwordRules = [
  (value: string) => {
    if (value) return true;

    return "Password is required.";
  },
  (value: string) => {
    if (value?.length >= 6) return true;

    return "Password must be more than 6 characters.";
  },
];

const handleLogin = async (email: string, password: string) => {
  const { data, success, message, errors } = await authApi.login(
    email,
    password
  );
  console.log(data, success, message, errors);
  if (success) {
    localStorage.setItem("token", data.token)
    router.replace("/");
  } else {
    openSnackbar.value = true;
    snackMessage.value = errors;
  }
};

const onSubmit = async (e: Event) => {
  if (valid.value) {
    await handleLogin(email.value, password.value);
  }
};
</script>
