// store.js
const store = new Vuex.Store({
    state: {
      loggedIn: false,
      role: ""
    },
  
    mutations: {
      setLogin(state) {
        state.loggedIn = true;
      },
      logout(state) {
        state.loggedIn = false;
        state.role = "";  
      },
      setRole(state, role) {
        state.role = role;
      },
    },
  
    plugins: [
      createPersistedState()
    ]
  });
  
  export default store;