// import { PhishingDetector } from './phishing_detector.js'; // Removed

document.addEventListener("DOMContentLoaded", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const resultsDiv = document.getElementById("results");

    if (!tab || !tab.url) {
        resultsDiv.textContent = "Unable to analyze current page.";
        return;
    }

    try {
        // Analyze current URL
        const response = await fetch('http://localhost:8000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: tab.url }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

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

        // Clear and update results
        resultsDiv.innerHTML = '';
        resultsDiv.appendChild(resultContainer);

    } catch (error) {
        resultsDiv.textContent = "Error analyzing URL: " + error.message;
        console.error("Analysis error:", error);
    }
});
