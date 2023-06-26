<template>
  <q-page-sticky position="centar">
    <div>
      <q-card class="my-card">
        <q-card-section>
          <div class="q-pa-md column q-gutter-sm">
            <h4 class="text-center">Prijava</h4>
            <q-form @submit="submitLogin()">
              <q-input
                outlined
                v-model="login.email"
                class="q-mb-md"
                type="email"
                label="Email"
                lazy-rules
                :rules="[
                  (val) =>
                    (val && val.length > 0) || 'Potrebno je unijeti e-mail',
                ]" />
              <q-input
                outlined
                v-model="login.password"
                class="q-mb-md"
                type="password"
                label="Password"
                lazy-rules
                :rules="[
                  (val) =>
                    (val && val.length > 0) ||
                    'Ne može se prijaviti bez lozinke',
                ]" />
              <div class="q-pa-md column q-gutter-sm">
                <q-btn type="submit" color="primary" label="Login" /></div
            ></q-form>
          </div>
          <q-separator />
          <h6 class="text-center">Novi korisnik?</h6>
          <div class="q-pa-md column q-gutter-sm">
            <q-btn color="primary" label="Registracija" @click="openSignUp()" />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page-sticky>
</template>

<script>
import axios from "axios";
import { defineComponent } from "vue";
import { useDataStore } from "../store/dataStore.js";

export default defineComponent({
  name: "LoginPage",

  setup() {
    const store = useDataStore();

    return {
      store,
    };
  },

  data() {
    return {
      login: {
        email: "",
        password: "",
      },
    };
  },

  methods: {
    openSignUp() {
      this.$router.push("/signup");
    },
    submitLogin() {
      //console.log("Prijava");

      const logiraniKorisnik = {
        korisnickiMail: this.login.email,
      };

      const loginData = {
        korisnickiMail: this.login.email,
        korisnickaLozinka: this.login.password,
      };

      //console.log(logiraniKorisnik, loginData);

      axios
        .post("http://localhost:3000/login", loginData)
        .then((response) => {
          this.$q.notify({ message: "Uspješan login" });
          this.store.loggedUser = true;
          //console.log(logiraniKorisnik);
          axios
            .get("http://localhost:3000/user/" + this.login.email)
            .then((response) => {
              //console.log(response.data.data[0]);
              this.store.userName = response.data.data[0].imePrezime;
              this.store.userID = response.data.data[0].korisnikID;
              //console.log(this.store.userName, this.store.userID);
            });
          this.$router.push("/");
        })
        .catch((error) => {
          console.log(error);
          this.$q.notify({ message: "Krivi podatci za login" });
        });
    },
  },
});
</script>
