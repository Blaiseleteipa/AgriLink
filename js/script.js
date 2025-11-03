// --------------------------------------------------------------------------
// AgriLink Core Logic (js/script.js) - LIVE FIREBASE FIRESTORE IMPLEMENTATION
// --------------------------------------------------------------------------

// --- 1. CONFIGURATION AND IMPORTS ---

// Your Firebase Web App configuration (Embedded directly)
const firebaseConfig = {
    apiKey: "AIzaSyBdMEDdrQmVzSBzU8YzD-TfxCxT6wGOy34",
    authDomain: "agrilink-47b4e.firebaseapp.com",
    projectId: "agrilink-47b4e",
    storageBucket: "agrilink-47b4e.firebasestorage.app",
    messagingSenderId: "648783631095",
    appId: "1:648783631095:web:742f3cae12d08c84c1f9f2",
    measurementId: "G-1197DB4PS5"
};

// Global variables for Firebase services and state
let db;
let auth;
let userId = null;
let isAuthReady = false;
let allProduce = []; // Cache for filtering listings
const appId = firebaseConfig.appId;
const PRODUCE_COLLECTION_PATH = `artifacts/${appId}/public/data/produce_listings`;

/**
 * 2. Initialize Firebase and Handle Authentication
 */
async function initializeFirebase() {
    // Dynamic imports for Firebase SDKs
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js");
    const { getAuth, signInAnonymously, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");
    const { getFirestore, collection, onSnapshot, query, setLogLevel } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");
    
    // Initialize services
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    setLogLevel('debug'); // Enable console debugging

    // Handle authentication state (Anonymous sign-in for public access)
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            try {
                // Attempt anonymous sign-in if no user is found
                const credential = await signInAnonymously(auth);
                userId = credential.user.uid;
            } catch (error) {
                console.error("Authentication failed:", error.message);
                // If auth fails, use a fallback ID (though data won't save without auth)
                userId = crypto.randomUUID(); 
            }
        } else {
             userId = user.uid;
        }

        isAuthReady = true;
        console.log("Firebase initialized. User ID:", userId);

        // Update UI elements with the user ID and App ID
        const farmerIdEl = document.getElementById('farmer-id');
        if (farmerIdEl) farmerIdEl.textContent = userId;
        const authUidEl = document.getElementById('auth-uid');
        if (authUidEl) authUidEl.textContent = userId;
        const dbAppIdEl = document.getElementById('db-app-id');
        if (dbAppIdEl) dbAppIdEl.textContent = appId;
        
        // Start the real-time listener for the buyers page
        if (document.getElementById('produce-listings')) {
            setupProduceListener(db, query, collection, onSnapshot);
        }
    });
}

/**
 * 3. Farmer Form Submission (Create Listing)
 */
async function handleProduceSubmission(e) {
    e.preventDefault();

    if (!isAuthReady || !db) {
        showMessage('form-message', 'Error: Connection not ready. Please wait.', 'text-danger');
        return;
    }

    const produceForm = e.target;
    const produceName = document.getElementById('produceName').value.trim();
    const quantity = document.getElementById('quantity').value.trim();
    const price = document.getElementById('price').value.trim();
    const location = document.getElementById('location').value.trim();
    const contactNumber = document.getElementById('contactNumber').value.trim();
    
    // --- Validation ---
    if (!produceName || !quantity || !price || !location || !contactNumber) {
        showMessage('form-message', 'Please fill in all fields.', 'text-danger');
        return;
    }
    if (!/^(?:\+?254|0)?(7|1)\d{8}$/.test(contactNumber.replace(/\s/g, ''))) {
        showMessage('form-message', 'Please enter a valid Kenyan phone number (e.g., 07xxxxxxxx).', 'text-danger');
        return;
    }

    const submitButton = produceForm.querySelector('button[type="submit"]');
    const spinner = document.getElementById('submit-spinner');
    spinner.classList.remove('d-none');
    submitButton.disabled = true;

    try {
        const { addDoc, collection, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");
        const produceRef = collection(db, PRODUCE_COLLECTION_PATH);

        await addDoc(produceRef, {
            farmerId: userId,
            produceName: produceName,
            quantity: quantity,
            price: price,
            location: location,
            contactNumber: contactNumber.replace(/\s/g, ''), // Store cleaned number
            timestamp: serverTimestamp()
        });

        showMessage('form-message', 'Success! Your produce is now listed.', 'text-success');
        produceForm.reset();

    } catch (error) {
        console.error("Error posting produce: ", error);
        // This is where "Permission Denied" errors from Firebase rules will appear
        showMessage('form-message', `Error posting: ${error.message}. (Check Firestore Rules)`, 'text-danger');
    } finally {
        spinner.classList.add('d-none');
        submitButton.disabled = false;
        setTimeout(() => showMessage('form-message', '', ''), 5000);
    }
}

/**
 * 4. Buyers View Real-Time Listener (Read)
 */
function setupProduceListener(db, query, collection, onSnapshot) {
    const produceQuery = query(collection(db, PRODUCE_COLLECTION_PATH));
    const listingsContainer = document.getElementById('produce-listings');
    const loadingIndicator = document.getElementById('loading-indicator');

    if (!listingsContainer) return;

    onSnapshot(produceQuery, (snapshot) => {
        const listings = [];
        snapshot.forEach((doc) => {
            listings.push({ id: doc.id, ...doc.data() });
        });

        // Sort by timestamp (newest first)
        listings.sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0));

        allProduce = listings;
        applyFilter(); // Display the updated list
        if (loadingIndicator) loadingIndicator.classList.add('d-none');

    }, (error) => {
        console.error("Error listening to produce data: ", error);
        if (loadingIndicator) loadingIndicator.innerHTML = '<p class="text-danger">Error loading data. Check console/rules.</p>';
    });
}

