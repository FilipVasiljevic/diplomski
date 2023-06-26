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
          <!-- <div v-if="!store.loggedUser"> -->
          <q-btn
            v-if="!store.loggedUser"
            color="red"
            dense
            label="Prijava"
            @click="openPrijava()"
          />
          <!-- </div> -->
          <!-- <div v-else> -->
          <!-- <q-btn color="red" dense label="Odjava" @click="odjava()" /> -->
          <q-btn-dropdown v-else color="red" :label="store.userName">
            <q-list>
              <q-item clickable v-close-popup @click="odjava()">
                <q-item-section>
                  <q-icon name="logout" />
                  <q-item-label>Odjava</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <!-- </div> -->
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
import { useDataStore } from "../store/dataStore.js";

export default defineComponent({
  name: "MainLayout",

  setup() {
    const store = useDataStore();

    return {
      store,
    };
  },

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
    odjava() {
      this.$q.notify(
        "Korisnik " + this.store.userName + " je uspješno odjavljen"
      );
      this.store.loggedUser = false;
      this.store.userID = "";
      this.store.userName = "";
      //console.log(this.store);
    },
  },
});
</script>
