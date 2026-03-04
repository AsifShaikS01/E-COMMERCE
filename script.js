import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCzu0eB2OKKWaluF_M_7WcfmJ5Sa6Xa0UQ",
    authDomain: "sip-and-chill-9c5f0.firebaseapp.com",
    projectId: "sip-and-chill-9c5f0",
    storageBucket: "sip-and-chill-9c5f0.firebasestorage.app",
    messagingSenderId: "223547052485",
    appId: "1:223547052485:web:d8b838623830ebf3ba7bac",
    measurementId: "G-355G7DV7YF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    // Screen management
    const screens = {
        login: document.getElementById('login-screen'),
        menu: document.getElementById('menu-screen'),
        iceCreams: document.getElementById('ice-creams-screen'),
        juice: document.getElementById('juice-screen'),
        order: document.getElementById('order-screen')
    };

    let previousScreen = 'menu'; // Default previous screen to go back from order page

    function showScreen(screenName) {
        Object.values(screens).forEach(screen => {
            if (screen) {
                screen.classList.remove('active');
            }
        });
        if (screens[screenName]) {
            screens[screenName].classList.add('active');
        }
    }

    // Login logic
    document.getElementById('btn-login').addEventListener('click', async () => {
        const usernameInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value;

        if (!usernameInput || !passwordInput) {
            alert("Please enter your username and password.");
            return;
        }

        const btn = document.getElementById('btn-login');
        const origText = btn.innerText;
        btn.innerText = 'LOGGING IN...';
        btn.disabled = true;

        try {
            const q = query(collection(db, "users"), where("username", "==", usernameInput), where("password", "==", passwordInput));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Login successful
                showScreen('menu');
            } else {
                alert("Invalid username or password.");
            }
        } catch (error) {
            console.error("Error logging in: ", error);
            alert("Error connecting to database.");
        } finally {
            btn.innerText = origText;
            btn.disabled = false;
        }
    });

    // Register logic
    document.getElementById('btn-register').addEventListener('click', async () => {
        const usernameInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value;

        if (!usernameInput || !passwordInput) {
            alert("Please enter a username and password.");
            return;
        }

        const btn = document.getElementById('btn-register');
        const origText = btn.innerText;
        btn.innerText = 'REGISTERING...';
        btn.disabled = true;

        try {
            // Check if user already exists
            const q = query(collection(db, "users"), where("username", "==", usernameInput));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                alert("Username already exists. Please login or choose another.");
            } else {
                // Register user
                await addDoc(collection(db, "users"), {
                    username: usernameInput,
                    password: passwordInput,
                    createdAt: serverTimestamp()
                });
                alert("Registration successful! You are now logged in.");
                showScreen('menu');
            }
        } catch (error) {
            console.error("Error registering user: ", error);
            alert("Error connecting to database.");
        } finally {
            btn.innerText = origText;
            btn.disabled = false;
        }
    });

    // Menu logic
    const menuItems = document.querySelectorAll('.menu-item:not(.disabled)');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetScreen = item.getAttribute('data-target');
            if (targetScreen) {
                showScreen(targetScreen);
            }
        });
    });

    // Back button logic
    const backBtns = document.querySelectorAll('.back-btn');
    backBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentScreen = btn.closest('.screen').id;

            if (currentScreen === 'order-screen') {
                showScreen(previousScreen);
            } else if (currentScreen === 'ice-creams-screen' || currentScreen === 'juice-screen') {
                showScreen('menu');
            }
        });
    });

    // Order item logic
    let currentOrder = null;
    const orderSummary = document.getElementById('order-summary');

    document.querySelectorAll('.order-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemName = btn.getAttribute('data-item');
            const itemPrice = btn.getAttribute('data-price');

            currentOrder = {
                item: itemName,
                price: itemPrice
            };

            // Remember the screen we came from to go back
            const currentScreen = btn.closest('.screen').id;
            if (currentScreen === 'ice-creams-screen') {
                previousScreen = 'iceCreams';
            } else if (currentScreen === 'juice-screen') {
                previousScreen = 'juice';
            }

            // Update order summary
            orderSummary.innerHTML = `
                <h3>Selected Item</h3>
                <p><span>${itemName}</span> <strong>₹${itemPrice}</strong></p>
            `;
            orderSummary.classList.add('active');

            // Navigate to order screen
            showScreen('order');
        });
    });

    // Confirm order logic
    document.getElementById('btn-confirm-order').addEventListener('click', async () => {
        const fullname = document.getElementById('fullname').value.trim();
        const mobile = document.getElementById('mobile').value.trim();
        const address = document.getElementById('address').value.trim();

        if (!fullname || !mobile || !address) {
            alert('Please fill out all fields before ordering.');
            return;
        }

        if (currentOrder) {
            const btnConfirm = document.getElementById('btn-confirm-order');
            const originalText = btnConfirm.innerText;
            btnConfirm.innerText = 'PROCESSING...';
            btnConfirm.disabled = true;

            try {
                // Save order to Firebase Firestore
                await addDoc(collection(db, "orders"), {
                    customerName: fullname,
                    customerMobile: mobile,
                    customerAddress: address,
                    itemName: currentOrder.item,
                    itemPrice: currentOrder.price,
                    timestamp: serverTimestamp()
                });

                // Prepare order message for SMS
                const targetPhone = "9966077583";
                const message = `*New Order: Sip & Chill*\n\n*Customer Details*\n*Name:* ${fullname}\n*Mobile:* ${mobile}\n*Address:* ${address}\n\n*Order Details*\n${currentOrder.item} - ₹${currentOrder.price}`;

                const smsUrl = `sms:${targetPhone}?body=${encodeURIComponent(message)}`;

                // Open SMS app
                window.location.href = smsUrl;

                // Reset form and go back to menu
                document.getElementById('fullname').value = '';
                document.getElementById('mobile').value = '';
                document.getElementById('address').value = '';

                currentOrder = null;
                orderSummary.classList.remove('active');
                showScreen('menu');

            } catch (error) {
                console.error("Error adding document: ", error);
                alert("Sorry, there was an error processing your order. Please try again.");
            } finally {
                btnConfirm.innerText = originalText;
                btnConfirm.disabled = false;
            }
        }
    });
});
