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
        spJuice: document.getElementById('sp-juice-screen'),
        lassiItems: document.getElementById('lassi-items'),
        faloodas: document.getElementById('faloodas-screen'),
        profile: document.getElementById('profile-screen'),
        order: document.getElementById('order-screen')
    };

    let previousScreen = 'menu'; // Default previous screen to go back from order page
    let currentUser = null; // Store user details globally

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
        const mobileInput = document.getElementById('mobileNumber').value.trim();

        if (!usernameInput || !mobileInput) {
            alert("Please enter your username and mobile number.");
            return;
        }

        const btn = document.getElementById('btn-login');
        const origText = btn.innerText;
        btn.innerText = 'LOGGING IN...';
        btn.disabled = true;

        try {
            const q = query(collection(db, "users"), where("username", "==", usernameInput), where("mobileNumber", "==", mobileInput));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Login successful
                const userData = querySnapshot.docs[0].data();
                currentUser = {
                    username: userData.username,
                    mobileNumber: userData.mobileNumber
                };

                // Update profile screen UI
                document.getElementById('profile-username').innerText = currentUser.username;
                document.getElementById('profile-mobile').innerText = currentUser.mobileNumber;

                showScreen('menu');
            } else {
                alert("Invalid username or mobile number.");
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
        const mobileInput = document.getElementById('mobileNumber').value.trim();

        if (!usernameInput || !mobileInput) {
            alert("Please enter a username and mobile number.");
            return;
        }

        const btn = document.getElementById('btn-register');
        const origText = btn.innerText;
        btn.innerText = 'REGISTERING...';
        btn.disabled = true;

        try {
            // Check if user already exists
            const q = query(collection(db, "users"), where("mobileNumber", "==", mobileInput));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                alert("Mobile number already registered. Please login or try another.");
            } else {
                // Register user
                await addDoc(collection(db, "users"), {
                    username: usernameInput,
                    mobileNumber: mobileInput,
                    createdAt: serverTimestamp()
                });
                alert("Registration successful! Please login to continue.");
                document.getElementById('username').value = '';
                document.getElementById('mobileNumber').value = '';
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
            } else if (currentScreen === 'ice-creams-screen' || currentScreen === 'juice-screen' || currentScreen === 'sp-juice-screen' || currentScreen === 'lassi-items' || currentScreen === 'faloodas-screen' || currentScreen === 'profile-screen') {
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
            } else if (currentScreen === 'sp-juice-screen') {
                previousScreen = 'spJuice';
            } else if (currentScreen === 'lassi-items') {
                previousScreen = 'lassiItems';
            } else if (currentScreen === 'faloodas-screen') {
                previousScreen = 'faloodas';
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

    // Profile Click Logic
    document.querySelector('.profile-icon').addEventListener('click', () => {
        showScreen('profile');
    });

    // Logout Logic
    document.getElementById('btn-logout').addEventListener('click', () => {
        currentUser = null;
        document.getElementById('username').value = '';
        document.getElementById('mobileNumber').value = '';
        showScreen('login');
    });
});
