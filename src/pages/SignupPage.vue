<template>
  <q-page-sticky position="centar">
    <div>
      <q-card class="my-card">
        <q-card-section>
          <div class="q-pa-md column q-gutter-sm">
            <h4 class="text-center">Registracija</h4>
            <q-form @submit="registracijaKorisnika()">
              <q-input
                outlined
                v-model="signup.imePrezime"
                class="q-mb-md"
                type="userName"
                label="Ime i prezime"
                lazy-rules
                :rules="[
                  (val) =>
                    (val && val.length > 0) ||
                    'Potrebno je unijeti ime i prezime',
                ]" />
              <q-input
                outlined
                v-model="signup.email"
                class="q-mb-md"
                type="email"
                label="e-mail"
                lazy-rules
                :rules="[
                  (val) =>
                    (val && val.length > 0) || 'Potrebno je unijeti e-mail',
                ]" />
              <q-input
                outlined
                v-model="signup.password"
                class="q-mb-md"
                type="password"
                label="Lozinka"
                lazy-rules
                :rules="[
                  (val) =>
                    (val && val.length > 0) ||
                    'Potrebno je unijeti svoju lozinku',
                ]" />
              <q-separator />
              <h6 class="text-center">Podatci za dostavu</h6>
              <q-input
                outlined
                v-model="signup.adress"
                class="q-mb-md"
                type="adress"
                label="Adresa"
                lazy-rules
                :rules="[
                  (val) =>
                    (val && val.length > 0) ||
                    'Potrebno je unijeti adresu za dostavu',
                ]" />
              <q-input
                outlined
                v-model="signup.city"
                class="q-mb-md"
                type="city"
                label="Grad"
                lazy-rules
                :rules="[
                  (val) =>
                    (val && val.length > 0) ||
                    'Potrebno je unijeti grad za dostavu',
                ]" />
              <q-input
                outlined
                v-model="signup.zipCode"
                class="q-mb-md"
                type="po"
                label="Poštanski broj"
                lazy-rules
                :rules="[
                  (val) =>
                    (val && val.length > 0) ||
                    'Potrebno je unijeti poštanski broj grada',
                ]" />
              <q-btn type="submit" color="primary" label="Registracija"
            /></q-form></div
        ></q-card-section>
      </q-card>
    </div>
  </q-page-sticky>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "SignupPage",
  data() {
    return {
      signup: {
        imePrezime: "",
        email: "",
        password: "",
        adress: "",
        city: "",
        zipCode: "",
      },
    };
  },

  methods: {
    registracijaKorisnika() {
      // sql INSERT INTO korisnici (imePrezime, korisnickiMail, korisnickaLozinka, adresa, grad, postanskiBroj)
      // VALUES (signup.imePrezime, signup.email, PASSWORD(signup.password), signup.adress, signup.city, signup.zipCode)
      console.log("Korisnik je registriran");
    },
  },
});
</script>
