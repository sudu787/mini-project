// Import the PhishingDetector class
import { PhishingDetector } from './phishing_detector.js';

// Initialize the phishing detector
const detector = new PhishingDetector();

// Listen for tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        try {
            const result = await detector.predict(tab.url);
            
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
        }
    }
});
