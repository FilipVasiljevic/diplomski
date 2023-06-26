<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md">
      <div class="row justify-center q-gutter-sm">
        <!-- <h2>{{ item.nazivProizvoda }}</h2>
        <p>{{ items.opisProizvoda }}</p>
        <div>
          <p>{{ items.cijenaProizvoda }} €</p>
        </div> -->
      </div>
      <!-- <img :src="image.imgData" /> -->
      <q-carousel
        arrows
        autoplay
        infinite
        :slides-per-view="1"
        :slides-per-group="1"
        style="height: 300px"
      >
        <q-carousel-slide v-for="item in items" :key="item.slikaID">
          <div>
            <q-img :src="item.imgData" />
          </div>
        </q-carousel-slide>
        <!-- <q-carousel-slide v-for="item in items" :key="item.slikaID">
          <img :src="item.imgData" />
        </q-carousel-slide> -->
      </q-carousel>
      <q-intersection v-for="item in items" :key="item.slikaID">
        <q-card>
          <q-card-section> <img :src="item.imgData" /> </q-card-section>
        </q-card>
      </q-intersection>

      <!-- <q-carousel-slide
          :name="1"
          img-src="https://cdn.quasar.dev/img/parallax1.jpg"
        />
        <q-carousel-slide
          :name="2"
          img-src="https://cdn.quasar.dev/img/parallax2.jpg"
        />
        <q-carousel-slide
          :name="3"
          img-src="https://cdn.quasar.dev/img/quasar.jpg"
        /> -->
      <!-- </q-carousel> -->
    </div>
  </q-page>
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
      items: [],
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
        this.items = response.data.data;
        console.log(this.items[0]);
        this.items.forEach((item) => {
          const bufferData = item.slika.data;
          const uint8Array = new Uint8Array(bufferData);
          const blob = new Blob([uint8Array], { type: "image/jpg" });
          const reader = new FileReader();
          reader.onloadend = () => {
            item.imgData = reader.result;
            console.log(item.imgData);
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
      console.log(id);
      this.$q
        .dialog({
          title: "Dodaj u košaricu",
          message: "Odaberi količinu",
          prompt: {
            model: 1,
            type: "number",

            min: 0,
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
                  //console.log(response);
                  this.$q.notify("Stvoren novi racun");
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
                  this.$q.notify("Stvoren novi racun");
                });
            }
            axios.get("http://localhost:3000/maxBills").then((response) => {
              this.maxRacun = response.data.data[0];
              var cijena = kolicina * price;
              const stavkaRacuna = {
                racunID: this.maxRacun.racunID,
                proizvodID: id,
                kolicinaProizvoda: kolicina,
                ukupnaCijenaProizvoda: cijena,
              };
              axios
                .post("http://localhost:3000/newBillItem", stavkaRacuna)
                .then((response) => {
                  console.log(response);
                  this.$q.notify("Dodano na racun");
                });
            });

            //axios da prvo otvori račun i onda idemo na dodavanje predmeta u račun, nakon prvog dodavanja onda je racun = true
            //ako je korisnik logiran potreban je drugi axios poziv
          } else {
            axios.get("http://localhost:3000/maxBills").then((response) => {
              this.maxRacun = response.data.data[0];
              var cijena = kolicina * price;
              const stavkaRacuna = {
                racunID: this.maxRacun.racunID,
                proizvodID: id,
                kolicinaProizvoda: kolicina,
                ukupnaCijenaProizvoda: cijena,
              };
              axios
                .post("http://localhost:3000/newBillItem", stavkaRacuna)
                .then((response) => {
                  console.log(response);
                  this.$q.notify("Dodano na racun");
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
