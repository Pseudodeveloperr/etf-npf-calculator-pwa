// ETF & NPF Calculator JavaScript - PWA Version with Enhanced Features - FIXED

// Global variables for record keeping
let calculationRecords = [];
let recordCounter = 0;

// PWA Installation variables
let deferredPrompt;
let isInstalled = false;

// Sample Data
const sampleData = {
    "etf": [
        {
            "agreedCeaseDate": "2025-08-20",
            "contractEndDate": "2030-08-20",
            "monthlySell": 50.00
        },
        {
            "agreedCeaseDate": "2025-06-15",
            "contractEndDate": "2028-12-31",
            "monthlySell": 100.00
        }
    ],
    "npf": [
        {
            "agreedCeaseDate": "2025-03-05",
            "requestReceivedDate": "2025-02-26",
            "monthlySell": 3.77
        },
        {
            "agreedCeaseDate": "2025-07-29",
            "requestReceivedDate": "2025-07-28",
            "monthlySell": 23.70
        }
    ]
};

// PWA Configuration - FIXED
const PWA_CONFIG = {
    name: "ETF & NPF Calculator",
    short_name: "ETF Calculator",
    description: "Professional Early Termination & Notice Period Fee Calculator with automatic record keeping",
    start_url: "./",  // FIXED: Changed from "/" to "./"
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    orientation: "portrait-primary",
    icons: [
        {
            src: "./logo.jpg",  // FIXED: Changed from "logo.jpg" to "./logo.jpg"
            sizes: "192x192",
            type: "image/jpeg",
            purpose: "any maskable"
        },
        {
            src: "./logo.jpg",  // FIXED: Changed from "logo.jpg" to "./logo.jpg"
            sizes: "512x512",
            type: "image/jpeg",
            purpose: "any maskable"
        }
    ]
};

// PWA Functions
function createManifest() {
    try {
        const manifestBlob = new Blob([JSON.stringify(PWA_CONFIG, null, 2)], { type: 'application/json' });
        const manifestURL = URL.createObjectURL(manifestBlob);

        const manifestLink = document.getElementById('manifest-link');
        if (manifestLink) {
            manifestLink.href = manifestURL;
            console.log('PWA manifest created and linked');
        }
    } catch (error) {
        console.error('Error creating manifest:', error);
    }
}

function createServiceWorker() {
    const swCode = `
        const CACHE_NAME = 'etf-calculator-v1.0.0';
        const ASSETS_TO_CACHE = [
            './',
            './index.html',
            './style.css',
            './app.js',
            './logo.jpg'
            // FIXED: Removed '/background.jpg' since it doesn't exist
        ];

        // Install event
        self.addEventListener('install', (event) => {
            console.log('Service Worker installing...');
            event.waitUntil(
                caches.open(CACHE_NAME)
                    .then((cache) => {
                        console.log('Service Worker caching assets');
                        return Promise.all(
                            ASSETS_TO_CACHE.map(url => {
                                return cache.add(url).catch(err => {
                                    console.warn('Failed to cache:', url, err);
                                    return Promise.resolve();
                                });
                            })
                        );
                    })
                    .catch((error) => {
                        console.error('Service Worker cache failed:', error);
                    })
            );
            self.skipWaiting();
        });

        // Activate event
        self.addEventListener('activate', (event) => {
            console.log('Service Worker activating...');
            event.waitUntil(
                caches.keys().then((cacheNames) => {
                    return Promise.all(
                        cacheNames.map((cacheName) => {
                            if (cacheName !== CACHE_NAME) {
                                console.log('Service Worker deleting old cache:', cacheName);
                                return caches.delete(cacheName);
                            }
                        })
                    );
                })
            );
            return self.clients.claim();
        });

        // Fetch event - Cache First Strategy
        self.addEventListener('fetch', (event) => {
            event.respondWith(
                caches.match(event.request)
                    .then((response) => {
                        if (response) {
                            return response;
                        }
                        return fetch(event.request)
                            .then((response) => {
                                if (!response || response.status !== 200 || response.type !== 'basic') {
                                    return response;
                                }
                                const responseToCache = response.clone();
                                caches.open(CACHE_NAME)
                                    .then((cache) => {
                                        cache.put(event.request, responseToCache);
                                    });
                                return response;
                            });
                    })
                    .catch(() => {
                        // Return cached fallback for navigation requests
                        if (event.request.destination === 'document') {
                            return caches.match('./index.html');
                        }
                    })
            );
        });

        // Message event for cache updates
        self.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'SKIP_WAITING') {
                self.skipWaiting();
            }
        });
    `;

    try {
        // FIXED: Use external service worker file instead of blob URL
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./service-worker.js')  // FIXED: Point to actual file
                .then((registration) => {
                    console.log('Service Worker registered successfully:', registration);

                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('New service worker installed, updating...');
                                newWorker.postMessage({ type: 'SKIP_WAITING' });
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });

            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        }
    } catch (error) {
        console.error('Error creating service worker:', error);
    }
}

