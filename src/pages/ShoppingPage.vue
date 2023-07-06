<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md">
      <div class="row justify-center q-gutter-sm">
        <q-intersection
          v-for="shoppingitem in shoppingItems"
          :key="shoppingitem.stavkeID"
          class="my-card"
        >
          <q-card class="my-card">
            <q-card-section>
              <img :src="shoppingitem.imgData" class="webshop-items" />
              <div class="text-h6">{{ shoppingitem.nazivProizvoda }}</div>
              <div class="text-subtitle2">
                Količina: {{ shoppingitem.kolicinaProizvoda }}
              </div>
              <div class="text-subtitle2">
                Jedinična cijena: {{ shoppingitem.pojedinacnaCijena }} €
              </div>
              <div class="text-subtitle2">
                Ukupna cijena: {{ shoppingitem.ukupnaCijenaProizvoda }} €
              </div>
            </q-card-section>
            <q-separator />
            <q-card-actions vertical>
              <q-btn
                flat
                @click="
                  promjeniKoličinu(
                    shoppingitem.stavkeID,
                    shoppingitem.kolicinaProizvoda,
                    shoppingitem.pojedinacnaCijena
                  )
                "
                >Promjeni količinu</q-btn
              >
              <q-btn
                flat
                color="red"
                @click="
                  brisiProizvod(shoppingitem.stavkeID, shoppingitem.racunID)
                "
                >Ukloni iz košarice</q-btn
              >
            </q-card-actions>
          </q-card>
        </q-intersection>
      </div>
    </div>
    <div v-if="this.shoppingItems != 0">
      <q-btn
        @click="zatvoriRacun(shoppingItems.racunID)"
        label="Završi kupovinu"
      ></q-btn>
      <div v-if="!this.store.loggedUser">
        <q-dialog v-model="dialogVisible">
          <q-card>
            <q-card-section>
              <q-card-title> Upozorenje </q-card-title>
              <div></div>
              <q-card-main> Korisnik nije prijavljen! </q-card-main>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn color="red" label="Odustani" @click="odustani()" />
              <q-btn
                color="primary"
                label="Registracija"
                @click="registracija()"
              />
              <q-btn color="primary" label="Prijava" @click="prijava()" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>
    </div>
  </q-page>
</template>

<script>
import axios from "axios";
import { defineComponent } from "vue";
import { useDataStore } from "../store/dataStore.js";

