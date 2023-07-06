<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md">
      <div class="row justify-center q-gutter-sm">
        <q-intersection
          v-for="item in items"
          :key="item.proizvodID"
          class="my-card"
        >
          <!-- <q-card class="my-card" v-for="item in items" :key="item.proizvodID"> -->
          <q-card>
            <q-card-section>
              <img :src="item.imgData" class="webshop-items" />
              <div class="text-h6">{{ item.nazivProizvoda }}</div>
              <div class="text-subtitle2">{{ item.cijenaProizvoda }} €</div>
            </q-card-section>

            <q-separator />

            <q-card-actions vertical>
              <q-btn flat @click="otvoriProizvod(item.proizvodID)"
                >Otvori proizvod</q-btn
              >
              <q-btn
                flat
                color="red"
                @click="dodajUKosaricu(item.proizvodID, item.cijenaProizvoda)"
                >Dodaj u košaricu</q-btn
              >
            </q-card-actions>
          </q-card>
        </q-intersection>
        <!-- <q-btn flat color="red" @click="zatvoriRacun()">Zatvori</q-btn> -->
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import axios from "axios";
import { useDataStore } from "../store/dataStore.js";

export default defineComponent({
  name: "HomePage",

  setup() {
    const store = useDataStore();

    return {
      store,
    };
  },

  data() {
    return {
      items: {
        proizvodID: "",
        nazivProizvoda: "",
        cijenaProizvoda: "",
        opisProizvoda: "",
        slika: {},
        imgData: "",
      },
      maxRacun: {
        racunID: "",
        korisnikID: "",
        datumRacuna: "",
        iznosRacuna: "",
      },
    };
  },
  mounted: function () {
    axios
      .get("http://localhost:3000/items")
      .then((response) => {
        //console.log(response.data);
        this.items = response.data.data;
        this.items.forEach((item) => {
          //console.log(item.slika.data);
          const bufferData = item.slika.data;
          const uint8Array = new Uint8Array(bufferData);
          const blob = new Blob([uint8Array], { type: "image/jpeg" });
          const reader = new FileReader();
          reader.onloadend = () => {
            item.imgData = reader.result;
          };
          //console.log(item.imgData);
          reader.readAsDataURL(blob);
        });
      })
      .catch((error) => {
        this.$q.notify("Nema proizvoda");
        console.log(error);
      });
  },
  methods: {
    dodajUKosaricu(id, price) {
      var kolicina;
      //console.log(id);
      this.$q
        .dialog({
          title: "Dodaj u košaricu",
          message: "Odaberi količinu",
          prompt: {
            model: 1,
            type: "number",

            min: 1,
            step: 1,
          },
          ok: {
            push: true,
            label: "Ok",
          },
          cancel: {
            push: true,
            color: "red",
            label: "Odustani",
          },
          persistent: true,
        })
        .onOk((data) => {
          kolicina = data;
          //console.log(kolicina);
          // const dns = new Date();
          // const dan = String(dns.getDate()).padStart(2, "0");
          // const mjesec = String(dns.getMonth() + 1).padStart(2, "0"); // Months are zero-based
          // const god = dns.getFullYear();

          // const datum = `${god}/${mjesec}/${dan}`;
          //const datum = dns.toISOString().slice(0, 19).replace("T", " ");
          if (!this.store.createdBill) {
            if (!this.store.loggedUser) {
              axios
                .post("http://localhost:3000/newBillnoUser")
                .then((response) => {
                  console.log(response);
                  //this.$q.notify("Stvoren novi racun");
                  this.store.createdBill = true;
                });
            } else {
              const racun = {
                korisnikID: this.store.userID,
              };
              axios
                .post("http://localhost:3000/newBill", racun)
                .then((response) => {
                  //console.log(response);
                  //this.$q.notify("Stvoren novi racun");
                  this.store.createdBill = true;
                });
            }
            axios.get("http://localhost:3000/maxBills").then((response) => {
              this.maxRacun = response.data.data[0];
              this.store.billID = this.maxRacun.racunID;
              var cijena = kolicina * price;
              const stavkaRacuna = {
                racunID: this.maxRacun.racunID,
                proizvodID: id,
                kolicinaProizvoda: kolicina,
                ukupnaCijenaProizvoda: cijena,
              };
              console.log(this.maxRacun.racunID);
              axios
                .get("http://localhost:3000/checkItem", {
                  params: {
                    racunID: this.maxRacun.racunID,
                    proizvodID: id,
                  },
                })
                .then((response) => {
                  console.log(response.data.data);
                  if (response.data.data.length < 1) {
                    //console.log(response.data.data.length);
                    console.log("Stavka ne postoji");
                    axios
                      .post("http://localhost:3000/newBillItem", stavkaRacuna)
                      .then((response) => {
                        //console.log(response);
                        this.$q.notify("Dodano u košaricu");
                      });
                  } else {
                    //console.log(response.data.data.length);
                    console.log("Stavka vec postoji");
                    var brojPostojeci = parseInt(
                      response.data.data[0].kolicinaProizvoda
                    );
                    var dodatak = parseInt(data);
                    var zbroj = brojPostojeci + dodatak;
                    //console.log(zbroj);
                    const stavka = {
                      kolicinaProizvoda: zbroj,
                      ukupnaCijenaProizvoda:
                        zbroj * response.data.data[0].cijenaProizvoda,
                      stavkeID: response.data.data[0].stavkeID,
                    };
                    //console.log(stavka);
                    axios
                      .put("http://localhost:3000/updateItem", stavka)
                      .then((response) => {
                        this.$q.notify("Uspjesno azurirana kolicina");
                      })
                      .catch((error) => {
                        console.log(error);
                      });
                  }
                });
            });

            //axios da prvo otvori račun i onda idemo na dodavanje predmeta u račun, nakon prvog dodavanja onda je racun = true
            //ako je korisnik logiran potreban je drugi axios poziv
          } else {
            axios.get("http://localhost:3000/maxBills").then((response) => {
              this.maxRacun = response.data.data[0];
              this.store.billID = this.maxRacun.racunID;
              var cijena = kolicina * price;
              const stavkaRacuna = {
                racunID: this.maxRacun.racunID,
                proizvodID: id,
                kolicinaProizvoda: kolicina,
                ukupnaCijenaProizvoda: cijena,
              };
              console.log(this.maxRacun.racunID);
              axios
                .get("http://localhost:3000/checkItem", {
                  params: {
                    racunID: this.maxRacun.racunID,
                    proizvodID: id,
                  },
                })
                .then((response) => {
                  console.log(response.data.data);
                  if (response.data.data.length < 1) {
                    //console.log(response.data.data.length);
                    console.log("Stavka ne postoji");
                    axios
                      .post("http://localhost:3000/newBillItem", stavkaRacuna)
                      .then((response) => {
                        //console.log(response);
                        this.$q.notify("Dodano u košaricu");
                      });
                  } else {
                    //console.log(response.data.data.length);
                    console.log("Stavka vec postoji");
                    var brojPostojeci = parseInt(
                      response.data.data[0].kolicinaProizvoda
                    );
                    var dodatak = parseInt(data);
                    var zbroj = brojPostojeci + dodatak;
                    //console.log(zbroj);
                    const stavka = {
                      kolicinaProizvoda: zbroj,
                      ukupnaCijenaProizvoda:
                        zbroj * response.data.data[0].cijenaProizvoda,
                      stavkeID: response.data.data[0].stavkeID,
                    };
                    //console.log(stavka);
                    axios
                      .put("http://localhost:3000/updateItem", stavka)
                      .then((response) => {
                        this.$q.notify("Uspjesno azurirana kolicina");
                      })
                      .catch((error) => {
                        console.log(error);
                      });
                  }
                });
            });
          }
        })
        .onCancel(() => {
          //window.location.reload();
        })
        .onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        });
    },
    otvoriProizvod(id) {
      this.$router.push({
        path: "/proizvod/" + id,
        params: { id: id },
      });
    },
    // zatvoriRacun() {
    //   this.store.createdBill = false;
    // },
  },
});
</script>

<style scoped>
.webshop-items {
  max-height: 500px;
  max-width: 500px;

  min-height: 500px;
  min-width: 500px;
}
</style>
