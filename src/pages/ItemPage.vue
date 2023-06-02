<template>
  <q-page class="flex flex-center">
    <h4>aa{{ item.nazivProizvoda }}</h4>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import axios from "axios";

export default defineComponent({
  name: "ItemPage",

  data() {
    return {
      item: {},
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
        this.item = response.data;
        console.log(this.item.nazivProizvoda);
        //console.log(this.item.nazivProizvoda);s
      })
      .catch((error) => this.$q.notify({ message: "Nema proizvoda" }));
  },
});
</script>
