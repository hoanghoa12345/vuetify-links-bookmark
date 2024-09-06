<template>
  <v-container class="container-home">
    <v-row>
      <v-col cols="12" sm="12" md="6" lg="6" offset-md="3" offset-lg="3">
        <v-form class="form-vertical">
          <v-text-field
            v-model="form.name"
            label="URL"
            :rules="urlRules"
            prepend-icon="mdi-link"
            density="compact"
            type="url"
            variant="underlined"
          >
          </v-text-field>
          <v-btn
            color="info"
            class="me-4 button-primary text-subtitle-1"
            @click="submit"
          >
            Send
          </v-btn>
        </v-form>
      </v-col>
    </v-row>
    <v-row>
      <v-progress-circular
        indeterminate
        color="primary"
        v-if="loading"
      ></v-progress-circular>
      <v-col
        v-else
        v-for="(item, index) in data"
        :key="index"
        cols="12"
        sm="12"
        md="4"
        lg="2"
      >
        <v-card :title="item.name" :text="item.baseUrl">
          <div class="card-image">
            <v-img v-if="item.image" :src="item.image" height="200px" cover />
          </div>
          <v-card-actions>
            <v-btn
              color="blue-lighten-2"
              variant="text"
              @click="navigate(item.url)"
            >
              Explore
            </v-btn>
            <v-btn
              color="orange-lighten-2"
              variant="text"
              @click="navigate(item.url)"
            >
              Edit
            </v-btn>
            <v-btn @click="deleteBookmark(index)" color="red-darken-1" density="compact" icon="mdi-trash-can-outline" />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snackbar" multi-line>
      {{ text }}

      <template v-slot:actions>
        <v-btn :color="actionColor" variant="text" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch } from "vue";
import {bookmarksApi} from '@/services/bookmarks'

interface IForm {
  name: string;
  baseUrl: string;
  url: string;
  image?: string;
}

interface IPage {
  title?: string;
  description?: string;
  images: string[];
  duration: number;
  domain: string;
  url: string;
}
const urlRules = [(value: string) => !!value || "Required."];
const snackbar = ref<boolean>(false);
const text = ref<string>("");
const loading = ref<boolean>(false);
const actionColor = ref<string>("");
const form = reactive({
  name: "",
});

const data = ref<IForm[]>([]);
const showSnackbar = (message: string, color: string = "green") => {
  text.value = message;
  snackbar.value = true;
  actionColor.value = color;
};
const submit = async () => {
  const url = new URL(form.name);
  const info: IPage = await getPageInfo(form.name);
  const pageInfo = {
    name: info.title || url.host,
    baseUrl: url.host,
    url: form.name,
    image: info.images[0],
  };
  data.value?.push(pageInfo);

  try {
    await bookmarksApi.createNewBookmark(pageInfo);
    form.name = ""
    showSnackbar("Create new bookmark success");
  } catch (error) {
    showSnackbar("Create bookmark failed",'red');
  }
};

const navigate = (url: string) => {
  const win = window.open(url, "_blank");
  win?.focus();
};

const getPageInfo = async (url: string) =>  await bookmarksApi.getPageInfo(url);
const deleteBookmark = async (id: number) => {
  await bookmarksApi.deleteBookmark(id)
  data.value = await bookmarksApi.getBookmarks();
};

onMounted(async () => {
  try {
    loading.value = true;
    data.value = await bookmarksApi.getBookmarks();    
  } catch (error) {
    showSnackbar("Error load bookmark",'red');
  } finally {
    loading.value = false;
  }
});

</script>