export default defineComponent({
  name: "ShoppingPage",

  setup() {
    const store = useDataStore();

    return {
      store,
    };
  },

  data() {
    return {
      shoppingItems: {
        stavkeID: "",
        racunID: "",
        proizvodID: "",
        kolicinaProizvoda: "",
        ukupnaCijenaProizvoda: "",
        nazivProizvoda: "",
        cijenaProizvoda: "",
        opisProizvoda: "",
        imgData: "",
      },
      items: {
        proizvodID: "",
        nazivProizvoda: "",
        cijenaProizvoda: "",
        opisProizvoda: "",
      },
      racunID: "",
      dialogVisible: false,
    };
  },

  mounted: function () {
    //console.log(this.store.userName, this.store.userID);
    if (this.store.loggedUser) {
      axios
        .get("http://localhost:3000/shoppingItems/" + this.store.userID)
        .then((response) => {
          this.shoppingItems = response.data.data;
          //console.log(this.shoppingItems);
          if (this.shoppingItems.length === 0) {
            //console.log("Nema proizvoda u košarici");
            this.$q.notify("Nema proizvoda u košarici");
          } else {
            this.shoppingItems.forEach((shoppingItem) => {
              //console.log(item.slika.data);
              this.racunID = shoppingItem.racunID;
              const bufferData = shoppingItem.slika.data;
              const uint8Array = new Uint8Array(bufferData);
              const blob = new Blob([uint8Array], { type: "image/jpeg" });
              const reader = new FileReader();
              reader.onloadend = () => {
                shoppingItem.imgData = reader.result;
              };
              //console.log(item.imgData);
              reader.readAsDataURL(blob);
              //console.log(this.racunID);
              //console.log(shoppingItem.pojedinacnaCijena);
            });
          }
        })
        .catch((error) => {
          console.log(error);
          this.$q.notify("Došlo je do pogreške");
        });
    } else {
      axios
        .get("http://localhost:3000/shoppingItems")
        .then((response) => {
          this.shoppingItems = response.data.data;
          //console.log(this.shoppingItems);
          if (this.shoppingItems.length === 0) {
            //console.log("Nema proizvoda u košarici");
            this.$q.notify("Nema proizvoda u košarici");
          } else {
            this.shoppingItems.forEach((shoppingItem) => {
              //console.log(item.slika.data);
              const bufferData = shoppingItem.slika.data;
              const uint8Array = new Uint8Array(bufferData);
              const blob = new Blob([uint8Array], { type: "image/jpeg" });
              const reader = new FileReader();
              reader.onloadend = () => {
                shoppingItem.imgData = reader.result;
              };
              //console.log(item.imgData);
              reader.readAsDataURL(blob);
              //console.log(shoppingItem.pojedinacnaCijena);
            });
          }
        })
        .catch((error) => {
          console.log(error);
          this.$q.notify("Došlo je do pogreške");
        });
    }
  },

  methods: {
    zatvoriRacun() {
      //console.log(this.racunID);
      if (!this.store.loggedUser) {
        this.dialogVisible = true;
      } else {
        console.log("Korisnik je prijavljen");
        axios
          .put("http://localhost:3000/closeBill/" + this.racunID)
          .then((response) => {
            //console.log(response.data.data);
            let seconds = 5;
            //this.$q.notify("Iznos računa je: " + response.data.data + " €");
            this.$q
              .dialog({
                title: "Iznos računa",
                message: "Iznos računa je " + response.data.data + " €",
              })
              .onOk(() => {
                // console.log('OK')
              })
              .onCancel(() => {
                // console.log('Cancel')
              })
              .onDismiss(() => {
                clearTimeout(timer);
                // console.log('I am triggered on both OK and Cancel')
              });
            this.store.billID = "";
            this.store.createdBill = false;
            if (this.store.loggedUser) {
              axios
                .get("http://localhost:3000/shoppingItems/" + this.store.userID)
                .then((response) => {
                  this.shoppingItems = response.data.data;
                  //console.log(this.shoppingItems);
                  if (this.shoppingItems.length === 0) {
                    //console.log("Nema proizvoda u košarici");
                    this.$q.notify("Nema proizvoda u košarici");
                  } else {
                    this.shoppingItems.forEach((shoppingItem) => {
                      //console.log(item.slika.data);
                      this.racunID = shoppingItem.racunID;
                      const bufferData = shoppingItem.slika.data;
                      const uint8Array = new Uint8Array(bufferData);
                      const blob = new Blob([uint8Array], {
                        type: "image/jpeg",
                      });
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        shoppingItem.imgData = reader.result;
                      };
                      //console.log(item.imgData);
                      reader.readAsDataURL(blob);
                      //console.log(this.racunID);
                      //console.log(shoppingItem.pojedinacnaCijena);
                    });
                  }
                })
                .catch((error) => {
                  console.log(error);
                  this.$q.notify("Došlo je do pogreške");
                });
            } else {
              axios
                .get("http://localhost:3000/shoppingItems")
                .then((response) => {
                  this.shoppingItems = response.data.data;
                  //console.log(this.shoppingItems);
                  if (this.shoppingItems.length === 0) {
                    //console.log("Nema proizvoda u košarici");
                    this.$q.notify("Nema proizvoda u košarici");
                  } else {
                    this.shoppingItems.forEach((shoppingItem) => {
                      //console.log(item.slika.data);
                      const bufferData = shoppingItem.slika.data;
                      const uint8Array = new Uint8Array(bufferData);
                      const blob = new Blob([uint8Array], {
                        type: "image/jpeg",
                      });
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        shoppingItem.imgData = reader.result;
                      };
                      //console.log(item.imgData);
                      reader.readAsDataURL(blob);
                      //console.log(shoppingItem.pojedinacnaCijena);
                    });
                  }
                })
                .catch((error) => {
                  console.log(error);
                  this.$q.notify("Došlo je do pogreške");
                });
            }
          })
          .catch((error) => {
            this.$q.notify("Došlo je do pogreške");
            console.log(error);
          });
      }
      //na kraju dodati da je this.store.billID = ""

      // if (!this.store.loggedUser) {
      //   this.$q
      //     .dialog({
      //       title: "Upozorenje",
      //       message: "Korisnik nije prijavljen!",
      //       ok: {
      //         push: true,
      //         label: "Prijava",
      //       },
      //       cancel: {
      //         push: true,
      //         label: "Registracija",
      //       },
      //       persistent: {
      //         push: true,
      //         label: "Odustani",
      //       },
      //     })
      //     .onOk(() => {
      //       this.$router.push("/login");
      //     })
      //     .onCancel(() => {
      //       this.$router.push("/signup");
      //     })
      //     .onDismiss(() => {
      //       // console.log('I am triggered on both OK and Cancel')
      //     });
      // }

      //
    },
    odustani() {
      this.dialogVisible = false;
    },

    registracija() {
      this.$router.push("/signup");
    },

    prijava() {
      this.$router.push("/login");
    },
    promjeniKoličinu(id, kolicina, cijena) {
      //console.log(cijena);
      this.$q
        .dialog({
          title: "Promjeni količinu",
          message: "odaberi novu količinu",
          prompt: {
            model: kolicina,
            type: "number",

            // native attributes:
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
          var novaCijena = data * cijena;
          const updateStavka = {
            stavkeID: id,
            kolicinaProizvoda: data,
            ukupnaCijenaProizvoda: novaCijena,
          };

          axios
            .put("http://localhost:3000/update", updateStavka)
            .then((response) => {
              this.$q.notify("Uspješno ažurirana promjena količine");
              //location.reload();
              // console.log(
              //   this.store.loggedUser,
              //   this.store.userID,
              //   this.store.userName
              // );
              if (this.store.loggedUser) {
                axios
                  .get(
                    "http://localhost:3000/shoppingItems/" + this.store.userID
                  )
                  .then((response) => {
                    this.shoppingItems = response.data.data;
                    //console.log(this.shoppingItems);
                    if (this.shoppingItems.length === 0) {
                      //console.log("Nema proizvoda u košarici");
                      this.$q.notify("Nema proizvoda u košarici");
                    } else {
                      this.shoppingItems.forEach((shoppingItem) => {
                        //console.log(item.slika.data);
                        const bufferData = shoppingItem.slika.data;
                        const uint8Array = new Uint8Array(bufferData);
                        const blob = new Blob([uint8Array], {
                          type: "image/jpeg",
                        });
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          shoppingItem.imgData = reader.result;
                        };
                        //console.log(item.imgData);
                        reader.readAsDataURL(blob);
                        //console.log(shoppingItem.pojedinacnaCijena);
                      });
                    }
                  })
                  .catch((error) => {
                    console.log(error);
                    this.$q.notify("Došlo je do pogreške");
                  });
              } else {
                axios
                  .get("http://localhost:3000/shoppingItems")
                  .then((response) => {
                    this.shoppingItems = response.data.data;
                    //console.log(this.shoppingItems);
                    if (this.shoppingItems.length === 0) {
                      //console.log("Nema proizvoda u košarici");
                      this.$q.notify("Nema proizvoda u košarici");
                    } else {
                      this.shoppingItems.forEach((shoppingItem) => {
                        //console.log(item.slika.data);
                        const bufferData = shoppingItem.slika.data;
                        const uint8Array = new Uint8Array(bufferData);
                        const blob = new Blob([uint8Array], {
                          type: "image/jpeg",
                        });
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          shoppingItem.imgData = reader.result;
                        };
                        //console.log(item.imgData);
                        reader.readAsDataURL(blob);
                        //console.log(shoppingItem.pojedinacnaCijena);
                      });
                    }
                  })
                  .catch((error) => {
                    console.log(error);
                    this.$q.notify("Došlo je do pogreške");
                  });
              }
            })
            .catch((error) => {
              console.log(error);
              this.$q.notify("Došlo je do pogreške");
            });
        })
        .onCancel(() => {
          // console.log('>>>> Cancel')
        })
        .onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        });
    },
    brisiProizvod(id, racunID) {
      //console.log(id);

      this.$q
        .dialog({
          title: "Potvrda brisanja",
          message: "Jeste li sigurni da želite ukloniti proizvod iz košarice?",
          ok: {
            label: "Obriši",
            color: "negative",
            push: true,
          },
          cancel: {
            push: true,
            label: "Odustani",
          },
          persistent: true,
        })
        .onOk(() => {
          axios
            .delete("http://localhost:3000/deleteCartItem/" + id)
            .then((response) => {
              this.$q.notify("Stavka obrisana iz košarice");
              //location.reload();
              if (this.store.loggedUser) {
                axios
                  .get(
                    "http://localhost:3000/shoppingItems/" + this.store.userID
                  )
                  .then((response) => {
                    this.shoppingItems = response.data.data;
                    console.log(this.shoppingItems);
                    if (this.shoppingItems.length === 0) {
                      //console.log("Nema proizvoda u košarici");
                      this.$q.notify("Nema proizvoda u košarici");
                      axios
                        .delete("http://localhost:3000/deleteBill/" + racunID)
                        .then((response) => {
                          //console.log("Obrisan prazni racun");
                        });
                    } else {
                      this.shoppingItems.forEach((shoppingItem) => {
                        //console.log(item.slika.data);
                        const bufferData = shoppingItem.slika.data;
                        const uint8Array = new Uint8Array(bufferData);
                        const blob = new Blob([uint8Array], {
                          type: "image/jpeg",
                        });
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          shoppingItem.imgData = reader.result;
                        };
                        //console.log(item.imgData);
                        reader.readAsDataURL(blob);
                        //console.log(shoppingItem.pojedinacnaCijena);
                      });
                    }
                  })
                  .catch((error) => {
                    console.log(error);
                    this.$q.notify("Došlo je do pogreške");
                  });
              } else {
                axios
                  .get("http://localhost:3000/shoppingItems")
                  .then((response) => {
                    this.shoppingItems = response.data.data;
                    //console.log(this.shoppingItems);
                    if (this.shoppingItems.length === 0) {
                      //console.log("Nema proizvoda u košarici");
                      this.$q.notify("Nema proizvoda u košarici");
                    } else {
                      this.shoppingItems.forEach((shoppingItem) => {
                        //console.log(item.slika.data);
                        const bufferData = shoppingItem.slika.data;
                        const uint8Array = new Uint8Array(bufferData);
                        const blob = new Blob([uint8Array], {
                          type: "image/jpeg",
                        });
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          shoppingItem.imgData = reader.result;
                        };
                        //console.log(item.imgData);
                        reader.readAsDataURL(blob);
                        //console.log(shoppingItem.pojedinacnaCijena);
                      });
                    }
                  })
                  .catch((error) => {
                    console.log(error);
                    this.$q.notify("Došlo je do pogreške");
                  });
              }
            })
            .catch((error) => {
              this.$q.notify("Došlo je do pogreške");
              console.log(error);
            });
        })
        .onCancel(() => {
          // console.log('>>>> Cancel')
        })
        .onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        });
    },
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
