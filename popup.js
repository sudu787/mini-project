// Import the PhishingDetector class
import { PhishingDetector } from './phishing_detector.js';

// Initialize the phishing detector
const detector = new PhishingDetector();

document.addEventListener("DOMContentLoaded", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const resultsDiv = document.getElementById("results");

    if (!tab || !tab.url) {
        resultsDiv.textContent = "Unable to analyze current page.";
        return;
    }

    try {
        // Analyze current URL
        const result = await detector.predict(tab.url);
        
        // Create result display
        const resultContainer = document.createElement('div');
        resultContainer.className = 'result-container';
        
        // Add risk score
        const scoreDiv = document.createElement('div');
        scoreDiv.className = `score-indicator ${result.is_phishing ? 'high-risk' : 'low-risk'}`;
        scoreDiv.innerHTML = `
            <h2>Risk Score: ${(result.score * 100).toFixed(1)}%</h2>
            <p class="risk-label">${result.is_phishing ? '⚠️ High Risk - Potential Phishing Site' : '✅ Low Risk - Likely Safe'}</p>
        `;
        resultContainer.appendChild(scoreDiv);

        // Add URL display
        const urlDiv = document.createElement('div');
        urlDiv.className = 'url-display';
        urlDiv.innerHTML = `<p>Analyzing: ${tab.url.substring(0, 50)}${tab.url.length > 50 ? '...' : ''}</p>`;
        resultContainer.appendChild(urlDiv);

        // Add feature details
        const featuresDiv = document.createElement('div');
        featuresDiv.className = 'feature-details';
        featuresDiv.innerHTML = '<h3>Detection Features:</h3>';
        
        const featureList = document.createElement('ul');
        Object.entries(result.features).forEach(([key, value]) => {
            const li = document.createElement('li');
            li.className = value ? 'feature-warning' : 'feature-safe';
            li.innerHTML = `
                <span class="feature-name">${key.replace(/_/g, ' ')}</span>
                <span class="feature-indicator">${value ? '⚠️' : '✅'}</span>
            `;
            featureList.appendChild(li);
        });
        
        featuresDiv.appendChild(featureList);
        resultContainer.appendChild(featuresDiv);

        // Clear and update results
        resultsDiv.innerHTML = '';
        resultsDiv.appendChild(resultContainer);

    } catch (error) {
        resultsDiv.textContent = "Error analyzing URL: " + error.message;
        console.error("Analysis error:", error);
    }
});
