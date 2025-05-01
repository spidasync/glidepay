// Run immediately and also when DOM content is loaded
const initApp = function() {
    // --- DOM Element Selectors ---
    const connectBtn = document.getElementById('connectBtn');
    const statusDiv = document.getElementById('status');
    const dashboardContent = document.getElementById('dashboardContent'); // Main content area

    // Balance elements
    const ethBalanceDiv = document.getElementById('eth-balance'); // Now in Account Details
    const currencyBalanceDiv = document.getElementById('currency-balance'); // Main balance display
    const currencyCodeDiv = document.getElementById('currency-code'); // Below main balance
    // const currencySelect = document.getElementById('currency-select'); // Removed
    const toggleBalanceBtn = document.getElementById('toggleBalanceBtn'); // Single toggle button

    // Account Details elements
    const accountInfoSection = document.querySelector('.account-details-card'); // Container for details
    const accountAddressSpan = document.getElementById('accountAddress');
    const copyAddressBtn = document.getElementById('copyAddressBtn');
    const copyAddressTooltip = copyAddressBtn?.querySelector('.copy-tooltip'); // Add null check

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
    const confirmGas = document.getElementById('confirmGas'); // Added gas estimate display
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
    const sendError = document.getElementById('sendError');

    // Payment Request Modal Display Fields
    const requesterAddressEl = document.getElementById('requesterAddress');
    const requestedAmountEl = document.getElementById('requestedAmount');
    const requestNoteDisplayEl = document.getElementById('requestNoteDisplay');

    // --- State Variables ---
    let currentEthBalance = 0;
    let currentFiatBalance = 0;
    let currentAccount = null;
    let ethPriceData = {};
    let lastPriceFetchTime = 0;
    const PRICE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    let isBalanceVisible = true; // Single state for both balances
    const transactions = []; // In-memory store

    // SVG Icons
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
            statusDiv.classList.add(type); // Add type class (info, connected, disconnected)
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

    // Update Balance Display (Handles visibility toggle for BOTH balances)
    const updateBalanceDisplay = () => {
        const selectedCurrency = 'USD'; // Hardcoded as selector removed
        if (currencyCodeDiv) currencyCodeDiv.textContent = selectedCurrency;

        if (isBalanceVisible) {
            // Show actual balances
            if (currencyBalanceDiv) currencyBalanceDiv.textContent = formatCurrency(currentFiatBalance, selectedCurrency);
            if (ethBalanceDiv) ethBalanceDiv.textContent = formatEth(currentEthBalance);
            if (toggleBalanceBtn) toggleBalanceBtn.innerHTML = eyeSlashIconSVG; // Show hide icon
        } else {
            // Show masked balances
            if (currencyBalanceDiv) currencyBalanceDiv.textContent = formatCurrency(0, selectedCurrency).replace(/[\d.,]/g, '*'); // Mask currency
            if (ethBalanceDiv) ethBalanceDiv.textContent = '**** ETH';
            if (toggleBalanceBtn) toggleBalanceBtn.innerHTML = eyeIconSVG; // Show view icon
        }
    };

    // Toggle Balance Visibility (Single Toggle)
    const toggleBalanceVisibility = () => {
        isBalanceVisible = !isBalanceVisible;
        updateBalanceDisplay();
    };

    // Copy text to clipboard (Generic helper)
    const copyToClipboard = async (text, elementToUpdate, tooltipElement) => {
        if (!tooltipElement) return; // Guard against missing tooltip
        const originalText = tooltipElement.textContent;
        try {
            await navigator.clipboard.writeText(text);
            tooltipElement.textContent = "Copied!";
            if (elementToUpdate) elementToUpdate.classList.add('copied'); // Add class for visual feedback
            console.log("Copied:", text);
        } catch (err) {
            console.error('Clipboard copy failed:', err);
            tooltipElement.textContent = "Failed!";
            alert("Could not copy to clipboard.");
        } finally {
            setTimeout(() => {
                tooltipElement.textContent = originalText;
                if (elementToUpdate) elementToUpdate.classList.remove('copied');
            }, 1500); // Reset after 1.5 seconds
        }
    };

    // --- Transaction History ---

    const addTransaction = (type, recipient, amount, note, status = 'completed', txHash = null) => {
        const transaction = {
            id: Date.now().toString() + Math.random().toString(16).slice(2),
            type, // 'send', 'receive', 'request'
            recipient, // Address or identifier
            amount, // ETH amount as string
            note,
            status, // 'completed', 'pending', 'submitted', 'failed'
            timestamp: new Date(),
            txHash
        };
        transactions.unshift(transaction);
        if (transactions.length > 20) transactions.pop();
        updateTransactionList();
        // TODO: Persist transactions
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
            let amountClass = tx.type; // Use type for class (sent, received, pending)
            let subject = tx.note || (tx.type === 'send' ? 'Payment Sent' : tx.type === 'receive' ? 'Payment Received' : 'Request');
            let displayAddress = tx.recipient;

            // Shorten address for display in list
            if (displayAddress && displayAddress.startsWith('0x') && displayAddress.length > 10) {
                 displayAddress = `${displayAddress.substring(0, 6)}...${displayAddress.substring(displayAddress.length - 4)}`;
            } else if (displayAddress === 'Link Generated') {
                displayAddress = '-'; // Don't show address for generated links
            }

            // Adjust subject/type display based on context
             if (tx.type === 'request' && tx.recipient === 'Link Generated') {
                subject = 'Payment Link Created';
                typeText = 'Request';
            } else if (tx.type === 'send') {
                subject = tx.note || `To: ${displayAddress}`;
                typeText = 'Send';
            } else if (tx.type === 'receive') {
                 subject = tx.note || `From: ${displayAddress}`;
                 typeText = 'Receive';
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
            // TODO: Add link to Etherscan using tx.txHash if available

            transactionList.appendChild(item);
        });
    };

    // --- API & Blockchain Interaction ---

    const fetchEthPrice = async (currency) => {
        const now = Date.now();
        const cachedPrice = ethPriceData[currency];
        if (cachedPrice && (now - lastPriceFetchTime < PRICE_CACHE_DURATION)) {
            return cachedPrice;
        }
        console.log(`Fetching ETH price for ${currency}...`);
        try {
            // Using a simpler API endpoint if CoinGecko causes issues, fallback needed
            // const response = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=${currency.toUpperCase()}`);
             const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=${currency.toLowerCase()}`);

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            // Adjust parsing based on the API used
            // For CryptoCompare: const price = data[currency.toUpperCase()];
            // For CoinGecko:
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
            updateStatus('Unable to fetch price data', 'disconnected');
            return ethPriceData[currency] || null;
        }
    };

    const updateCurrencyBalance = async () => {
        const selectedCurrency = 'USD'; // Hardcoded as selector removed
        const ethPrice = await fetchEthPrice(selectedCurrency);
        if (ethPrice !== null) {
            currentFiatBalance = currentEthBalance * ethPrice;
        } else {
            currentFiatBalance = 0; // Indicate price unavailable
        }
        updateBalanceDisplay(); // Update UI
    };

    const getBalance = async (account) => {
        if (!window.ethereum || !account) return;
        console.log("Fetching balance for:", account);
        try {
            const balanceWei = await window.ethereum.request({ method: 'eth_getBalance', params: [account, 'latest'] });
            const ethBalance = parseInt(balanceWei, 16) / 1e18;
            currentEthBalance = ethBalance;
            console.log("Balance updated:", ethBalance, "ETH");
            await updateCurrencyBalance(); // Update fiat value after getting ETH
        } catch (error) {
            console.error('Balance error:', error);
            currentEthBalance = 0;
            currentFiatBalance = 0;
            updateBalanceDisplay();
            updateStatus('Error fetching balance', 'disconnected');
        }
    };

    // Estimate Gas (Basic Example)
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
             return {
                 limit: gasLimit,
                 priceGwei: gasPriceGwei.toFixed(2),
                 costEth: estimatedCostEth.toFixed(6)
             };
         } catch (error) {
             console.error("Gas estimation error:", error);
             return null;
         }
    };


    const sendEth = async (recipient, amountString, note) => {
        if (!window.ethereum || !currentAccount) {
            showError("MetaMask not connected.");
            return { success: false, txHash: null };
        }
        try {
            const amount = parseFloat(amountString);
            if (isNaN(amount) || amount <= 0) {
                showError("Invalid amount."); return { success: false, txHash: null };
            }
            const amountWei = '0x' + (BigInt(Math.round(amount * 1e18))).toString(16);
            const transactionParameters = { to: recipient, from: currentAccount, value: amountWei };

            console.log("Sending transaction:", transactionParameters);
            updateStatus('Confirm transaction in MetaMask...', 'info');

            const txHash = await window.ethereum.request({ method: 'eth_sendTransaction', params: [transactionParameters] });
            console.log('Transaction submitted, Hash:', txHash);
            updateStatus('Transaction submitted!', 'connected');

            addTransaction('send', recipient, amount.toString(), note, 'submitted', txHash);
            showSuccess(txHash); // Show success modal with hash

            setTimeout(() => { if (currentAccount) getBalance(currentAccount); }, 5000); // Refresh balance later

            return { success: true, txHash: txHash };
        } catch (error) {
            console.error('Transaction error:', error);
            let message = "Transaction failed.";
            if (error.code === 4001) message = "Transaction rejected.";
            else if (error.message?.includes("insufficient funds")) message = "Insufficient funds.";
            else message = error.message?.split(/[\(\[]/)[0].trim() || message;

            showError(message);
            updateStatus(message, 'disconnected');
            return { success: false, txHash: null };
        }
    };

    // --- UI Interaction & Logic ---

    const handleConnectClick = async () => {
        if (currentAccount) {
            console.log("Disconnecting (resetting UI)...");
            resetUI();
            updateStatus('Wallet disconnected.', 'info');
        } else {
            updateStatus('Connecting to MetaMask...', 'info');
            if (typeof window.ethereum === 'undefined') {
                updateStatus('MetaMask not detected. Install extension.', 'disconnected');
                return;
            }
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                handleAccountsChanged(accounts);
            } catch (err) {
                console.error('Error requesting accounts:', err);
                updateStatus(err.code === 4001 ? 'Connection rejected.' : 'Error connecting.', 'disconnected');
                resetUI();
            }
        }
    };

    const handleAccountsChanged = async (accounts) => {
        if (accounts && accounts.length > 0) {
            const newAccount = accounts[0];
            if (newAccount !== currentAccount) {
                console.log('Account changed/connected:', newAccount);
                currentAccount = newAccount;
                updateStatus('Connected', 'connected');
                showElement(dashboardContent); // Show main content
                if (accountAddressSpan) accountAddressSpan.textContent = newAccount; // Show full address
                if (accountAddressSpan) accountAddressSpan.title = newAccount;
                if (connectBtn) connectBtn.textContent = 'Disconnect';
                if (connectBtn) connectBtn.classList.add('disconnect-state');
                await getBalance(newAccount);
                hideAllForms();
                transactions.length = 0; // Clear transactions for new account
                updateTransactionList();
                setupMetaMaskListeners();
                checkURLParameters(); // Check for payment requests
            } else {
                 if (currentAccount) await getBalance(currentAccount); // Refresh balance if same account
            }
        } else {
            console.log('MetaMask disconnected or locked.');
            updateStatus('MetaMask disconnected. Please connect.', 'disconnected');
            resetUI();
        }
    };

    const setupMetaMaskListeners = () => {
        if (window.ethereum) {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            // window.ethereum.on('chainChanged', (chainId) => window.location.reload());
        }
    };

    const resetUI = () => {
        updateStatus('Please connect your wallet', 'info');
        hideElement(dashboardContent); // Hide main content
        currentEthBalance = 0;
        currentFiatBalance = 0;
        currentAccount = null;
        updateBalanceDisplay(); // Update displays to show 0/placeholders
        hideAllForms();
        transactions.length = 0;
        updateTransactionList();
        if (connectBtn) connectBtn.textContent = 'Connect Wallet';
        if (connectBtn) connectBtn.classList.remove('disconnect-state');
        if (accountAddressSpan) accountAddressSpan.textContent = ''; // Clear address display
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

    const showError = (message) => {
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
            showError("Invalid recipient address."); return false;
        }
        if (isNaN(amount) || amount <= 0) {
            showError("Invalid amount."); return false;
        }
        if (amount > currentEthBalance) {
            showError(`Insufficient balance (${formatEth(currentEthBalance)}).`); return false;
        }
        return true;
    };

    const showConfirmation = async (recipient, amount, note) => {
        if (confirmRecipient) confirmRecipient.textContent = recipient;
        if (confirmRecipient) confirmRecipient.title = recipient;
        if (confirmAmount) confirmAmount.textContent = formatEth(parseFloat(amount));
        if (confirmNote) confirmNote.textContent = note || "No note provided";
        if (confirmGas) confirmGas.textContent = "Calculating..."; // Reset gas estimate

        openModal(confirmationModal);

        // Estimate gas after opening modal
        const transactionParams = {
            to: recipient,
            from: currentAccount,
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
            // Construct Etherscan link (adjust for different networks if needed)
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
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('action') === 'pay') {
            const requester = urlParams.get('req');
            const amount = urlParams.get('amount');
            const note = urlParams.get('note') || 'No note provided';
            window.history.replaceState({}, document.title, window.location.pathname); // Clear URL

            if (requester && amount) {
                console.log("Payment request link detected:", { requester, amount, note });
                if (!currentAccount) {
                    updateStatus('Connect wallet to respond to payment request.', 'info');
                    sessionStorage.setItem('pendingPaymentRequest', JSON.stringify({ requester, amount, note }));
                    return;
                }
                if (requesterAddressEl) requesterAddressEl.textContent = requester;
                if (requesterAddressEl) requesterAddressEl.title = requester;
                if (requestedAmountEl) requestedAmountEl.textContent = formatEth(parseFloat(amount));
                if (requestNoteDisplayEl) requestNoteDisplayEl.textContent = note;
                openModal(paymentRequestModal);
            } else {
                console.log("Incomplete payment request parameters.");
            }
        } else {
            const pendingRequest = sessionStorage.getItem('pendingPaymentRequest');
            if (pendingRequest && currentAccount) {
                sessionStorage.removeItem('pendingPaymentRequest');
                const { requester, amount, note } = JSON.parse(pendingRequest);
                const params = new URLSearchParams();
                params.set('action', 'pay'); params.set('req', requester); params.set('amount', amount);
                if (note) params.set('note', note);
                window.history.replaceState({}, document.title, `${window.location.pathname}?${params.toString()}`);
                checkURLParameters(); // Re-trigger
            }
        }
    };

    // --- Event Listeners Setup ---

    if (connectBtn) {
        connectBtn.addEventListener('click', handleConnectClick);
    } else {
        console.error("Connect button not found!");
    }

    // Copy Address Button
    if (copyAddressBtn) {
        copyAddressBtn.addEventListener('click', () => {
            if (currentAccount && copyAddressTooltip) { // Ensure tooltip exists
                copyToClipboard(currentAccount, copyAddressBtn, copyAddressTooltip);
            } else if (!copyAddressTooltip) {
                console.error("Copy tooltip element not found!");
                // Fallback or alternative feedback if tooltip is missing
                if (currentAccount) {
                    navigator.clipboard.writeText(currentAccount).then(() => {
                        alert("Address copied!");
                    }).catch(err => {
                        alert("Failed to copy address.");
                        console.error("Clipboard copy failed:", err);
                    });
                }
            }
        });
    } else {
        console.error("Copy address button not found!");
    }

    // Balance Toggle Button
    if (toggleBalanceBtn) {
        toggleBalanceBtn.addEventListener('click', toggleBalanceVisibility);
        // Set initial icon state correctly
        toggleBalanceBtn.innerHTML = isBalanceVisible ? eyeSlashIconSVG : eyeIconSVG;
    } else {
        console.error("Toggle balance button not found!");
    }

    // Show Send/Request Forms
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            hideAllForms(); // Hide request form if open
            showElement(sendForm);
            sendForm?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // Scroll to form
        });
    } else {
        console.error("Send button not found!");
    }

    if (requestBtn) {
        requestBtn.addEventListener('click', () => {
            if (!currentAccount) {
                alert("Please connect your wallet first."); return;
            }
            hideAllForms(); // Hide send form if open
            if (requestMyAddress) requestMyAddress.value = currentAccount;
            showElement(requestForm);
            requestForm?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // Scroll to form
        });
    } else {
        console.error("Request button not found!");
    }

    // Cancel Buttons for Forms
    if (cancelSendBtn) {
        cancelSendBtn.addEventListener('click', hideAllForms);
    } else {
        console.error("Cancel Send button not found!");
    }
    if (cancelRequestBtn) {
        cancelRequestBtn.addEventListener('click', hideAllForms);
    } else {
        console.error("Cancel Request button not found!");
    }

    // Confirm Send Button (Opens Confirmation Modal)
    if (confirmSendBtn) {
        confirmSendBtn.addEventListener('click', () => {
            if (validateSendForm()) {
                showConfirmation(sendTo.value.trim(), sendAmount.value, sendNote.value.trim());
            }
        });
    } else {
        console.error("Confirm Send button not found!");
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
                // Success modal shown within sendEth
                hideAllForms();
            }
            finalConfirmBtn.disabled = false; finalConfirmBtn.textContent = 'Confirm & Send';
        });
    } else {
        console.error("Final Confirm button not found!");
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
                    alert("Failed to copy link.");
                    console.error("Copy link failed:", err);
                 });
            }
        });
    } else {
        console.error("Copy Request Link button not found!");
    }

    // Modal Close Buttons
    closeModalButtons.forEach(btn => btn.addEventListener('click', () => closeAllModals()));
    if (cancelConfirmBtn) {
        cancelConfirmBtn.addEventListener('click', () => closeModal(confirmationModal));
    } else {
        console.error("Cancel Confirm button not found!");
    }
    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', () => closeModal(successModal));
    } else {
        console.error("Close Success button not found!");
    }
    if (declinePaymentBtn) {
        declinePaymentBtn.addEventListener('click', () => closeModal(paymentRequestModal));
    } else {
        console.error("Decline Payment button not found!");
    }

    // Approve Payment Button (From Payment Request Modal)
    if (approvePaymentBtn) {
        approvePaymentBtn.addEventListener('click', async () => {
            approvePaymentBtn.disabled = true; approvePaymentBtn.textContent = 'Processing...';
            const recipient = requesterAddressEl?.title || '';
            const requestedAmountText = requestedAmountEl?.textContent || '0 ETH';
            const requestedAmount = parseFloat(requestedAmountText.replace(' ETH', ''));
            const paymentNote = (requestNoteDisplayEl?.textContent === 'No note provided' || !requestNoteDisplayEl?.textContent) ? '' : requestNoteDisplayEl.textContent;

            closeModal(paymentRequestModal);
            // Show confirmation modal for the payment
            showConfirmation(recipient, requestedAmount.toString(), `Payment for request: ${paymentNote}`);

            approvePaymentBtn.disabled = false; approvePaymentBtn.textContent = 'Pay Now';
        });
    } else {
        console.error("Approve Payment button not found!");
    }

    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target instanceof Element && e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });

    // --- Initial Application Setup ---
    console.log("Initializing App...");
    resetUI(); // Start in disconnected state
    updateTransactionList(); // Show empty state
    updateBalanceDisplay(); // Set initial icons/state (will also set eye icon initially)

    // Attempt auto-reconnect
    if (window.ethereum?.isMetaMask) {
        window.ethereum.request({ method: 'eth_accounts' })
            .then(handleAccountsChanged)
            .catch(err => { console.error("Error checking initial accounts:", err); resetUI(); });
    } else {
        updateStatus('MetaMask not detected. Install extension.', 'disconnected');
    }

    // Initial check for URL parameters
    checkURLParameters();
};

// --- Run Initialization ---
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOMContentLoaded has already fired
    initApp();
}
