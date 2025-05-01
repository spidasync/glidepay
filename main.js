import { auth } from './firebase.js'; // Import Firebase auth instance
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "firebase/auth";

// Run immediately and also when DOM content is loaded
const initApp = function() {
    // --- DOM Element Selectors ---
    const statusDiv = document.getElementById('status');

    // Auth elements
    const authContainer = document.getElementById('authContainer');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const toggleAuthModeBtn = document.getElementById('toggleAuthModeBtn');
    const authError = document.getElementById('authError');
    const authTitle = document.getElementById('authTitle');
    const logoutBtn = document.getElementById('logoutBtn'); // Still selected by ID

    // Header buttons
    const accountBtn = document.getElementById('accountBtn');
    const connectBtn = document.getElementById('connectBtn'); // Wallet connect button

    // Main content areas
    const dashboardContent = document.getElementById('dashboardContent'); // Wallet dashboard
    const accountSection = document.getElementById('accountSection'); // Account info section
    const backToWalletBtn = document.getElementById('backToWalletBtn');
    const accountEmailSpan = document.getElementById('accountEmail');

    // Balance elements
    const ethBalanceDiv = document.getElementById('eth-balance');
    const currencyBalanceDiv = document.getElementById('currency-balance');
    const currencyCodeDiv = document.getElementById('currency-code');
    const toggleBalanceBtn = document.getElementById('toggleBalanceBtn');

    // Account Details elements (Wallet)
    const accountInfoSection = document.querySelector('.account-details-card');
    const accountAddressSpan = document.getElementById('accountAddress');
    const copyAddressBtn = document.getElementById('copyAddressBtn');
    const copyAddressTooltip = copyAddressBtn?.querySelector('.copy-tooltip');

    // Transaction elements
    const sendBtn = document.getElementById('sendBtn');
    const requestBtn = document.getElementById('requestBtn');
    const sendForm = document.getElementById('sendForm');
    const requestForm = document.getElementById('requestForm');
    const cancelSendBtn = document.getElementById('cancelSendBtn');
    const cancelRequestBtn = document.getElementById('cancelRequestBtn');
    const confirmSendBtn = document.getElementById('confirmSendBtn');
    const copyRequestLinkBtn = document.getElementById('copyRequestLinkBtn');
    const transactionList = document.getElementById('transactionList');

    // Modal elements
    const confirmationModal = document.getElementById('confirmationModal');
    const successModal = document.getElementById('successModal');
    const paymentRequestModal = document.getElementById('paymentRequestModal');
    const confirmRecipient = document.getElementById('confirmRecipient');
    const confirmAmount = document.getElementById('confirmAmount');
    const confirmGas = document.getElementById('confirmGas');
    const confirmNote = document.getElementById('confirmNote');
    const finalConfirmBtn = document.getElementById('finalConfirmBtn');
    const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const declinePaymentBtn = document.getElementById('declinePaymentBtn');
    const approvePaymentBtn = document.getElementById('approvePaymentBtn');
    const etherscanLinkContainer = document.getElementById('etherscanLinkContainer');
    const etherscanLink = document.getElementById('etherscanLink');

    // Form inputs
    const sendTo = document.getElementById('sendTo');
    const sendAmount = document.getElementById('sendAmount');
    const sendNote = document.getElementById('sendNote');
    const requestMyAddress = document.getElementById('requestMyAddress');
    const requestAmount = document.getElementById('requestAmount');
    const requestNoteInput = document.getElementById('requestNote');
    const sendError = document.getElementById('sendError'); // Wallet send error

    // Payment Request Modal Display Fields
    const requesterAddressEl = document.getElementById('requesterAddress');
    const requestedAmountEl = document.getElementById('requestedAmount');
    const requestNoteDisplayEl = document.getElementById('requestNoteDisplay');

    // --- State Variables ---
    let currentEthBalance = 0;
    let currentFiatBalance = 0;
    let currentAccount = null; // MetaMask account
    let currentUser = null; // Firebase user
    let isLoginMode = true; // For auth form
    let ethPriceData = {};
    let lastPriceFetchTime = 0;
    const PRICE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    let isBalanceVisible = true;
    const transactions = [];

    // SVG Icons (Keep as they are)
    const eyeIconSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
          <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
          <path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.18l.879-.879a1.65 1.65 0 0 0 1.415-.498l.879-.879a1.65 1.65 0 0 1 2.332-.001l.879.879a1.65 1.65 0 0 0 1.415.498l.879.879a1.65 1.65 0 0 1 2.332.001l.879-.879a1.65 1.65 0 0 0 1.415-.498l.879-.879a1.651 1.651 0 0 1 0 1.18l-.879.879a1.65 1.65 0 0 0-.498 1.415l.879.879a1.65 1.65 0 0 1 0 1.18l-.879.879a1.65 1.65 0 0 0 .498 1.415l.879.879a1.65 1.65 0 0 1-.001 2.332l-.879.879a1.65 1.65 0 0 0-.498 1.415l-.879.879a1.65 1.65 0 0 1-1.18 0l-.879-.879a1.65 1.65 0 0 0-1.415-.498l-.879-.879a1.65 1.65 0 0 1-2.332-.001l-.879.879a1.65 1.65 0 0 0-1.415.498l-.879.879a1.65 1.65 0 0 1-2.332.001l-.879-.879a1.65 1.65 0 0 0-1.415-.498l-.879-.879a1.651 1.651 0 0 1 0-1.18l.879-.879a1.65 1.65 0 0 0 .498-1.415l-.879-.879ZM10 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" clip-rule="evenodd" />
        </svg>`;
    const eyeSlashIconSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
          <path d="M10.75 10.25a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5Z" />
          <path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.18l.879-.879a1.65 1.65 0 0 0 1.415-.498l.879-.879a1.65 1.65 0 0 1 2.332-.001l.879.879a1.65 1.65 0 0 0 1.415.498l.879.879a1.65 1.65 0 0 1 2.332.001l.879-.879a1.65 1.65 0 0 0 1.415-.498l.879-.879a1.651 1.651 0 0 1 0 1.18l-.879.879a1.65 1.65 0 0 0-.498 1.415l.879.879a1.65 1.65 0 0 1 0 1.18l-.879.879a1.65 1.65 0 0 0 .498 1.415l.879.879a1.65 1.65 0 0 1-.001 2.332l-.879.879a1.65 1.65 0 0 0-.498 1.415l-.879.879a1.65 1.65 0 0 1-1.18 0l-.879-.879a1.65 1.65 0 0 0-1.415-.498l-.879-.879a1.65 1.65 0 0 1-2.332-.001l-.879.879a1.65 1.65 0 0 0-1.415.498l-.879.879a1.65 1.65 0 0 1-2.332.001l-.879-.879a1.65 1.65 0 0 0-1.415-.498l-.879-.879a1.651 1.651 0 0 1 0-1.18l.879-.879a1.65 1.65 0 0 0 .498-1.415l-.879-.879ZM10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z" clip-rule="evenodd" />
          <path d="m12.141 12.14-4.282-4.282a.75.75 0 1 0-1.06 1.06l4.282 4.282a.75.75 0 1 0 1.06-1.06Z" />
        </svg>`;

    // --- Helper Functions ---
    const showElement = (el) => el?.classList.remove('hidden');
    const hideElement = (el) => el?.classList.add('hidden');

    const openModal = (modalElement) => {
        if (modalElement) {
            modalElement.classList.add('active');
            const focusableElements = modalElement.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusableElements.length) focusableElements[0].focus();
        }
    };

    const closeModal = (modalElement) => {
        if (modalElement) {
            modalElement.classList.remove('active');
        }
    };

    const closeAllModals = () => {
        closeModal(confirmationModal);
        closeModal(successModal);
        closeModal(paymentRequestModal);
    };

    const updateStatus = (message, type = 'info') => {
        if (statusDiv) {
            statusDiv.textContent = message;
            statusDiv.className = 'status-banner'; // Reset classes
            statusDiv.classList.add(type); // Add type class (info, connected, disconnected, error)
        }
    };

    const formatEth = (balance) => {
        if (balance === 0) return '0.0000 ETH';
        if (balance < 0.0001) return balance.toFixed(8) + ' ETH';
        return balance.toFixed(4) + ' ETH';
    };

    const formatCurrency = (amount, currency) => {
        try {
            return new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        } catch (e) {
            console.warn(`Could not format currency ${currency}:`, e);
            return `${amount.toFixed(2)} ${currency}`; // Fallback
        }
    };

    const updateBalanceDisplay = () => {
        const selectedCurrency = 'USD';
        if (currencyCodeDiv) currencyCodeDiv.textContent = selectedCurrency;

        if (isBalanceVisible) {
            if (currencyBalanceDiv) currencyBalanceDiv.textContent = formatCurrency(currentFiatBalance, selectedCurrency);
            if (ethBalanceDiv) ethBalanceDiv.textContent = formatEth(currentEthBalance);
            if (toggleBalanceBtn) toggleBalanceBtn.innerHTML = eyeSlashIconSVG;
        } else {
            if (currencyBalanceDiv) currencyBalanceDiv.textContent = formatCurrency(0, selectedCurrency).replace(/[\d.,]/g, '*');
            if (ethBalanceDiv) ethBalanceDiv.textContent = '**** ETH';
            if (toggleBalanceBtn) toggleBalanceBtn.innerHTML = eyeIconSVG;
        }
    };

    const toggleBalanceVisibility = () => {
        isBalanceVisible = !isBalanceVisible;
        updateBalanceDisplay();
    };

    const copyToClipboard = async (text, elementToUpdate, tooltipElement) => {
        if (!tooltipElement) return;
        const originalText = tooltipElement.textContent;
        try {
            await navigator.clipboard.writeText(text);
            tooltipElement.textContent = "Copied!";
            if (elementToUpdate) elementToUpdate.classList.add('copied');
            console.log("Copied:", text);
        } catch (err) {
            console.error('Clipboard copy failed:', err);
            tooltipElement.textContent = "Failed!";
            alert("Could not copy to clipboard.");
        } finally {
            setTimeout(() => {
                tooltipElement.textContent = originalText;
                if (elementToUpdate) elementToUpdate.classList.remove('copied');
            }, 1500);
        }
    };

    // --- Transaction History --- (Keep as is)
    const addTransaction = (type, recipient, amount, note, status = 'completed', txHash = null) => {
        const transaction = {
            id: Date.now().toString() + Math.random().toString(16).slice(2),
            type, recipient, amount, note, status, timestamp: new Date(), txHash
        };
        transactions.unshift(transaction);
        if (transactions.length > 20) transactions.pop();
        updateTransactionList();
        return transaction;
    };

    const updateTransactionList = () => {
        if (!transactionList) return;
        transactionList.innerHTML = '';

        if (transactions.length === 0) {
            transactionList.innerHTML = `
                <div class="transaction-item">
                    <div class="transaction-details">
                        <div class="transaction-subject">No transactions yet</div>
                        <div class="transaction-type">Your recent activity will appear here.</div>
                    </div>
                </div>`;
            return;
        }

        transactions.forEach(tx => {
            const item = document.createElement('div');
            item.className = 'transaction-item';
            let typeText = tx.type;
            let amountClass = tx.type;
            let subject = tx.note || (tx.type === 'send' ? 'Payment Sent' : tx.type === 'receive' ? 'Payment Received' : 'Request');
            let displayAddress = tx.recipient;

            if (displayAddress && displayAddress.startsWith('0x') && displayAddress.length > 10) {
                 displayAddress = `${displayAddress.substring(0, 6)}...${displayAddress.substring(displayAddress.length - 4)}`;
            } else if (displayAddress === 'Link Generated') {
                displayAddress = '-';
            }

             if (tx.type === 'request' && tx.recipient === 'Link Generated') {
                subject = 'Payment Link Created'; typeText = 'Request';
            } else if (tx.type === 'send') {
                subject = tx.note || `To: ${displayAddress}`; typeText = 'Send';
            } else if (tx.type === 'receive') {
                 subject = tx.note || `From: ${displayAddress}`; typeText = 'Receive';
            }

            item.innerHTML = `
                <div class="transaction-details">
                    <div class="transaction-subject" title="${tx.note || subject}">${subject}</div>
                    <div class="transaction-type">${typeText} ${tx.status === 'pending' || tx.status === 'submitted' ? `(${tx.status})` : ''}</div>
                </div>
                <div class="transaction-address" title="${tx.recipient}">${displayAddress}</div>
                <div class="transaction-amount ${amountClass}">
                    ${tx.amount} ETH
                </div>
            `;
            transactionList.appendChild(item);
        });
    };

    // --- API & Blockchain Interaction --- (Keep mostly as is)
    const fetchEthPrice = async (currency) => {
        const now = Date.now();
        const cachedPrice = ethPriceData[currency];
        if (cachedPrice && (now - lastPriceFetchTime < PRICE_CACHE_DURATION)) {
            return cachedPrice;
        }
        console.log(`Fetching ETH price for ${currency}...`);
        try {
             const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=${currency.toLowerCase()}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            const price = data?.ethereum?.[currency.toLowerCase()];

            if (price) {
                ethPriceData[currency] = price;
                lastPriceFetchTime = now;
                console.log(`Price updated: 1 ETH = ${price} ${currency}`);
                return price;
            } else {
                throw new Error('Invalid price data format');
            }
        } catch (error) {
            console.error('Error fetching ETH price:', error);
            updateStatus('Unable to fetch price data', 'error'); // Use 'error' type
            return ethPriceData[currency] || null;
        }
    };

    const updateCurrencyBalance = async () => {
        const selectedCurrency = 'USD';
        const ethPrice = await fetchEthPrice(selectedCurrency);
        if (ethPrice !== null) {
            currentFiatBalance = currentEthBalance * ethPrice;
        } else {
            currentFiatBalance = 0;
        }
        updateBalanceDisplay();
    };

    const getBalance = async (account) => {
        if (!window.ethereum || !account) return;
        console.log("Fetching balance for:", account);
        try {
            const balanceWei = await window.ethereum.request({ method: 'eth_getBalance', params: [account, 'latest'] });
            const ethBalance = parseInt(balanceWei, 16) / 1e18;
            currentEthBalance = ethBalance;
            console.log("Balance updated:", ethBalance, "ETH");
            await updateCurrencyBalance();
        } catch (error) {
            console.error('Balance error:', error);
            currentEthBalance = 0;
            currentFiatBalance = 0;
            updateBalanceDisplay();
            updateStatus('Error fetching balance', 'error'); // Use 'error' type
        }
    };

    const estimateGas = async (transactionParams) => {
         if (!window.ethereum || !currentAccount) return null;
         try {
             const gasPriceWei = await window.ethereum.request({ method: 'eth_gasPrice' });
             const gasLimitWei = await window.ethereum.request({ method: 'eth_estimateGas', params: [transactionParams] });
             const gasPriceGwei = parseInt(gasPriceWei, 16) / 1e9;
             const gasLimit = parseInt(gasLimitWei, 16);
             const estimatedCostWei = BigInt(gasLimit) * BigInt(gasPriceWei);
             const estimatedCostEth = Number(estimatedCostWei) / 1e18;
             console.log(`Est. Gas - Limit: ${gasLimit}, Price: ${gasPriceGwei.toFixed(2)} Gwei, Cost: ${estimatedCostEth.toFixed(6)} ETH`);
             return { limit: gasLimit, priceGwei: gasPriceGwei.toFixed(2), costEth: estimatedCostEth.toFixed(6) };
         } catch (error) {
             console.error("Gas estimation error:", error);
             return null;
         }
    };

    const sendEth = async (recipient, amountString, note) => {
        if (!window.ethereum || !currentAccount) {
            showWalletError("MetaMask not connected.");
            return { success: false, txHash: null };
        }
        try {
            const amount = parseFloat(amountString);
            if (isNaN(amount) || amount <= 0) {
                showWalletError("Invalid amount."); return { success: false, txHash: null };
            }
            const amountWei = '0x' + (BigInt(Math.round(amount * 1e18))).toString(16);
            const transactionParameters = { to: recipient, from: currentAccount, value: amountWei };

            console.log("Sending transaction:", transactionParameters);
            updateStatus('Confirm transaction in MetaMask...', 'info');

            const txHash = await window.ethereum.request({ method: 'eth_sendTransaction', params: [transactionParameters] });
            console.log('Transaction submitted, Hash:', txHash);
            updateStatus('Transaction submitted!', 'connected');

            addTransaction('send', recipient, amount.toString(), note, 'submitted', txHash);
            showSuccess(txHash);

            setTimeout(() => { if (currentAccount) getBalance(currentAccount); }, 5000);

            return { success: true, txHash: txHash };
        } catch (error) {
            console.error('Transaction error:', error);
            let message = "Transaction failed.";
            if (error.code === 4001) message = "Transaction rejected.";
            else if (error.message?.includes("insufficient funds")) message = "Insufficient funds.";
            else message = error.message?.split(/[\(\[]/)[0].trim() || message;

            showWalletError(message);
            updateStatus(message, 'error'); // Use 'error' type
            return { success: false, txHash: null };
        }
    };

    // --- Firebase Auth Functions ---
    const showAuthError = (message) => {
        if (authError) {
            authError.textContent = message;
            showElement(authError);
        }
    };

    const handleAuthSubmit = async () => {
        hideElement(authError);
        const email = emailInput?.value;
        const password = passwordInput?.value;
        if (!email || !password) {
            showAuthError("Please enter both email and password.");
            return;
        }

        authSubmitBtn.disabled = true;
        authSubmitBtn.textContent = 'Processing...';

        try {
            if (isLoginMode) {
                await signInWithEmailAndPassword(auth, email, password);
                console.log("User logged in");
                // onAuthStateChanged will handle UI updates
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                console.log("User signed up");
                // onAuthStateChanged will handle UI updates
            }
        } catch (error) {
            console.error("Firebase Auth Error:", error);
            showAuthError(error.message); // Show Firebase error message
        } finally {
            authSubmitBtn.disabled = false;
            authSubmitBtn.textContent = isLoginMode ? 'Login' : 'Sign Up';
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log("User logged out");
            // onAuthStateChanged will handle UI reset
        } catch (error) {
            console.error("Logout Error:", error);
            updateStatus("Error logging out.", "error");
        }
    };

    const toggleAuthMode = () => {
        isLoginMode = !isLoginMode;
        hideElement(authError); // Clear errors
        if (authTitle) authTitle.textContent = isLoginMode ? 'Login' : 'Sign Up';
        if (authSubmitBtn) authSubmitBtn.textContent = isLoginMode ? 'Login' : 'Sign Up';
        if (toggleAuthModeBtn) toggleAuthModeBtn.textContent = isLoginMode ? 'Need an account? Sign Up' : 'Have an account? Login';
    };

    // --- UI Interaction & Logic ---

    // Wallet Connect/Disconnect (Now checks Firebase auth)
    const handleConnectClick = async () => {
        if (!currentUser) {
            updateStatus('Please log in with Firebase first.', 'info');
            // Optionally, briefly show the login form again or highlight it
            return;
        }

        if (currentAccount) { // Disconnect Wallet
            console.log("Disconnecting wallet...");
            resetWalletUI(); // Only reset wallet part
            updateStatus('Wallet disconnected.', 'info');
            showElement(connectBtn); // Ensure connect button is visible again
            hideElement(dashboardContent); // Hide dashboard
        } else { // Connect Wallet
            updateStatus('Connecting to MetaMask...', 'info');
            if (typeof window.ethereum === 'undefined') {
                updateStatus('MetaMask not detected. Install extension.', 'error');
                return;
            }
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                handleAccountsChanged(accounts); // Handles wallet connection UI
            } catch (err) {
                console.error('Error requesting accounts:', err);
                updateStatus(err.code === 4001 ? 'Wallet connection rejected.' : 'Error connecting wallet.', 'error');
                resetWalletUI();
            }
        }
    };

    // Wallet Account Change Handler (Keep as is, but called after Firebase login)
    const handleAccountsChanged = async (accounts) => {
        if (accounts && accounts.length > 0) {
            const newAccount = accounts[0];
            if (newAccount !== currentAccount) {
                console.log('Wallet account changed/connected:', newAccount);
                currentAccount = newAccount;
                updateStatus('Wallet connected', 'connected');
                showElement(dashboardContent); // Show wallet dashboard
                hideElement(accountSection); // Ensure account section is hidden
                if (accountAddressSpan) accountAddressSpan.textContent = newAccount;
                if (accountAddressSpan) accountAddressSpan.title = newAccount;
                if (connectBtn) connectBtn.textContent = 'Disconnect Wallet';
                if (connectBtn) connectBtn.classList.add('disconnect-state');
                await getBalance(newAccount);
                hideAllForms();
                transactions.length = 0;
                updateTransactionList();
                setupMetaMaskListeners();
                checkURLParameters();
            } else {
                 if (currentAccount) await getBalance(currentAccount);
            }
        } else {
            console.log('MetaMask disconnected or locked.');
            updateStatus('MetaMask disconnected. Please connect.', 'disconnected');
            resetWalletUI(); // Reset only wallet UI part
        }
    };

    const setupMetaMaskListeners = () => {
        if (window.ethereum) {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum.on('accountsChanged', handleAccountsChanged);
        }
    };

    // Reset only the Wallet-specific UI parts
    const resetWalletUI = () => {
        hideElement(dashboardContent); // Hide wallet dashboard
        currentEthBalance = 0;
        currentFiatBalance = 0;
        currentAccount = null;
        updateBalanceDisplay();
        hideAllForms();
        transactions.length = 0;
        updateTransactionList();
        if (connectBtn) connectBtn.textContent = 'Connect Wallet';
        if (connectBtn) connectBtn.classList.remove('disconnect-state');
        if (accountAddressSpan) accountAddressSpan.textContent = '';
        // Don't change the main status if the user is still logged in via Firebase
        if (currentUser) {
            updateStatus('Wallet disconnected. Connect to proceed.', 'info');
            showElement(connectBtn); // Show connect button if logged in but wallet disconnected
        } else {
            updateStatus('Please log in or sign up.', 'info'); // Should not happen if called correctly
        }
    };

    // Reset the entire application UI (e.g., on Firebase logout)
    const resetAppUI = () => {
        updateStatus('Please log in or sign up.', 'info');
        hideElement(dashboardContent);
        hideElement(accountSection);
        hideElement(connectBtn);
        hideElement(logoutBtn); // Hide logout button (now in account section)
        hideElement(accountBtn);
        showElement(authContainer); // Show login form
        currentEthBalance = 0;
        currentFiatBalance = 0;
        currentAccount = null;
        currentUser = null;
        updateBalanceDisplay();
        hideAllForms();
        transactions.length = 0;
        updateTransactionList();
        if (connectBtn) connectBtn.textContent = 'Connect Wallet';
        if (connectBtn) connectBtn.classList.remove('disconnect-state');
        if (accountAddressSpan) accountAddressSpan.textContent = '';
        if (accountEmailSpan) accountEmailSpan.textContent = '';
        // Remove MetaMask listeners if any were attached
        if (window.ethereum) {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
    };


    const hideAllForms = () => {
        hideElement(sendForm);
        hideElement(requestForm);
        if (sendTo) sendTo.value = '';
        if (sendAmount) sendAmount.value = '';
        if (sendNote) sendNote.value = '';
        if (requestAmount) requestAmount.value = '';
        if (requestNoteInput) requestNoteInput.value = '';
        if (requestMyAddress) requestMyAddress.value = '';
        hideElement(sendError);
    };

    // Renamed to avoid conflict with authError
    const showWalletError = (message) => {
        if (sendError) {
            sendError.textContent = message;
            showElement(sendError);
        }
    };

    const validateSendForm = () => {
        hideElement(sendError);
        const recipient = sendTo?.value.trim();
        const amount = parseFloat(sendAmount?.value);
        if (!recipient || !/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
            showWalletError("Invalid recipient address."); return false;
        }
        if (isNaN(amount) || amount <= 0) {
            showWalletError("Invalid amount."); return false;
        }
        if (amount > currentEthBalance) {
            showWalletError(`Insufficient balance (${formatEth(currentEthBalance)}).`); return false;
        }
        return true;
    };

    const showConfirmation = async (recipient, amount, note) => {
        if (confirmRecipient) confirmRecipient.textContent = recipient;
        if (confirmRecipient) confirmRecipient.title = recipient;
        if (confirmAmount) confirmAmount.textContent = formatEth(parseFloat(amount));
        if (confirmNote) confirmNote.textContent = note || "No note provided";
        if (confirmGas) confirmGas.textContent = "Calculating...";

        openModal(confirmationModal);

        const transactionParams = {
            to: recipient, from: currentAccount,
            value: '0x' + (BigInt(Math.round(parseFloat(amount) * 1e18))).toString(16)
        };
        const gasEstimate = await estimateGas(transactionParams);
        if (confirmGas) {
            if (gasEstimate) {
                confirmGas.textContent = `~${gasEstimate.costEth} ETH (${gasEstimate.priceGwei} Gwei * ${gasEstimate.limit})`;
            } else {
                confirmGas.textContent = "Estimation failed";
            }
        }
    };

    const showSuccess = (txHash) => {
        if (txHash) {
            const etherscanBaseUrl = 'https://etherscan.io/tx/';
            if (etherscanLink) etherscanLink.href = etherscanBaseUrl + txHash;
            showElement(etherscanLinkContainer);
        } else {
            hideElement(etherscanLinkContainer);
        }
        openModal(successModal);
    };

    const createRequestLink = (recipient, amount, note) => {
        if (!recipient) return null;
        const params = new URLSearchParams();
        params.append('action', 'pay');
        params.append('req', recipient);
        params.append('amount', amount);
        if (note) params.append('note', note);
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?${params.toString()}`;
    };

    const checkURLParameters = () => {
        // Only process payment requests if logged in via Firebase AND wallet connected
        if (!currentUser || !currentAccount) {
            // Clear any pending request from storage if user logs out or disconnects wallet
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('action') === 'pay') {
                 sessionStorage.setItem('pendingPaymentRequest', window.location.search); // Store the full search string
                 window.history.replaceState({}, document.title, window.location.pathname); // Clear URL
                 console.log("Payment request link detected, user needs to log in and connect wallet.");
                 updateStatus("Login and connect wallet to handle the payment request.", "info");
            }
            return;
        }

        let searchString = window.location.search;
        const pendingRequest = sessionStorage.getItem('pendingPaymentRequest');

        if (!searchString && pendingRequest) {
            searchString = pendingRequest; // Use stored request if URL is clean now
            sessionStorage.removeItem('pendingPaymentRequest'); // Clear storage
            // Optionally restore the query string to the URL for processing, then clear again
            window.history.replaceState({}, document.title, `${window.location.pathname}${searchString}`);
        } else if (searchString) {
             sessionStorage.removeItem('pendingPaymentRequest'); // Clear storage if we have a new URL param
        }


        const urlParams = new URLSearchParams(searchString);
        if (urlParams.get('action') === 'pay') {
            const requester = urlParams.get('req');
            const amount = urlParams.get('amount');
            const note = urlParams.get('note') || 'No note provided';
            window.history.replaceState({}, document.title, window.location.pathname); // Clear URL after processing

            if (requester && amount) {
                console.log("Payment request link detected:", { requester, amount, note });
                if (requesterAddressEl) requesterAddressEl.textContent = requester;
                if (requesterAddressEl) requesterAddressEl.title = requester;
                if (requestedAmountEl) requestedAmountEl.textContent = formatEth(parseFloat(amount));
                if (requestNoteDisplayEl) requestNoteDisplayEl.textContent = note;
                openModal(paymentRequestModal);
            } else {
                console.log("Incomplete payment request parameters.");
            }
        }
    };


    // --- Event Listeners Setup ---

    // Firebase Auth Listeners
    if (authSubmitBtn) authSubmitBtn.addEventListener('click', handleAuthSubmit);
    if (toggleAuthModeBtn) toggleAuthModeBtn.addEventListener('click', toggleAuthMode);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout); // Listener remains the same

    // Wallet Connect Listener
    if (connectBtn) connectBtn.addEventListener('click', handleConnectClick);

    // Account Section Navigation
    if (accountBtn) {
        accountBtn.addEventListener('click', () => {
            hideElement(dashboardContent);
            showElement(accountSection);
            hideElement(accountBtn); // Hide account btn when in account view
            showElement(backToWalletBtn); // Show back button
            showElement(logoutBtn); // Show logout button when in account view
            if (accountEmailSpan && currentUser) {
                accountEmailSpan.textContent = currentUser.email;
            }
        });
    }
    if (backToWalletBtn) {
        backToWalletBtn.addEventListener('click', () => {
            hideElement(accountSection);
            hideElement(logoutBtn); // Hide logout button when leaving account view
            if (currentAccount) { // Only show dashboard if wallet is connected
                 showElement(dashboardContent);
            }
            showElement(accountBtn); // Show account btn again
            hideElement(backToWalletBtn);
        });
    }


    // Copy Address Button (Wallet)
    if (copyAddressBtn) {
        copyAddressBtn.addEventListener('click', () => {
            if (currentAccount && copyAddressTooltip) {
                copyToClipboard(currentAccount, copyAddressBtn, copyAddressTooltip);
            } else if (!copyAddressTooltip && currentAccount) {
                navigator.clipboard.writeText(currentAccount).then(() => alert("Address copied!"))
                         .catch(err => { alert("Failed to copy address."); console.error("Clipboard copy failed:", err); });
            }
        });
    }

    // Balance Toggle Button
    if (toggleBalanceBtn) {
        toggleBalanceBtn.addEventListener('click', toggleBalanceVisibility);
        toggleBalanceBtn.innerHTML = isBalanceVisible ? eyeSlashIconSVG : eyeIconSVG;
    }

    // Show Send/Request Forms
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            hideAllForms();
            showElement(sendForm);
            sendForm?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }
    if (requestBtn) {
        requestBtn.addEventListener('click', () => {
            if (!currentAccount) { alert("Please connect your wallet first."); return; }
            hideAllForms();
            if (requestMyAddress) requestMyAddress.value = currentAccount;
            showElement(requestForm);
            requestForm?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }

    // Cancel Buttons for Forms
    if (cancelSendBtn) cancelSendBtn.addEventListener('click', hideAllForms);
    if (cancelRequestBtn) cancelRequestBtn.addEventListener('click', hideAllForms);

    // Confirm Send Button (Opens Confirmation Modal)
    if (confirmSendBtn) {
        confirmSendBtn.addEventListener('click', () => {
            if (validateSendForm()) {
                showConfirmation(sendTo.value.trim(), sendAmount.value, sendNote.value.trim());
            }
        });
    }

    // Final Confirm Button (Sends ETH)
    if (finalConfirmBtn) {
        finalConfirmBtn.addEventListener('click', async () => {
            finalConfirmBtn.disabled = true; finalConfirmBtn.textContent = 'Processing...';
            const recipient = confirmRecipient?.title || '';
            const amountText = confirmAmount?.textContent || '0 ETH';
            const amount = parseFloat(amountText.replace(' ETH', ''));
            const note = (confirmNote?.textContent === 'No note provided' || !confirmNote?.textContent) ? '' : confirmNote.textContent;

            closeModal(confirmationModal);
            const { success, txHash } = await sendEth(recipient, amount.toString(), note);
            if (success) {
                hideAllForms();
            }
            finalConfirmBtn.disabled = false; finalConfirmBtn.textContent = 'Confirm & Send';
        });
    }

    // Copy Request Link Button
    if (copyRequestLinkBtn) {
        copyRequestLinkBtn.addEventListener('click', () => {
            const reqAmount = parseFloat(requestAmount?.value);
            const reqNote = requestNoteInput?.value.trim();
            if (isNaN(reqAmount) || reqAmount <= 0) { alert('Please enter a valid amount.'); return; }
            if (!currentAccount) { alert('Wallet not connected.'); return; }

            const requestLink = createRequestLink(currentAccount, reqAmount.toString(), reqNote);
            if (requestLink) {
                 navigator.clipboard.writeText(requestLink).then(() => {
                    alert("Payment link copied to clipboard!");
                    addTransaction('request', 'Link Generated', reqAmount.toString(), reqNote, 'pending');
                 }).catch(err => {
                    alert("Failed to copy link."); console.error("Copy link failed:", err);
                 });
            }
        });
    }

    // Modal Close Buttons
    closeModalButtons.forEach(btn => btn.addEventListener('click', () => closeAllModals()));
    if (cancelConfirmBtn) cancelConfirmBtn.addEventListener('click', () => closeModal(confirmationModal));
    if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', () => closeModal(successModal));
    if (declinePaymentBtn) declinePaymentBtn.addEventListener('click', () => closeModal(paymentRequestModal));

    // Approve Payment Button (From Payment Request Modal)
    if (approvePaymentBtn) {
        approvePaymentBtn.addEventListener('click', async () => {
            approvePaymentBtn.disabled = true; approvePaymentBtn.textContent = 'Processing...';
            const recipient = requesterAddressEl?.title || '';
            const requestedAmountText = requestedAmountEl?.textContent || '0 ETH';
            const requestedAmount = parseFloat(requestedAmountText.replace(' ETH', ''));
            const paymentNote = (requestNoteDisplayEl?.textContent === 'No note provided' || !requestNoteDisplayEl?.textContent) ? '' : requestNoteDisplayEl.textContent;

            closeModal(paymentRequestModal);
            showConfirmation(recipient, requestedAmount.toString(), `Payment for request: ${paymentNote}`);

            approvePaymentBtn.disabled = false; approvePaymentBtn.textContent = 'Pay Now';
        });
    }

    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target instanceof Element && e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });

    // --- Firebase Auth State Listener ---
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in
            console.log("Auth state changed: User logged in", user.uid, user.email);
            currentUser = user;
            hideElement(authContainer);
            // Don't show logout button in header anymore
            showElement(accountBtn);
            showElement(connectBtn); // Show connect wallet button now
            updateStatus('Logged in. Please connect your wallet.', 'info');
            // If wallet was already connected (e.g. page refresh), re-check
            if (window.ethereum?.selectedAddress) {
                 handleAccountsChanged([window.ethereum.selectedAddress]);
            } else {
                // Check for pending payment requests now that user is logged in
                checkURLParameters();
            }
        } else {
            // User is signed out
            console.log("Auth state changed: User logged out");
            currentUser = null;
            resetAppUI(); // Reset the entire UI to the logged-out state
        }
    });


    // --- Initial Application Setup ---
    console.log("Initializing App...");
    // Initial state is logged-out, handled by onAuthStateChanged
    resetAppUI(); // Start in logged-out state
    updateTransactionList(); // Show empty state initially
    updateBalanceDisplay(); // Set initial icons/state

    // No auto-reconnect for wallet here, wait for Firebase login first.
    // Firebase's onAuthStateChanged handles the initial check.

};

// --- Run Initialization ---
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
