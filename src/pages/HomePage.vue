<template>
  <q-page class="flex flex-center">
    <q-card class="my-card" v-for="post in posts" :key="post.proizvodID">
      <q-card-section>
        <div class="text-h6">{{ post.nazivProizvoda }}</div>
        <div class="text-subtitle2">by John Doe</div>
      </q-card-section>

      <q-separator />

      <q-card-actions vertical>
        <q-btn flat>Action 1</q-btn>
        <q-btn flat>Action 2</q-btn>
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import axios from "axios";

export default defineComponent({
  name: "HomePage",

  data() {
    return {
      posts: [],
    };
  },
  mounted: function () {
    axios
      .get("http://localhost:3000/items")
      .then((response) => {
        this.posts = response.data;
      })
      .catch((error) => this.$q.notify({ message: "Nema proizvoda" }));
  },
});
</script>
