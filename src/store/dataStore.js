import { defineStore } from "pinia";

export const useDataStore = defineStore("DataStore", {
  state: () => ({
    loggedUser: false,
    userID: "",
    userName: "",
    createdBill: false,
    billID: "",
    questionAwns: false,
    items: [],
  }),
  getters: {
    loggedinUser: (state) => {
      state.loggedUser;
      state.userName;
    },
    bill: (state) => state.createdBill,
  },
  actions: {
    increment() {},
  },
});