function setupPWAInstallation() {
    // Check if already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        isInstalled = true;
        console.log('App is running in standalone mode');
        return;
    }

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (event) => {
        console.log('PWA install prompt available');
        event.preventDefault();
        deferredPrompt = event;
        showInstallBanner();
    });

    // Setup install banner interactions
    const installBtn = document.getElementById('install-btn');
    const dismissBtn = document.getElementById('dismiss-install');

    if (installBtn) {
        installBtn.addEventListener('click', installApp);
    }

    if (dismissBtn) {
        dismissBtn.addEventListener('click', hideInstallBanner);
    }

    // Listen for app installed event
    window.addEventListener('appinstalled', (event) => {
        console.log('PWA was installed successfully');
        isInstalled = true;
        hideInstallBanner();
        showSuccessNotification('App installed successfully! You can now use it offline.');
    });

    // Show install banner after delay if not installed (reduced time for testing)
    setTimeout(() => {
        if (!isInstalled && !deferredPrompt) {
            // Fallback: show install banner even without prompt for testing
            console.log('Showing install banner for testing purposes');
            showInstallBanner();
        } else if (!isInstalled && deferredPrompt) {
            showInstallBanner();
        }
    }, 5000); // Show after 5 seconds for testing
}

function showInstallBanner() {
    const banner = document.getElementById('install-banner');
    if (banner) {
        banner.classList.remove('hidden');
        banner.classList.add('show');
        console.log('Install banner displayed');
    }
}

function hideInstallBanner() {
    const banner = document.getElementById('install-banner');
    if (banner) {
        banner.classList.remove('show');
        setTimeout(() => {
            banner.classList.add('hidden');
        }, 300);
        console.log('Install banner hidden');
    }
}

function installApp() {
    if (!deferredPrompt) {
        // Fallback message if no install prompt available
        showSuccessNotification('To install this app, use your browser\'s "Add to Home Screen" or "Install App" option.');
        return;
    }

    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the PWA install prompt');
        } else {
            console.log('User dismissed the PWA install prompt');
        }
        deferredPrompt = null;
        hideInstallBanner();
    });
}

// Tab switching functionality - FIXED
function switchTab(tabId) {
    console.log('Switching to tab:', tabId);

    try {
        // Get all tabs and content
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        console.log('Found tab buttons:', tabButtons.length);
        console.log('Found tab contents:', tabContents.length);

        // Remove active class from all
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            console.log('Removed active from button:', btn.getAttribute('data-tab'));
        });

        tabContents.forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none'; // Ensure hidden
            console.log('Removed active from content:', content.id);
        });

        // Add active class to selected elements
        const activeButton = document.querySelector(`[data-tab="${tabId}"]`);
        const activeContent = document.getElementById(`${tabId}-tab`);

        console.log('Active button found:', !!activeButton);
        console.log('Active content found:', !!activeContent);

        if (activeButton) {
            activeButton.classList.add('active');
            console.log('Added active to button');
        }

        if (activeContent) {
            activeContent.classList.add('active');
            activeContent.style.display = 'block'; // Ensure visible
            console.log('Added active to content and made visible');
        }

        console.log(`Successfully switched to ${tabId} tab`);
    } catch (error) {
        console.error('Error switching tabs:', error);
    }
}

