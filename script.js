// Run immediately and also when DOM content is loaded
const initApp = function() {
    const connectBtn = document.getElementById('connectBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const statusDiv = document.getElementById('status');
    const accountInfo = document.getElementById('accountInfo');
    const accountAddress = document.getElementById('accountAddress');
    const ethBalanceDiv = document.getElementById('eth-balance');
    const ethBalanceHiddenDiv = document.getElementById('eth-balance-hidden');
    const currencyBalanceDiv = document.getElementById('currency-balance');
    const currencyBalanceHiddenDiv = document.getElementById('currency-balance-hidden');
    const currencyCodeDiv = document.getElementById('currency-code');
    const currencySelect = document.getElementById('currency-select');
    
    // Balance visibility toggle elements
    const toggleBalanceVisibilityBtn = document.getElementById('toggleBalanceVisibility');
    const eyeOpenIcon = toggleBalanceVisibilityBtn.querySelector('.eye-open');
    const eyeClosedIcon = toggleBalanceVisibilityBtn.querySelector('.eye-closed');
    let balancesVisible = true;
    
    // Transaction elements
    const sendBtn = document.getElementById('sendBtn');
    const requestBtn = document.getElementById('requestBtn');
    const sendForm = document.getElementById('sendForm');
    const requestForm = document.getElementById('requestForm');
    const cancelSendBtn = document.getElementById('cancelSendBtn');
    const cancelRequestBtn = document.getElementById('cancelRequestBtn');
    const confirmSendBtn = document.getElementById('confirmSendBtn');
    const copyRequestLinkBtn = document.getElementById('copyRequestLinkBtn');
    
    // Modal elements
    const confirmationModal = document.getElementById('confirmationModal');
    const successModal = document.getElementById('successModal');
    const confirmRecipient = document.getElementById('confirmRecipient');
    const confirmAmount = document.getElementById('confirmAmount');
    const confirmNote = document.getElementById('confirmNote');
    const finalConfirmBtn = document.getElementById('finalConfirmBtn');
    const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    
    // Form inputs
    const sendTo = document.getElementById('sendTo');
    const sendAmount = document.getElementById('sendAmount');
    const sendNote = document.getElementById('sendNote');
    const requestFrom = document.getElementById('requestFrom');
    const requestAmount = document.getElementById('requestAmount');
    const requestNote = document.getElementById('requestNote');
    const sendError = document.getElementById('sendError');
    
    let currentEthBalance = 0;
    let currentAccount = null;
    
    // Balance visibility toggle function
    const toggleBalanceVisibility = () => {
        balancesVisible = !balancesVisible;
        
        if (balancesVisible) {
            // Show balances
            ethBalanceDiv.style.display = 'block';
            ethBalanceHiddenDiv.style.display = 'none';
            currencyBalanceDiv.style.display = 'block';
            currencyBalanceHiddenDiv.style.display = 'none';
            eyeOpenIcon.style.display = 'inline';
            eyeClosedIcon.style.display = 'none';
        } else {
            // Hide balances
            ethBalanceDiv.style.display = 'none';
            ethBalanceHiddenDiv.style.display = 'block';
            currencyBalanceDiv.style.display = 'none';
            currencyBalanceHiddenDiv.style.display = 'block';
            eyeOpenIcon.style.display = 'none';
            eyeClosedIcon.style.display = 'inline';
        }
        
        // Save preference to localStorage
        localStorage.setItem('glidePay_balancesVisible', balancesVisible);
    };
    
    // Load saved visibility preference
    const loadVisibilityPreference = () => {
        const savedPreference = localStorage.getItem('glidePay_balancesVisible');
        if (savedPreference !== null) {
            // Convert string 'true'/'false' to boolean
            balancesVisible = savedPreference === 'true';
            if (!balancesVisible) {
                toggleBalanceVisibility(); // Apply the hidden state
            }
        }
    };
    
    // Add event listener for visibility toggle
    toggleBalanceVisibilityBtn.addEventListener('click', toggleBalanceVisibility);
    
    // Transaction history management
    const transactions = [];
    const transactionList = document.getElementById('transactionList');
    
    // Add a new transaction to history
    const addTransaction = (type, recipient, amount, note, status = 'completed') => {
        const transaction = {
            id: Date.now().toString(),
            type,
            recipient,
            amount,
            note,
            status,
            timestamp: new Date()
        };
        
        transactions.unshift(transaction);
        updateTransactionList();
        
        // In a real app, you would save this to localStorage or a backend
        return transaction;
    };
    
    // Update the transaction list UI
    const updateTransactionList = () => {
        transactionList.innerHTML = '';
        
        if (transactions.length === 0) {
            transactionList.innerHTML = '<div class="transaction-item">No transactions yet</div>';
            return;
        }
        
        // Display only the last 5 transactions
        const recentTransactions = transactions.slice(0, 5);
        
        recentTransactions.forEach(tx => {
            const item = document.createElement('div');
            item.className = 'transaction-item';
            
            let typeText = '';
            let amountClass = '';
            let amountPrefix = '';
            
            if (tx.type === 'send') {
                typeText = 'Payment Sent';
                amountClass = 'sent';
                amountPrefix = '-';
            } else if (tx.type === 'receive') {
                typeText = 'Payment Received';
                amountClass = 'received';
                amountPrefix = '+';
            } else if (tx.type === 'request') {
                typeText = 'Payment Request';
                amountClass = 'pending';
                amountPrefix = '';
            }
            
            const recipientLabel = tx.type === 'receive' ? 'From: ' : 'To: ';
            
            item.innerHTML = `
                <div class="transaction-details">
                    <div class="transaction-type">${typeText}</div>
                    <div class="transaction-recipient">${recipientLabel}${tx.recipient}</div>
                    ${tx.note ? `<div class="transaction-note">Note: ${tx.note}</div>` : ''}
                </div>
                <div class="transaction-amount ${amountClass}">${amountPrefix}${tx.amount} ETH 
                    ${tx.status === 'pending' ? '<span class="transaction-status">Pending</span>' : ''}
                </div>
            `;
            
            transactionList.appendChild(item);
        });
    };
    
    // Fetch ETH price in selected currency
    const fetchEthPrice = async (currency) => {
        try {
            // Use CoinGecko API to get ETH price in selected currency
            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=${currency.toLowerCase()}&include_last_updated_at=true`);
            const data = await response.json();
            
            if (data && data.ethereum && data.ethereum[currency.toLowerCase()]) {
                // Display the last updated time in status
                if (data.ethereum.last_updated_at) {
                    const lastUpdated = new Date(data.ethereum.last_updated_at * 1000);
                    statusDiv.textContent = `Connected to MetaMask - Price data updated: ${lastUpdated.toLocaleString()}`;
                }
                
                return data.ethereum[currency.toLowerCase()];
            } else {
                throw new Error('Invalid price data format');
            }
        } catch (error) {
            console.error('Error fetching ETH price:', error);
            statusDiv.textContent = 'Connected to MetaMask - Unable to fetch latest price data';
            return null;
        }
    };
    
    // Update currency balance display
    const updateCurrencyBalance = async () => {
        const selectedCurrency = currencySelect.value;
        currencyCodeDiv.textContent = selectedCurrency;
        
        // Always fetch the current ETH price regardless of balance
        const ethPrice = await fetchEthPrice(selectedCurrency);
        
        if (ethPrice) {
            // Calculate currency balance (even if ETH is 0)
            const currencyBalance = currentEthBalance * ethPrice;
            
            // Format the currency based on locale
            const formatter = new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: selectedCurrency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            
            currencyBalanceDiv.textContent = formatter.format(currencyBalance);
        } else {
            currencyBalanceDiv.textContent = 'Current price data is unavailable.';
        }
    };
    
    // Listen for currency selection changes
    currencySelect.addEventListener('change', updateCurrencyBalance);
    
    // Connect to MetaMask - this is the main function that tries various methods
    const connectMetaMask = async () => {
        statusDiv.textContent = 'Attempting to connect to MetaMask...';
        
        try {
            // Try multiple ways to connect to MetaMask
            let accounts;
            
            // Method 1: Modern window.ethereum
            if (window.ethereum) {
                try {
                    accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                } catch (err) {
                    console.log('Method 1 failed:', err);
                }
            }
            
            // Method 2: Legacy web3
            if (!accounts && window.web3 && window.web3.eth && window.web3.eth.accounts) {
                try {
                    accounts = await new Promise((resolve) => {
                        window.web3.eth.getAccounts((err, accts) => {
                            resolve(accts || []);
                        });
                    });
                } catch (err) {
                    console.log('Method 2 failed:', err);
                }
            }
            
            // Method 3: Try to force MetaMask to inject by requesting eth_accounts
            if (!accounts) {
                try {
                    // This often triggers the MetaMask extension to inject itself
                    if (window.ethereum) {
                        accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    }
                } catch (err) {
                    console.log('Method 3 failed:', err);
                }
            }
            
            // Check if we got accounts
            if (accounts && accounts.length > 0) {
                const account = accounts[0];
                currentAccount = account;
                
                statusDiv.textContent = 'Connected to MetaMask';
                statusDiv.className = 'connected';
                accountInfo.style.display = 'block';
                accountAddress.textContent = account;
                connectBtn.style.display = 'none';
                
                // Get initial balance
                getBalance(account);
                
                // Setup account change listener
                if (window.ethereum) {
                    window.ethereum.on('accountsChanged', function (accounts) {
                        if (accounts.length === 0) {
                            // Disconnected
                            resetUI();
                        } else {
                            // Account changed
                            const newAccount = accounts[0];
                            currentAccount = newAccount;
                            accountAddress.textContent = newAccount;
                            getBalance(newAccount);
                        }
                    });
                }
            } else {
                // If we still don't have accounts, direct the user
                statusDiv.textContent = 'MetaMask connection failed. Make sure you have the MetaMask extension installed and you are logged into an account.';
                statusDiv.className = 'disconnected';
            }
        } catch (error) {
            console.error('Connection error:', error);
            statusDiv.textContent = 'Error connecting to MetaMask.';
            statusDiv.className = 'disconnected';
        }
    };
    
    // Get ETH balance
    const getBalance = async (account) => {
        try {
            let balance;
            
            // Try multiple methods to get balance
            if (window.ethereum) {
                balance = await window.ethereum.request({
                    method: 'eth_getBalance',
                    params: [account, 'latest']
                });
            } else if (window.web3 && window.web3.eth) {
                balance = await new Promise((resolve) => {
                    window.web3.eth.getBalance(account, (err, result) => {
                        resolve(result ? result.toString(16) : null);
                    });
                });
            }
            
            if (balance) {
                // Convert wei to ETH (1 ETH = 10^18 wei)
                const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
                currentEthBalance = ethBalance;
                
                // Format ETH with appropriate precision based on amount
                if (ethBalance === 0) {
                    ethBalanceDiv.textContent = '0.0000 ETH';
                } else if (ethBalance < 0.0001) {
                    ethBalanceDiv.textContent = ethBalance.toFixed(8) + ' ETH';
                } else {
                    ethBalanceDiv.textContent = ethBalance.toFixed(4) + ' ETH';
                }
                
                // Update currency balance
                updateCurrencyBalance();
            } else {
                ethBalanceDiv.textContent = 'Unable to fetch balance';
                currencyBalanceDiv.textContent = '-';
            }
        } catch (error) {
            console.error('Balance error:', error);
            ethBalanceDiv.textContent = 'Error fetching balance';
            currencyBalanceDiv.textContent = '-';
        }
    };
    
    // Reset UI when disconnected
    const resetUI = () => {
        statusDiv.textContent = 'Disconnected from MetaMask';
        statusDiv.className = 'disconnected';
        accountInfo.style.display = 'none';
        connectBtn.style.display = 'block';
        ethBalanceDiv.textContent = '-';
        currencyBalanceDiv.textContent = '-';
        currentEthBalance = 0;
        currentAccount = null;
    };
    
    // Send ETH function
    const sendEth = async (recipient, amount, note) => {
        if (!window.ethereum) {
            showError("MetaMask not found. Please install MetaMask.");
            return false;
        }
        
        try {
            // Convert ETH to Wei
            const amountWei = "0x" + (amount * Math.pow(10, 18)).toString(16);
            
            // Create the transaction
            const transactionParameters = {
                to: recipient,
                from: currentAccount,
                value: amountWei,
                // Optional: Include gas parameters
                // gas: '',
                // gasPrice: ''
            };
            
            // Send the transaction
            const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [transactionParameters],
            });
            
            console.log('Transaction hash:', txHash);
            
            // Add to transaction history
            addTransaction('send', recipient, amount, note);
            
            // Refresh balance after sending
            setTimeout(() => {
                getBalance(currentAccount);
            }, 2000);
            
            return true;
        } catch (error) {
            console.error('Transaction error:', error);
            showError(error.message || "Transaction failed. Please try again.");
            return false;
        }
    };
    
    // Create a request payment link
    const createRequestLink = (recipient, amount, note) => {
        const params = new URLSearchParams();
        params.append('to', recipient);
        params.append('amount', amount);
        if (note) params.append('note', note);
        
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?action=request&${params.toString()}`;
    };
    
    // Copy text to clipboard
    const copyToClipboard = (text) => {
        // Create temporary element
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        
        // Show feedback
        copyRequestLinkBtn.textContent = "Copied!";
        setTimeout(() => {
            copyRequestLinkBtn.textContent = "Copy Payment Link";
        }, 2000);
    };
    
    // Show error message
    const showError = (message) => {
        sendError.textContent = message;
        sendError.style.display = 'block';
        setTimeout(() => {
            sendError.style.display = 'none';
        }, 5000);
    };
    
    // Handle form validations
    const validateSendForm = () => {
        if (!sendTo.value) {
            showError("Please enter a recipient address");
            return false;
        }
        
        if (!sendAmount.value || sendAmount.value <= 0) {
            showError("Please enter a valid amount");
            return false;
        }
        
        // Check if amount is greater than balance
        if (parseFloat(sendAmount.value) > currentEthBalance) {
            showError("Insufficient balance");
            return false;
        }
        
        // Validate Ethereum address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(sendTo.value)) {
            showError("Invalid Ethereum address format");
            return false;
        }
        
        return true;
    };
    
    // Show confirmation modal
    const showConfirmation = (recipient, amount, note) => {
        confirmRecipient.textContent = recipient;
        confirmAmount.textContent = amount + " ETH";
        confirmNote.textContent = note || "No note added";
        confirmationModal.style.display = "flex";
    };
    
    // Show success modal
    const showSuccess = () => {
        successModal.style.display = "flex";
    };
    
    // Close all modals
    const closeModals = () => {
        confirmationModal.style.display = "none";
        successModal.style.display = "none";
    };
    
    // Check URL for request parameters
    const checkURLParameters = () => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('action') === 'request') {
            const recipient = urlParams.get('to');
            const amount = urlParams.get('amount');
            const note = urlParams.get('note');
            
            if (recipient && amount) {
                const paymentRequestModal = document.getElementById('paymentRequestModal');
                const requesterAddress = document.getElementById('requesterAddress');
                const requestedAmount = document.getElementById('requestedAmount');
                const requestNoteElement = document.getElementById('requestNote');
                const approvePaymentBtn = document.getElementById('approvePaymentBtn');
                const declinePaymentBtn = document.getElementById('declinePaymentBtn');
                
                // Display the request details
                requesterAddress.textContent = recipient;
                requestedAmount.textContent = `${amount} ETH`;
                requestNoteElement.textContent = note || 'No note provided';
                
                // Show the modal
                paymentRequestModal.style.display = 'flex';
                
                // Handle approve payment - modified to connect wallet automatically if needed
                approvePaymentBtn.addEventListener('click', async () => {
                    if (!currentAccount) {
                        // Connect wallet first, then proceed with payment
                        statusDiv.textContent = 'Connecting wallet to process payment...';
                        await connectMetaMask();
                    }
                    
                    // Now check if connection was successful
                    if (currentAccount) {
                        paymentRequestModal.style.display = 'none';
                        sendTo.value = recipient;
                        sendAmount.value = amount;
                        if (note) sendNote.value = note;
                        sendForm.style.display = 'block';
                    } else {
                        // Still not connected, show a more helpful message
                        alert('Unable to connect to your wallet. Please make sure MetaMask is installed and unlocked.');
                    }
                });
                
                // Handle decline payment
                declinePaymentBtn.addEventListener('click', () => {
                    paymentRequestModal.style.display = 'none';
                });
                
                // Close modal when clicking X
                const closeBtn = paymentRequestModal.querySelector('.close-modal');
                closeBtn.addEventListener('click', () => {
                    paymentRequestModal.style.display = 'none';
                });
                
                // Close modal when clicking outside
                window.addEventListener('click', (e) => {
                    if (e.target === paymentRequestModal) {
                        paymentRequestModal.style.display = 'none';
                    }
                });
            }
        }
    };
    
    // Hide all forms
    const hideAllForms = () => {
        sendForm.style.display = 'none';
        requestForm.style.display = 'none';
    };
    
    // Event listeners
    connectBtn.addEventListener('click', connectMetaMask);
    refreshBtn.addEventListener('click', () => {
        const account = accountAddress.textContent;
        if (account) {
            getBalance(account);
        }
    });
    
    // Send and Request button events
    sendBtn.addEventListener('click', () => {
        hideAllForms();
        sendForm.style.display = 'block';
    });
    
    requestBtn.addEventListener('click', () => {
        hideAllForms();
        requestForm.style.display = 'block';
    });
    
    // Cancel buttons
    cancelSendBtn.addEventListener('click', () => {
        sendForm.style.display = 'none';
        sendTo.value = '';
        sendAmount.value = '';
        sendNote.value = '';
    });
    
    cancelRequestBtn.addEventListener('click', () => {
        requestForm.style.display = 'none';
        requestFrom.value = '';
        requestAmount.value = '';
        requestNote.value = '';
    });
    
    // Confirm send button
    confirmSendBtn.addEventListener('click', () => {
        if (validateSendForm()) {
            showConfirmation(sendTo.value, sendAmount.value, sendNote.value);
        }
    });
    
    // Final confirmation button
    finalConfirmBtn.addEventListener('click', async () => {
        const success = await sendEth(
            confirmRecipient.textContent,
            parseFloat(confirmAmount.textContent),
            confirmNote.textContent
        );
        
        closeModals();
        
        if (success) {
            showSuccess();
            sendForm.style.display = 'none';
            sendTo.value = '';
            sendAmount.value = '';
            sendNote.value = '';
        }
    });
    
    // Copy request link button
    copyRequestLinkBtn.addEventListener('click', () => {
        if (requestFrom.value && requestAmount.value) {
            const requestLink = createRequestLink(
                currentAccount,
                requestAmount.value,
                requestNote.value
            );
            
            copyToClipboard(requestLink);
            
            // Add to transaction history
            addTransaction('request', requestFrom.value, requestAmount.value, requestNote.value, 'pending');
        } else {
            alert('Please fill in the required fields');
        }
    });
    
    // Close buttons for modals
    closeModalButtons.forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    cancelConfirmBtn.addEventListener('click', closeModals);
    closeSuccessBtn.addEventListener('click', closeModals);
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === confirmationModal) {
            closeModals();
        }
        if (e.target === successModal) {
            closeModals();
        }
    });
    
    // Initial UI setup
    statusDiv.textContent = 'Click the button below to connect to MetaMask';
    updateTransactionList();
    
    // Load saved balance visibility preference
    loadVisibilityPreference();
};

// Run immediately
initApp();

// Also run when DOM is fully loaded (as a fallback)
document.addEventListener('DOMContentLoaded', initApp);
