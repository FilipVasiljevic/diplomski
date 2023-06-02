<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-blue-grey-3">
      <q-toolbar>
        <q-btn
          color="primary"
          dense
          label="Proizvodi"
          @click="openProizvodi()"
        />

        <q-toolbar-title>
          <q-input
            filled
            dense
            color="primary"
            v-model="pretrazivanje"
            label="Pretraživanje"
            label-color="black"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-toolbar-title>

        <div>
          <q-btn
            color="primary"
            dense
            label="Košarica"
            @click="openKosarica()"
          />
          <q-btn color="red" dense label="Prijava" @click="openPrijava()" />
        </div>
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
  name: "MainLayout",
  methods: {
    openProizvodi() {
      this.$router.push("/");
    },
    openKosarica() {
      this.$router.push("/kosarica");
    },
    openPrijava() {
      this.$router.push("/login");
    },
  },
});
</script>