// ETF Calculator Functions - FIXED
function calculateETF() {
    console.log('Starting ETF calculation...');

    try {
        // Get form data
        const formData = getETFFormData();
        console.log('ETF Form data:', formData);

        // Validate
        if (!validateETFForm(true)) {
            console.log('ETF form validation failed');
            return;
        }

        // Calculate
        const results = computeETF(formData);
        console.log('ETF Calculation results:', results);

        // Display results
        displayETFResults(results, formData);

        // Save record
        saveCalculationRecord('ETF', formData, results);

        // Show success
        showSuccessNotification('ETF calculation completed and saved!');

        // Clear errors
        clearErrors('etf');

    } catch (error) {
        console.error('ETF calculation error:', error);
        showError('etf', 'Calculation error: ' + error.message);
    }
}

function loadETFSample() {
    console.log('Loading ETF sample data...');
    try {
        const sample = sampleData.etf[0];

        document.getElementById('etf-agreed-date').value = sample.agreedCeaseDate;
        document.getElementById('etf-contract-date').value = sample.contractEndDate;
        document.getElementById('etf-monthly-sell').value = sample.monthlySell;

        console.log('ETF sample data loaded successfully');

        // Auto calculate after short delay
        setTimeout(() => {
            calculateETF();
        }, 500);
    } catch (error) {
        console.error('Error loading ETF sample:', error);
    }
}

function clearETFForm() {
    try {
        document.getElementById('etf-form').reset();
        document.getElementById('etf-results').innerHTML = `
            <div class="results-placeholder modern-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M9 17H7A5 5 0 0 1 7 7h2"/>
                    <path d="M15 7h2a5 5 0 1 1 0 10h-2"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                <p>Enter data and calculate to see results</p>
            </div>
        `;
        clearErrors('etf');
        console.log('ETF form cleared successfully');
    } catch (error) {
        console.error('Error clearing ETF form:', error);
    }
}

// NPF Calculator Functions - FIXED
function calculateNPF() {
    console.log('Starting NPF calculation...');

    try {
        // Get form data
        const formData = getNPFFormData();
        console.log('NPF Form data:', formData);

        // Validate
        if (!validateNPFForm(true)) {
            console.log('NPF form validation failed');
            return;
        }

        // Calculate
        const results = computeNPF(formData);
        console.log('NPF Calculation results:', results);

        // Display results
        displayNPFResults(results, formData);

        // Save record
        saveCalculationRecord('NPF', formData, results);

        // Show success
        showSuccessNotification('NPF calculation completed and saved!');

        // Clear errors
        clearErrors('npf');

    } catch (error) {
        console.error('NPF calculation error:', error);
        showError('npf', 'Calculation error: ' + error.message);
    }
}

function loadNPFSample() {
    console.log('Loading NPF sample data...');
    try {
        const sample = sampleData.npf[0];

        document.getElementById('npf-agreed-date').value = sample.agreedCeaseDate;
        document.getElementById('npf-request-date').value = sample.requestReceivedDate;
        document.getElementById('npf-monthly-sell').value = sample.monthlySell;

        console.log('NPF sample data loaded successfully');

        // Auto calculate after short delay
        setTimeout(() => {
            calculateNPF();
        }, 500);
    } catch (error) {
        console.error('Error loading NPF sample:', error);
    }
}

function clearNPFForm() {
    try {
        document.getElementById('npf-form').reset();
        document.getElementById('npf-results').innerHTML = `
            <div class="results-placeholder modern-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M9 17H7A5 5 0 0 1 7 7h2"/>
                    <path d="M15 7h2a5 5 0 1 1 0 10h-2"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                <p>Enter data and calculate to see results</p>
            </div>
        `;
        clearErrors('npf');
        console.log('NPF form cleared successfully');
    } catch (error) {
        console.error('Error clearing NPF form:', error);
    }
}

// Records Management Functions - FIXED
function saveCalculationRecord(type, formData, results) {
    try {
        recordCounter++;
        const record = {
            id: recordCounter,
            type: type,
            timestamp: new Date().toISOString(),
            formData: { ...formData },
            results: { ...results }
        };

        calculationRecords.push(record);
        updateRecordsCounter();
        enableExportButton();

        console.log(`${type} record saved:`, record);
    } catch (error) {
        console.error('Error saving calculation record:', error);
    }
}

