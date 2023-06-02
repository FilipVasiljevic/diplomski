<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-4">
    <q-header elevated class="bg-blue-grey-3">
      <q-toolbar>
        <q-btn
          color="primary"
          dense
          label="Proizvodi"
          @click="openProizvodi()"
        />
        <q-toolbar-title> Webshop </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "LoginLayout",
  methods: {
    openProizvodi() {
      this.$router.push("/");
    },
  },
});
</script>
