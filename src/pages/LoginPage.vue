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

      // const logiraniKorisnik = {
      //   korisnickiMail: this.login.email,
      // };

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

              axios.get("http://localhost:3000/maxBills").then((response) => {
                var racun = response.data.data[0];
                console.log(racun);
                this.store.billID = racun.racunID;
                if (racun.iznosRacuna === 0) {
                  this.store.createdBill = true;
                  console.log("Racun je 0");
                } else {
                  console.log("Pokvaren sam");
                }
                if (racun.korisnikID == null) {
                  //console.log("Nema vlasnika racuna");
                  const racunZaUpdate = {
                    korisnikID: this.store.userID,
                    racunID: racun.racunID,
                  };
                  axios
                    .put("http://localhost:3000/newBillOwner", racunZaUpdate)
                    .then((response) => {
                      if (!this.store.questionAwns) {
                        axios
                          .get(
                            "http://localhost:3000/userBills/" +
                              this.store.userID
                          )
                          .then((response) => {
                            if (response.data.data.length > 1) {
                              //console.log("Korisnik ima više otvorenih računa");
                              this.$q
                                .dialog({
                                  title: "Korisnik več ima otvoreni račun",
                                  message:
                                    "Želite li nove stavke dodati na stari račun ili otvoriti novi?",
                                  ok: {
                                    push: true,
                                    label: "Dodaj na postojeći",
                                  },
                                  cancel: {
                                    push: true,
                                    label: "Dodaj na novi račun",
                                  },
                                  persistent: true,
                                })
                                .onOk(() => {
                                  const push = {
                                    racunIDnew:
                                      response.data.data[
                                        response.data.data.length - 2
                                      ].racunID,
                                    racunIDold:
                                      response.data.data[
                                        response.data.data.length - 1
                                      ].racunID,
                                  };
                                  const racunIDnew =
                                    response.data.data[
                                      response.data.data.length - 2
                                    ].racunID;
                                  //console.log(push);
                                  this.store.questionAwns = true;
                                  this.store.billID =
                                    response.data.data[
                                      response.data.data.length - 2
                                    ].racunID;
                                  axios
                                    .put(
                                      "http://localhost:3000/updateBillItems",
                                      push
                                    )
                                    .then((response) => {
                                      this.$q.notify(
                                        "Dodano na postojeći račun"
                                      );
                                      axios
                                        .get(
                                          "http://localhost:3000/checkAndUpdateItems/" +
                                            racunIDnew
                                        )
                                        .then((response) => {
                                          console.log("Stavke su ažurirane");
                                        })
                                        .catch((error) => console.log(error));
                                    })
                                    .catch((error) => {
                                      console.log(error);
                                    });
                                })
                                .onCancel(() => {
                                  this.$q.notify("Dodano na novi račun");
                                  this.store.billID =
                                    response.data.data[
                                      response.data.data.length - 1
                                    ].racunID;
                                })
                                .onDismiss(() => {
                                  // console.log('I am triggered on both OK and Cancel')
                                });
                            } else {
                              //console.log("Korisnik ima samo jedan račuin");
                            }
                          });
                      }
                    })
                    .catch((error) => {
                      console.log(error);
                    });
                }
              });

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