function updateRecordsCounter() {
    try {
        const counterElement = document.getElementById('records-count');
        if (counterElement) {
            counterElement.textContent = calculationRecords.length;
            console.log(`Updated records counter to: ${calculationRecords.length}`);
        }
    } catch (error) {
        console.error('Error updating records counter:', error);
    }
}

function enableExportButton() {
    try {
        const exportBtn = document.getElementById('export-csv');
        if (exportBtn && calculationRecords.length > 0) {
            exportBtn.disabled = false;
            exportBtn.classList.remove('disabled');
            console.log('Export button enabled');
        }
    } catch (error) {
        console.error('Error enabling export button:', error);
    }
}

function exportToCSV() {
    if (calculationRecords.length === 0) {
        showError('general', 'No calculation records to export');
        return;
    }

    try {
        const csvContent = generateCSVContent();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `etf_npf_calculations_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showSuccessNotification(`Successfully exported ${calculationRecords.length} records to CSV!`);
            console.log('CSV export completed successfully');
        }
    } catch (error) {
        console.error('CSV export error:', error);
        showError('general', 'Failed to export CSV: ' + error.message);
    }
}

function generateCSVContent() {
    const headers = [
        'Record ID',
        'Type',
        'Timestamp',
        'Agreed Cease Date',
        'Contract End Date / Request Received Date',
        'Monthly Sell Amount',
        'Actual ACD',
        'Result Amount',
        'Additional Data'
    ];

    let csvContent = headers.join(',') + '\n';

    calculationRecords.forEach(record => {
        const row = [
            record.id,
            record.type,
            new Date(record.timestamp).toLocaleString(),
            record.formData.agreedCeaseDate || '',
            record.formData.contractEndDate || record.formData.requestReceivedDate || '',
            record.formData.monthlySell || '',
            record.results.actualACD ? new Date(record.results.actualACD).toLocaleDateString() : '',
            record.type === 'ETF' ? record.results.totalETF : record.results.totalNPF,
            record.type === 'ETF' 
                ? `Months: ${record.results.monthsRemaining}, Days: ${record.results.daysRemaining}`
                : `Days Between: ${record.results.daysBetween}, NPF Days: ${record.results.npfDaysRemaining}`
        ];

        csvContent += row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    return csvContent;
}

// Data Extraction Functions - FIXED
function getETFFormData() {
    try {
        const agreedCeaseDate = document.getElementById('etf-agreed-date')?.value;
        const contractEndDate = document.getElementById('etf-contract-date')?.value;
        const monthlySellStr = document.getElementById('etf-monthly-sell')?.value;

        return {
            agreedCeaseDate: agreedCeaseDate || '',
            contractEndDate: contractEndDate || '',
            monthlySell: monthlySellStr ? parseFloat(monthlySellStr) : 0
        };
    } catch (error) {
        console.error('Error getting ETF form data:', error);
        return { agreedCeaseDate: '', contractEndDate: '', monthlySell: 0 };
    }
}

function getNPFFormData() {
    try {
        const agreedCeaseDate = document.getElementById('npf-agreed-date')?.value;
        const requestReceivedDate = document.getElementById('npf-request-date')?.value;
        const monthlySellStr = document.getElementById('npf-monthly-sell')?.value;

        return {
            agreedCeaseDate: agreedCeaseDate || '',
            requestReceivedDate: requestReceivedDate || '',
            monthlySell: monthlySellStr ? parseFloat(monthlySellStr) : 0
        };
    } catch (error) {
        console.error('Error getting NPF form data:', error);
        return { agreedCeaseDate: '', requestReceivedDate: '', monthlySell: 0 };
    }
}

// EXACT SAME CALCULATION LOGIC - ETF Calculation Function
function computeETF(data) {
    const agreedCeaseDate = new Date(data.agreedCeaseDate);
    const contractEndDate = new Date(data.contractEndDate);
    const monthlySell = data.monthlySell;

    // Step 1: Actual ACD = Agreed Cease Date + 1 day
    const actualACD = new Date(agreedCeaseDate);
    actualACD.setDate(actualACD.getDate() + 1);

    // Check if contract is expired
    if (actualACD >= contractEndDate) {
        return {
            actualACD,
            monthsRemaining: 0,
            daysRemaining: 0,
            daysInContractEndMonth: getDaysInMonth(contractEndDate),
            monthlyPortion: 0,
            dailyPortion: 0,
            totalETF: 0,
            isExpired: true
        };
    }

    // Step 2: Calculate from Actual ACD to Contract End Date
    const monthsRemaining = getMonthsDifference(actualACD, contractEndDate);

    // Get the date after adding the calculated months
    const dateAfterMonths = new Date(actualACD);
    dateAfterMonths.setMonth(dateAfterMonths.getMonth() + monthsRemaining);

    // Calculate remaining days in the contract end month
    let daysRemaining = 0;
    if (dateAfterMonths < contractEndDate) {
        daysRemaining = getDaysDifference(dateAfterMonths, contractEndDate);
    }

    const daysInContractEndMonth = getDaysInMonth(contractEndDate);

    // Step 3 & 4: Calculate ETF using exact formula
    // Monthly Portion = Months Remaining × Monthly Sell Amount
    const monthlyPortion = monthsRemaining * monthlySell;

    // Daily Portion = Days Remaining ÷ Days in Contract End Month × Monthly Sell Amount
    const dailyPortion = daysRemaining > 0 ? (daysRemaining / daysInContractEndMonth) * monthlySell : 0;

    // Step 5: Total ETF = Monthly Portion + Daily Portion
    const totalETF = monthlyPortion + dailyPortion;

    return {
        actualACD,
        monthsRemaining,
        daysRemaining,
        daysInContractEndMonth,
        monthlyPortion,
        dailyPortion,
        totalETF,
        isExpired: false
    };
}

// EXACT SAME CALCULATION LOGIC - NPF Calculation Function
function computeNPF(data) {
    const requestReceivedDate = new Date(data.requestReceivedDate);
    const agreedCeaseDate = new Date(data.agreedCeaseDate);
    const monthlySell = data.monthlySell;

    // Calculate Actual ACD = Agreed Cease Date + 1 day
    const actualACD = new Date(agreedCeaseDate);
    actualACD.setDate(actualACD.getDate() + 1);

    // Calculate days between Request Received Date and Actual ACD
    const daysBetween = getDaysDifference(requestReceivedDate, actualACD);

    // Calculate NPF Days Remaining (30 - Days Between)
    const npfDaysRemaining = Math.max(0, 30 - daysBetween);

    // Calculate NPF based on formula: NPF = Monthly Sell × NPF Days Remaining ÷ 30
    let totalNPF;
    if (npfDaysRemaining <= 0) {
        totalNPF = 0; // No NPF if no days remaining
    } else {
        totalNPF = monthlySell * npfDaysRemaining / 30;
    }

    return {
        actualACD,
        daysBetween,
        npfDaysRemaining,
        totalNPF
    };
}

// Utility Functions - EXACTLY THE SAME
function getMonthsDifference(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    let months = 0;
    const current = new Date(start);

    while (current < end) {
        const nextMonth = new Date(current);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        if (nextMonth <= end) {
            months++;
            current.setMonth(current.getMonth() + 1);
        } else {
            break;
        }
    }

    return months;
}

function getDaysInMonth(date) {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function getDaysDifference(date1, date2) {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

function formatDate(dateInput) {
    try {
        let date;
        if (dateInput instanceof Date) {
            date = dateInput;
        } else {
            date = new Date(dateInput);
        }
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
}

function formatCurrency(amount) {
    try {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        }).format(amount);
    } catch (error) {
        console.error('Error formatting currency:', error);
        return '£' + amount.toFixed(2);
    }
}

// Enhanced Display Functions - FIXED
function displayETFResults(results, formData) {
    try {
        const resultsContainer = document.getElementById('etf-results');
        if (!resultsContainer) {
            console.error('ETF results container not found');
            return;
        }

        const statusHtml = results.isExpired ? 
            '<span class="status--expired">Contract Expired</span>' : 
            '<span class="status--active">Active Contract</span>';

        resultsContainer.innerHTML = `
            <div class="result-item">
                <span class="result-label">Contract Status:</span>
                <span class="result-value">${statusHtml}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Agreed Cease Date:</span>
                <span class="result-value">${formatDate(formData.agreedCeaseDate)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Actual ACD:</span>
                <span class="result-value">${formatDate(results.actualACD)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Contract End Date:</span>
                <span class="result-value">${formatDate(formData.contractEndDate)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Monthly Sell Amount:</span>
                <span class="result-value">${formatCurrency(formData.monthlySell)}</span>
            </div>

            <div class="live-calculation">
                <div class="calculation-header">
                    <h4>ETF Calculation Breakdown</h4>
                </div>
                <div class="calculation-breakdown">
                    <div class="breakdown-line">
                        <span>Time Remaining:</span>
                        <span>${results.monthsRemaining} months and ${results.daysRemaining} days</span>
                    </div>
                    <div class="breakdown-line">
                        <span>Monthly Portion:</span>
                        <span>${results.monthsRemaining} × ${formatCurrency(formData.monthlySell)} = ${formatCurrency(results.monthlyPortion)}</span>
                    </div>
                    <div class="breakdown-line">
                        <span>Daily Portion:</span>
                        <span>${results.daysRemaining} ÷ ${results.daysInContractEndMonth} × ${formatCurrency(formData.monthlySell)} = ${formatCurrency(results.dailyPortion)}</span>
                    </div>
                    <div class="breakdown-line total">
                        <span>Total ETF:</span>
                        <span class="currency">${formatCurrency(results.totalETF)}</span>
                    </div>
                </div>
            </div>
        `;

        console.log('ETF results displayed successfully');
    } catch (error) {
        console.error('Error displaying ETF results:', error);
    }
}

function displayNPFResults(results, formData) {
    try {
        const resultsContainer = document.getElementById('npf-results');
        if (!resultsContainer) {
            console.error('NPF results container not found');
            return;
        }

        resultsContainer.innerHTML = `
            <div class="result-item">
                <span class="result-label">Agreed Cease Date:</span>
                <span class="result-value">${formatDate(formData.agreedCeaseDate)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Actual ACD:</span>
                <span class="result-value">${formatDate(results.actualACD)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Request Received Date:</span>
                <span class="result-value">${formatDate(formData.requestReceivedDate)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Monthly Sell Amount:</span>
                <span class="result-value">${formatCurrency(formData.monthlySell)}</span>
            </div>

            <div class="live-calculation">
                <div class="calculation-header">
                    <h4>NPF Calculation Breakdown</h4>
                </div>
                <div class="calculation-breakdown">
                    <div class="breakdown-line">
                        <span>Days between Request and Actual ACD:</span>
                        <span>${results.daysBetween} days</span>
                    </div>
                    <div class="breakdown-line">
                        <span>NPF Days Remaining:</span>
                        <span>30 - ${results.daysBetween} = ${results.npfDaysRemaining} days</span>
                    </div>
                    <div class="breakdown-line">
                        <span>NPF Calculation:</span>
                        <span>${formatCurrency(formData.monthlySell)} × ${results.npfDaysRemaining} ÷ 30</span>
                    </div>
                    <div class="breakdown-line total">
                        <span>Total NPF:</span>
                        <span class="currency">${formatCurrency(results.totalNPF)}</span>
                    </div>
                </div>
            </div>

            <div class="formula-display">
                <div class="formula-title">NPF Formula:</div>
                NPF = Monthly Sell × NPF Days Remaining ÷ 30<br>
                <small>Where NPF Days Remaining = 30 - (Days between Request Received Date and Actual ACD)</small>
            </div>
        `;

        console.log('NPF results displayed successfully');
    } catch (error) {
        console.error('Error displaying NPF results:', error);
    }
}

// Validation Functions - FIXED
function validateETFForm(showErrors = false) {
    try {
        const errors = [];
        const data = getETFFormData();

        if (!data.agreedCeaseDate) errors.push('Agreed Cease Date is required');
        if (!data.contractEndDate) errors.push('Contract End Date is required');
        if (!data.monthlySell || data.monthlySell <= 0) errors.push('Monthly Sell Amount must be a positive number');

        // Additional validation
        if (data.agreedCeaseDate && data.contractEndDate && new Date(data.agreedCeaseDate) > new Date(data.contractEndDate)) {
            errors.push('Agreed Cease Date cannot be after Contract End Date');
        }

        if (showErrors && errors.length > 0) {
            showErrorMessages('etf', errors);
            return false;
        }

        clearErrors('etf');
        return errors.length === 0;
    } catch (error) {
        console.error('Error validating ETF form:', error);
        return false;
    }
}

function validateNPFForm(showErrors = false) {
    try {
        const errors = [];
        const data = getNPFFormData();

        if (!data.agreedCeaseDate) errors.push('Agreed Cease Date is required');
        if (!data.requestReceivedDate) errors.push('Request Received Date is required');
        if (!data.monthlySell || data.monthlySell <= 0) errors.push('Monthly Sell Amount must be a positive number');

        // Additional validation
        if (data.requestReceivedDate && data.agreedCeaseDate && new Date(data.requestReceivedDate) > new Date(data.agreedCeaseDate)) {
            errors.push('Request Received Date cannot be after Agreed Cease Date');
        }

        if (showErrors && errors.length > 0) {
            showErrorMessages('npf', errors);
            return false;
        }

        clearErrors('npf');
        return errors.length === 0;
    } catch (error) {
        console.error('Error validating NPF form:', error);
        return false;
    }
}

// Error Handling and Notifications - FIXED
function showError(type, message) {
    showErrorMessages(type, [message]);
}

function showErrorMessages(type, errors) {
    try {
        const errorContainer = document.getElementById(`${type}-errors`);
        if (errorContainer) {
            errorContainer.innerHTML = errors.map(error => 
                `<div class="error-message">${error}</div>`
            ).join('');
        }
    } catch (error) {
        console.error('Error showing error messages:', error);
    }
}

function clearErrors(type) {
    try {
        const errorContainer = document.getElementById(`${type}-errors`);
        if (errorContainer) {
            errorContainer.innerHTML = '';
        }
    } catch (error) {
        console.error('Error clearing errors:', error);
    }
}

function showSuccessNotification(message) {
    try {
        const notification = document.getElementById('success-notification');
        if (notification) {
            const messageSpan = notification.querySelector('span');
            if (messageSpan) {
                messageSpan.textContent = message;
            }
            notification.classList.remove('hidden');
            notification.classList.add('show');

            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.classList.add('hidden');
                }, 300);
            }, 3000);
        }
    } catch (error) {
        console.error('Error showing success notification:', error);
    }
}

// Real-time calculation setup - SIMPLIFIED AND FIXED
function setupRealTimeCalculation() {
    try {
        // ETF form inputs
        const etfInputs = ['etf-agreed-date', 'etf-contract-date', 'etf-monthly-sell'];
        etfInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => {
                    if (validateETFForm(false)) {
                        clearTimeout(input.calcTimeout);
                        input.calcTimeout = setTimeout(() => {
                            try {
                                calculateETF();
                            } catch (error) {
                                console.log('Real-time ETF calculation skipped due to error:', error);
                            }
                        }, 1000);
                    }
                });
            }
        });

        // NPF form inputs
        const npfInputs = ['npf-agreed-date', 'npf-request-date', 'npf-monthly-sell'];
        npfInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => {
                    if (validateNPFForm(false)) {
                        clearTimeout(input.calcTimeout);
                        input.calcTimeout = setTimeout(() => {
                            try {
                                calculateNPF();
                            } catch (error) {
                                console.log('Real-time NPF calculation skipped due to error:', error);
                            }
                        }, 1000);
                    }
                });
            }
        });

        console.log('Real-time calculation setup completed');
    } catch (error) {
        console.error('Error setting up real-time calculation:', error);
    }
}

// Make all functions globally accessible
window.switchTab = switchTab;
window.calculateETF = calculateETF;
window.loadETFSample = loadETFSample;
window.clearETFForm = clearETFForm;
window.calculateNPF = calculateNPF;
window.loadNPFSample = loadNPFSample;
window.clearNPFForm = clearNPFForm;
window.exportToCSV = exportToCSV;

// Initialize when DOM is loaded - ENHANCED
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Enhanced PWA ETF & NPF Calculator...');

    try {
        // Initialize PWA features
        createManifest();
        createServiceWorker();
        setupPWAInstallation();

        // Setup real-time calculation
        setupRealTimeCalculation();

        // Initialize records counter
        updateRecordsCounter();

        // Initialize tab state
        switchTab('etf'); // Ensure ETF tab is active by default

        console.log('Enhanced PWA application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
    }
});
