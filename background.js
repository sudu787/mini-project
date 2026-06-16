// import { PhishingDetector } from './phishing_detector.js'; // Removed

// Listen for tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        try {
            const response = await fetch('http://localhost:8000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: tab.url }),
            });

            if (!response.ok) {
                // Handle error, maybe log it or set a default icon
                console.error(`HTTP error! status: ${response.status}`);
                // Set a neutral or error icon
                chrome.action.setIcon({
                    path: {
                        "16": "icons/neutral-16.png", // Assuming you have a neutral icon
                        "48": "icons/neutral-48.png",
                        "128": "icons/neutral-128.png"
                    },
                    tabId: tabId
                });
                return; // Stop further processing for this tab
            }
            const result = await response.json();

            if (result.is_phishing) {
                // Show warning icon
                chrome.action.setIcon({
                    path: {
                        "16": "icons/warning-16.png",
                        "48": "icons/warning-48.png",
                        "128": "icons/warning-128.png"
                    },
                    tabId: tabId
                });

                // Send alert to the content script
                chrome.tabs.sendMessage(tabId, {
                    type: 'PHISHING_WARNING',
                    data: {
                        score: result.score,
                        features: result.features
                    }
                });
            } else {
                // Show safe icon
                chrome.action.setIcon({
                    path: {
                        "16": "icons/safe-16.png",
                        "48": "icons/safe-48.png",
                        "128": "icons/safe-128.png"
                    },
                    tabId: tabId
                });
            }
        } catch (error) {
            console.error('Error analyzing URL:', error);
            // Optionally set a neutral/error icon here as well if fetch itself fails
            chrome.action.setIcon({
                path: {
                    "16": "icons/neutral-16.png",
                    "48": "icons/neutral-48.png",
                    "128": "icons/neutral-128.png"
                },
                tabId: tabId
            });
        }
    }
});
