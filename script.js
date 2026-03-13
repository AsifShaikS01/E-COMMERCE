import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
getFirestore,
collection,
addDoc,
getDocs,
query,
where,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
apiKey: "AIzaSyCzu0eB2OKKWaluF_M_7WcfmJ5Sa6Xa0UQ",
authDomain: "sip-and-chill-9c5f0.firebaseapp.com",
projectId: "sip-and-chill-9c5f0",
storageBucket: "sip-and-chill-9c5f0.appspot.com",
messagingSenderId: "223547052485",
appId: "1:223547052485:web:d8b838623830ebf3ba7bac"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {

const screens = {
login: document.getElementById("login-screen"),
menu: document.getElementById("menu-screen"),
order: document.getElementById("order-screen"),
profile: document.getElementById("profile-screen")
};

let currentUser = null;
let currentOrder = null;

function showScreen(name){

Object.values(screens).forEach(s => s.classList.remove("active"));
screens[name].classList.add("active");

}

const storedUser = localStorage.getItem("currentUser");

if(storedUser){

currentUser = JSON.parse(storedUser);

document.getElementById("profile-username").innerText=currentUser.username;
document.getElementById("profile-mobile").innerText=currentUser.mobileNumber;

showScreen("menu");

}else{

showScreen("login");

}

function isValidUsername(username){
return /^[A-Z]+$/.test(username);
}

document.getElementById("username").addEventListener("input",function(){
this.value=this.value.toUpperCase().replace(/\s/g,"");
});

document.getElementById("btn-login").addEventListener("click",async()=>{

const username=document.getElementById("username").value.trim();
const mobile=document.getElementById("mobileNumber").value.trim();

if(!username||!mobile){
alert("Enter username and mobile");
return;
}

if(!isValidUsername(username)){
alert("Username must be CAPS without spaces");
return;
}

const q=query(
collection(db,"users"),
where("username","==",username),
where("mobileNumber","==",mobile)
);

const snapshot=await getDocs(q);

if(!snapshot.empty){

currentUser={username,mobileNumber:mobile};

localStorage.setItem("currentUser",JSON.stringify(currentUser));

document.getElementById("profile-username").innerText=username;
document.getElementById("profile-mobile").innerText=mobile;

showScreen("menu");

}else{

alert("Invalid login");

}

});

document.getElementById("btn-register").addEventListener("click",async()=>{

const username=document.getElementById("username").value.trim();
const mobile=document.getElementById("mobileNumber").value.trim();

if(!username||!mobile){
alert("Enter username and mobile");
return;
}

await addDoc(collection(db,"users"),{
username,
mobileNumber:mobile,
createdAt:serverTimestamp()
});

alert("Registration successful. Now login.");

});

document.querySelectorAll(".order-btn").forEach(btn=>{

btn.addEventListener("click",()=>{

const item=btn.dataset.item;
const price=btn.dataset.price;

currentOrder={item,price};

document.getElementById("order-summary").innerHTML=`
<h3>${item}</h3>
<p>Price: ₹${price}</p>
`;

showScreen("order");

});

});

const form=document.getElementById("form");
const submitBtn=document.getElementById("btn-confirm-order");

form.addEventListener("submit",async(e)=>{

e.preventDefault();

const fullname=document.getElementById("fullname").value.trim();
const mobile=document.getElementById("mobile").value.trim();
const address=document.getElementById("address").value.trim();

if(!fullname||!mobile||!address){
alert("Fill all fields");
return;
}

submitBtn.innerText="Processing...";
submitBtn.disabled=true;

try{

await addDoc(collection(db,"orders"),{

customerName:fullname,
customerMobile:mobile,
customerAddress:address,
itemName:currentOrder.item,
itemPrice:currentOrder.price,
timestamp:serverTimestamp()

});

const formData=new FormData();

formData.append("access_key","90b32d72-254f-4cbb-995c-e48864099a46");
formData.append("subject","New Order - Sip & Chill");

formData.append("message",
`New Order

Customer: ${fullname}
Mobile: ${mobile}
Address: ${address}

Order Item: ${currentOrder.item}
Price: ₹${currentOrder.price}`
);

await fetch("https://api.web3forms.com/submit",{
method:"POST",
body:formData
});

alert("Order placed successfully!");

form.reset();

showScreen("menu");

}catch(err){

console.error(err);
alert("Order failed");

}

submitBtn.innerText="Confirm Order";
submitBtn.disabled=false;

});

document.querySelector(".profile-icon").addEventListener("click",()=>{
showScreen("profile");
});

document.getElementById("btn-logout").addEventListener("click",()=>{
localStorage.removeItem("currentUser");
showScreen("login");
});

document.querySelectorAll(".back-btn").forEach(btn=>{
btn.addEventListener("click",()=>showScreen("menu"));
});

});