/**
 * 5. Filtering Logic
 */
window.applyFilter = function() {
    const filterTerm = document.getElementById('searchFilter')?.value.toLowerCase().trim() || '';
    const listingsContainer = document.getElementById('produce-listings');
    const noListingsMessage = document.getElementById('no-listings');

    if (!listingsContainer) return;

    listingsContainer.innerHTML = ''; // Clear existing cards

    const filteredProduce = allProduce.filter(item => {
        const nameMatch = item.produceName?.toLowerCase().includes(filterTerm);
        const locationMatch = item.location?.toLowerCase().includes(filterTerm);
        return nameMatch || locationMatch;
    });

    if (filteredProduce.length === 0) {
        noListingsMessage.classList.remove('d-none');
    } else {
        noListingsMessage.classList.add('d-none');
        filteredProduce.forEach(produce => {
            listingsContainer.appendChild(createProduceCard(produce));
        });
    }
};

window.clearFilter = function() {
    const searchInput = document.getElementById('searchFilter');
    if (searchInput) searchInput.value = '';
    applyFilter();
};

/**
 * 6. Utility Functions for Card Rendering
 */

function createProduceCard(produce) {
    const card = document.createElement('div');
    card.className = 'agri-card p-4 shadow-lg flex flex-column justify-content-between h-100';

    // WhatsApp link formatting
    let cleanedNumber = produce.contactNumber.replace(/\s/g, '');
    if (cleanedNumber.startsWith('0')) {
        cleanedNumber = '254' + cleanedNumber.substring(1);
    }
    if (cleanedNumber.startsWith('+')) {
        cleanedNumber = cleanedNumber.substring(1);
    }
    const whatsappLink = `https://wa.me/${cleanedNumber}?text=Hello! I am interested in buying your ${encodeURIComponent(produce.produceName)} listed on AgriLink (Quantity: ${encodeURIComponent(produce.quantity)}). Can we discuss?`;

    const timestamp = produce.timestamp ? new Date(produce.timestamp.toMillis()).toLocaleString() : 'Just posted';
    
    card.innerHTML = `
        <div>
            <h5 class="fw-bold text-agri-dark">${produce.produceName}</h5>
            <hr class="my-2">
            <p class="mb-1"><span class="fw-semibold">Quantity:</span> ${produce.quantity}</p>
            <p class="mb-1"><span class="fw-semibold">Price:</span> ${produce.price}</p>
            <p class="mb-3"><span class="fw-semibold">Location:</span> ${produce.location}</p>
        </div>
        <div>
            <small class="text-muted d-block mb-3">Posted: ${timestamp}</small>
            <a href="${whatsappLink}" target="_blank" class="agri-btn btn btn-sm w-100 d-flex align-items-center justify-content-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-whatsapp me-2" viewBox="0 0 16 16"><path d="M13.601 2.326A7.8 7.8 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76.957 3.961l-.98 3.54a.5.5 0 0 0 .584.628l3.41-.99a7.9 7.9 0 0 0 3.738.932 7.89 7.89 0 0 0 7.876-7.855c0-3.692-1.439-7.143-4.184-9.789zm-1.42 12.039-1.572-.416a6.49 6.49 0 0 1-3.136-.718c-1.395-.805-2.585-2.02-3.376-3.414-.775-1.353-1.163-2.909-1.163-4.48 0-4.043 3.28-7.318 7.32-7.318 4.04 0 7.317 3.275 7.317 7.318 0 4.043-3.277 7.318-7.317 7.318zm4.496-5.839c-.198-.098-.59-.292-.797-.389-.208-.097-.358-.146-.508-.146-.328 0-.41.05-.53.197s-.46.59-.56.708-.205.12-.38.03c-.495-.145-1.096-.59-2.09-1.55-.78-.75-1.298-1.68-1.458-1.928-.16-.248-.016-.376.104-.494s.228-.277.34-.416c.113-.139.15-.24.225-.375s.15-.277.225-.416c.075-.139.043-.24-.008-.377-.052-.137-.47-.46-.645-.56s-.31-.148-.475-.148c-.287 0-.58.106-.88.423-.3.317-.99.967-.99 2.355 0 1.388 1.01 2.685 1.15 2.875.14.19.467.59.855.75.388.16.83.25 1.258.16.48-.1.97-.47 1.118-.63s.308-.34.438-.49z"/></svg>
                Contact Farmer
            </a>
        </div>
    `;
    return card;
}

function showMessage(elementId, message, className) {
    const el = document.getElementById(elementId);
    if (el) {
        el.className = `mt-4 text-center font-semibold ${className}`;
        el.textContent = message;
    }
}

// Global window load listener to initialize Firebase and attach form handlers
window.onload = function() {
    initializeFirebase();

    const produceForm = document.getElementById('produce-form');
    if (produceForm) {
        produceForm.addEventListener('submit', handleProduceSubmission);
    }
};