<template>
  <q-page class="flex flex-center">
    <q-card class="my-card" v-for="item in items" :key="item.proizvodID">
      <q-card-section>
        <div><img src="https://cdn.quasar.dev/img/mountains.jpg" /></div>
        <div class="text-h6">{{ item.nazivProizvoda }}</div>
        <div class="text-subtitle2">{{ item.cijenaProizvoda }} €</div>
      </q-card-section>

      <q-separator />

      <q-card-actions vertical>
        <q-btn flat @click="otvoriProizvod(item.proizvodID)"
          >Otvori proizvod</q-btn
        >
        <q-btn flat color="red" @click="dodajUKosaricu(item.proizvodID)"
          >Dodaj u košaricu</q-btn
        >
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
      items: {
        proizvodID: "",
        nazivProizvoda: "",
        cijenaProizvoda: "",
        opisProizvoda: "",
      },
    };
  },
  mounted: function () {
    axios
      .get("http://localhost:3000/items")
      .then((response) => {
        //console.log(response.data);
        this.items = response.data.data;
        //console.log(this.item.nazivProizvoda);
      })
      .catch((error) => this.$q.notify({ message: "Nema proizvoda" }));
  },
  methods: {
    dodajUKosaricu(id) {
      var kolicina;
      this.$q
        .dialog({
          title: "Dodaj u košaricu",
          message: "Odaberi količinu",
          prompt: {
            model: 1,
            type: "number",

            // native attributes:
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
        .onOk(() => {
          kolicina = console.log();
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
  },
});
</script>
