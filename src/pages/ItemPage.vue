<template>
  <div class="item-page">
    <div class="item-details">
      <h2 class="item-title">{{ item.nazivProizvoda }}</h2>
      <p class="item-description">{{ item.opisProizvoda }}</p>
      <p class="item-description">{{ item.cijenaProizvoda }} €</p>
    </div>
    <!-- <div class="item-carousel"> -->
    <!-- <q-carousel animated infinite> -->
    <!-- <q-carousel-slide
          v-bind="$attrs"
          v-for="image in images"
          :key="image.slikaID"
          :img-src="image.imgData"
        /> -->
    <!-- <q-carousel-slide
          :name="2"
          img-src="https://cdn.quasar.dev/img/parallax1.jpg"
        />
        <q-carousel-slide
          :name="3"
          img-src="https://cdn.quasar.dev/img/parallax2.jpg"
        />
        <q-carousel-slide
          :name="4"
          img-src="https://cdn.quasar.dev/img/quasar.jpg"
        />
      </q-carousel> -->
    <!-- </div> -->
    <div class="item-action">
      <q-btn
        class="item-button"
        color="primary"
        label="Dodaj u košaricu"
        icon-right="shopping_cart"
        @click="buyNow(id, item.cijenaProizvoda)"
      />
    </div>
    <div>
      <q-intersection v-for="image in images" :key="image.slikaID">
        <q-card>
          <q-card-section>
            <img :src="image.imgData" class="webshop-items" />
          </q-card-section>
        </q-card>
      </q-intersection>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import axios from "axios";
import { ref } from "vue";
import { useDataStore } from "../store/dataStore.js";

export default defineComponent({
  name: "ItemPage",

  setup() {
    const store = useDataStore();

    return {
      store,
    };
  },

  data() {
    return {
      item: {},
      images: [],
      slide: ref(2),
    };
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },

  mounted: function () {
    var idProizvoda = this.id;
    axios
      .get("http://localhost:3000/item/" + idProizvoda)
      .then((response) => {
        //console.log(response.data);
        this.item = response.data.data[0];
        this.images = response.data.data;
        this.images.forEach((image) => {
          const bufferData = image.slika.data;
          //console.log(bufferData);
          const uint8Array = new Uint8Array(bufferData);
          const blob = new Blob([uint8Array], { type: "image/jpeg" });
          const reader = new FileReader();
          reader.onloadend = () => {
            image.imgData = reader.result;
          };
          //console.log(item.imgData);
          reader.readAsDataURL(blob);
        });

        //console.log(this.images);
        //console.log(this.item.nazivProizvoda);s
      })
      .catch((error) => this.$q.notify({ message: "Ne postojeći proizvod" }));
  },

  methods: {
    buyNow(id, price) {
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
              this.store.createdBill = true;
              axios
                .post("http://localhost:3000/newBillnoUser")
                .then((response) => {
                  console.log(response);
                  //this.$q.notify("Stvoren novi racun");
                });
            } else {
              this.store.createdBill = true;
              const racun = {
                korisnikID: this.store.userID,
              };
              axios
                .post("http://localhost:3000/newBill", racun)
                .then((response) => {
                  //console.log(response);
                  //this.$q.notify("Stvoren novi racun");
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
  },
});
</script>

<style scoped>
.item-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.item-details {
  text-align: center;
  margin-bottom: 20px;
}

.item-title {
  font-size: 24px;
  font-weight: bold;
}

.item-description {
  font-size: 16px;
}

.item-carousel {
  max-width: 400px;
  margin-bottom: 20px;
}

.item-action {
  display: flex;
  justify-content: flex-end;
}

.item-button {
  width: 200px;
}

.webshop-items {
  max-height: 500px;
  max-width: 500px;

  min-height: 500px;
  min-width: 500px;
}
</style>
