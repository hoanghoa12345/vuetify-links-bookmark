<template>
  <v-app-bar flat color="primary">
    <template v-slot:prepend>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </template>
    <v-app-bar-title>Links Bookmark</v-app-bar-title>

    <template v-slot:append>
      <v-btn @click="emit('dark')" :icon="getTheme(name)"></v-btn>
    </template>
  </v-app-bar>
  <v-navigation-drawer v-model="drawer" temporary>
    <v-list-item
      :prepend-avatar="`https://robohash.org/${user?.name}`"
      :title="user?.name"
    ></v-list-item>
    <v-divider></v-divider>
    <v-list density="compact" nav>
      <v-list-item
        to="/"
        exact
        prepend-icon="mdi-view-dashboard"
        title="Home"
        value="home"
      ></v-list-item>
      <v-list-item
        to="/old-version"
        prepend-icon="mdi-history"
        title="Old version"
        value="old-version"
      ></v-list-item>
      <v-list-item
        to="/info"
        prepend-icon="mdi-forum"
        title="About"
        value="about"
      ></v-list-item>
      <v-list-item
        to="/parallax"
        prepend-icon="mdi-mouse"
        title="Parallax"
        value="parallax"
      ></v-list-item>
      <v-list-item
        @click="logout"
        prepend-icon="mdi-logout"
        title="Logout"
        value="logout"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from "vue";
import { useTheme } from "vuetify";
import { authApi } from "@/services/auth";
import { useRouter } from "vue-router";

interface User {
  createdAt: string;
  password: string;
  role: string;
  name: string;
  id: string;
  email: string;
  updatedAt: string;
}

const emit = defineEmits(["dark"]);
const user = ref<User>()
const drawer = ref<boolean>(false);
const router = useRouter()
const themeIcons = [
  { name: "light", icon: "mdi-weather-sunny" },
  { name: "dark", icon: "mdi-weather-night" },
];
const getTheme = (name: string): string => {
  const item = themeIcons.find((item) => item.name === name);
  if (item) return item.icon;
  return "mdi-weather-sunny";
};
const { name } = useTheme();

watchEffect(async () => {
  const { success, data, message, errors } = await authApi.getCurrentUser();
  console.log(data, message, errors);
  if(success) {
    user.value = data
  }
});

function logout () {
  localStorage.removeItem("token");
  router.replace({name: 'auth.login'})
}
</script>
