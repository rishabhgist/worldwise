import { createContext, useState, useEffect, useContext, useReducer } from "react";

const BASE_URL = "http://localhost:8000";

const CitiesContext = createContext();

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };
    case "cities/loaded":
      return { ...state, isLoading: false, cities: action.payload };
    case "city/loaded":
      return { ...state, isLoading: false, currentCity: action.payload };
    case "cities/created":
      return { ...state, isLoading: false, cities: [...state.cities, action.payload], currentCity: action.payload };
    case "cities/deleted":
      return { ...state, isLoading: false, cities: state.cities.filter((city) => city.id !== action.payload), currentCity: {} };
    case "rejected":
      return { ...state, isLoading: false, error: action.payload };
    default:
      throw new Error("Unknown action type");
  }
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity }, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    async function fetchCities() {
      dispatch({ type: "loading" });
      try {
        const res = await fetch(BASE_URL + "/cities");
        const data = await res.json();
        dispatch({ type: "cities/loaded", payload: data });
      } catch (error) {
        console.log(error);
        dispatch({ type: "rejected", payload: "There was as error loading data" });
        alert("Failed to load data");
      }
    }
    fetchCities();
  }, []);

  async function getCity(id) {
    if (Number(id) === currentCity.id) return;
    try {
      dispatch({ type: "loading" });
      const res = await fetch(BASE_URL + "/cities/" + id);
      const data = await res.json();
      dispatch({ type: "city/loaded", payload: data });
    } catch (error) {
      console.log(error);
      dispatch({ type: "rejected", payload: "There was as error loading data" });
      alert("Failed to load data");
    }
  }

  async function createCity(newCity) {
    try {
      dispatch({ type: "loading" });
      const res = await fetch(BASE_URL + "/cities", { method: "POST", body: JSON.stringify(newCity), headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      dispatch({ type: "cities/created", payload: data });
    } catch (error) {
      console.log(error);
      dispatch({ type: "rejected", payload: "There was as error loading data" });
      alert("Failed to load data");
    }
  }
  async function deleteCity(id) {
    try {
      dispatch({ type: "loading" });
      await fetch(BASE_URL + "/cities/" + id, { method: "delete" });
      dispatch({ type: "cities/deleted", payload: id });
    } catch (error) {
      console.log(error);
      dispatch({ type: "rejected", payload: "There was as error loading data" });
      alert("Error City not delete");
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        getCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined) console.error("Invalid use of context");
  return context;
}

export { CitiesProvider, useCities };
