import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCzu0eB2OKKWaluF_M_7WcfmJ5Sa6Xa0UQ",
  authDomain: "sip-and-chill-9c5f0.firebaseapp.com",
  projectId: "sip-and-chill-9c5f0",
  storageBucket: "sip-and-chill-9c5f0.firebasestorage.app",
  messagingSenderId: "223547052485",
  appId: "1:223547052485:web:d8b838623830ebf3ba7bac",
  measurementId: "G-355G7DV7YF",
};

const app = initializeApp(firebaseConfig);

// Analytics safe
let analytics;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.log("Analytics not supported.");
}

const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {

  const screens = {
    login: document.getElementById("login-screen"),
    menu: document.getElementById("menu-screen"),
    iceCreams: document.getElementById("ice-creams-screen"),
    juice: document.getElementById("juice-screen"),
    spJuice: document.getElementById("sp-juice-screen"),
    lassiItems: document.getElementById("lassi-items"),
    faloodas: document.getElementById("faloodas-screen"),
    profile: document.getElementById("profile-screen"),
    order: document.getElementById("order-screen"),
    chicken: document.getElementById("chicken-screen"),
    crispyChickenDrumsticks: document.getElementById("crispy-chicken-drumsticks-screen"),
    crispyChickenPopcorn: document.getElementById("crispy-chicken-popcorn-screen"),
    crispyBonelessStripes: document.getElementById("crispy-boneless-stripes-screen"),
    frenchFries: document.getElementById("french-fries-screen"),
    springPotato: document.getElementById("spring-potato-screen"),
    crispyChickenLollipops: document.getElementById("crispy-chicken-lollipops-screen"),
    highProtienCombosSp: document.getElementById("high-protien-combos-sp-screen"),
    familyBucketCombo: document.getElementById("family-bucket-combo-screen"),
    bigBucketCombo: document.getElementById("big-bucket-combo-screen"),
    miniBucketCombo: document.getElementById("mini-bucket-combo-screen"),
    highProtienCombos: document.getElementById("high-protien-combos-screen"),
  };

  let previousScreen = "menu";
  let currentUser = null;
  let currentOrder = null;

  const orderSummary = document.getElementById("order-summary");

  // USERNAME VALIDATION
  function isValidUsername(username) {
    const regex = /^[A-Z]+$/;
    return regex.test(username);
  }

  // AUTO CAPS + REMOVE SPACES
  document.getElementById("username").addEventListener("input", function () {
    this.value = this.value.toUpperCase().replace(/\s/g, "");
  });

  // SCREEN SWITCH
  function showScreen(screenName) {
    Object.values(screens).forEach((screen) => {
      if (screen) screen.classList.remove("active");
    });

    if (screens[screenName]) {
      screens[screenName].classList.add("active");
    }
  }

  // CHECK LOGIN SESSION
  const storedUser = localStorage.getItem("currentUser");

  if (storedUser) {
    currentUser = JSON.parse(storedUser);

    document.getElementById("profile-username").innerText =
      currentUser.username;
    document.getElementById("profile-mobile").innerText =
      currentUser.mobileNumber;

    showScreen("menu");
  } else {
    showScreen("login");
  }

  // LOGIN
  document.getElementById("btn-login").addEventListener("click", async () => {

    const usernameInput = document.getElementById("username").value.trim();
    const mobileInput = document.getElementById("mobileNumber").value.trim();

    if (!usernameInput || !mobileInput) {
      alert("Please enter username and mobile number.");
      return;
    }

    if (!isValidUsername(usernameInput)) {
      alert("Enter CAPS username without spaces");
      return;
    }

    const btn = document.getElementById("btn-login");
    const original = btn.innerText;

    btn.innerText = "LOGGING IN...";
    btn.disabled = true;

    try {

      const q = query(
        collection(db, "users"),
        where("username", "==", usernameInput),
        where("mobileNumber", "==", mobileInput)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {

        const userData = querySnapshot.docs[0].data();

        currentUser = {
          username: userData.username,
          mobileNumber: userData.mobileNumber,
        };

        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        document.getElementById("profile-username").innerText =
          currentUser.username;
        document.getElementById("profile-mobile").innerText =
          currentUser.mobileNumber;

        showScreen("menu");

      } else {
        alert("Invalid username or mobile number.");
      }

    } catch (error) {
      console.error(error);
      alert("Database connection error.");
    }

    btn.innerText = original;
    btn.disabled = false;

  });

  // REGISTER
  document.getElementById("btn-register").addEventListener("click", async () => {

    const usernameInput = document.getElementById("username").value.trim();
    const mobileInput = document.getElementById("mobileNumber").value.trim();

    if (!usernameInput || !mobileInput) {
      alert("Enter username and mobile number.");
      return;
    }

    if (!isValidUsername(usernameInput)) {
      alert("Enter CAPS username without spaces");
      return;
    }

    const btn = document.getElementById("btn-register");
    const original = btn.innerText;

    btn.innerText = "REGISTERING...";
    btn.disabled = true;

    try {

      const q = query(
        collection(db, "users"),
        where("mobileNumber", "==", mobileInput)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {

        alert("Mobile already registered.");

      } else {

        await addDoc(collection(db, "users"), {
          username: usernameInput,
          mobileNumber: mobileInput,
          createdAt: serverTimestamp(),
        });

        alert("Registration successful. Please login.");

        document.getElementById("username").value = "";
        document.getElementById("mobileNumber").value = "";
      }

    } catch (error) {
      console.error(error);
      alert("Database error.");
    }

    btn.innerText = original;
    btn.disabled = false;

  });

  // MENU NAVIGATION
  document.querySelectorAll(".menu-item:not(.disabled)").forEach((item) => {

    item.addEventListener("click", () => {

      const target = item.getAttribute("data-target");

      if (target) showScreen(target);

    });

  });

  // BACK BUTTON
  document.querySelectorAll(".back-btn").forEach((btn) => {

    btn.addEventListener("click", () => {

      const screenId = btn.closest(".screen").id;

      if (screenId === "order-screen") {
        showScreen(previousScreen);
      } else {
        showScreen("menu");
      }

    });

  });

  // ORDER BUTTON
  document.querySelectorAll(".order-btn").forEach((btn) => {

    btn.addEventListener("click", () => {

      const itemName = btn.getAttribute("data-item");
      const itemPrice = btn.getAttribute("data-price");

      currentOrder = {
        item: itemName,
        price: itemPrice,
      };

      const screenId = btn.closest(".screen").id;

      Object.entries(screens).forEach(([key, val]) => {
        if (val && val.id === screenId) previousScreen = key;
      });

      orderSummary.innerHTML = `
      <h3>Selected Item</h3>
      <p><span>${itemName}</span> <strong>₹${itemPrice}</strong></p>
      `;

      orderSummary.classList.add("active");

      showScreen("order");

    });

  });

 
  // PROFILE
  document.querySelector(".profile-icon").addEventListener("click", () => {
    showScreen("profile");
  });

  // LOGOUT
  document.getElementById("btn-logout").addEventListener("click", () => {

    currentUser = null;
    localStorage.removeItem("currentUser");

    document.getElementById("username").value = "";
    document.getElementById("mobileNumber").value = "";

    showScreen("login");

  });

});