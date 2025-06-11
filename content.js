// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PHISHING_WARNING') {
        showPhishingWarning(message.data);
    }
});

function showPhishingWarning(data) {
    // Create warning banner
    const banner = document.createElement('div');
    banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background-color: #ff4444;
        color: white;
        padding: 15px;
        text-align: center;
        z-index: 999999;
        font-family: Arial, sans-serif;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;

    // Create warning message
    const warningText = document.createElement('div');
    warningText.innerHTML = `
        <strong>⚠️ Warning: This website might be a phishing attempt!</strong>
        <br>
        Risk Score: ${(data.score * 100).toFixed(1)}%
        <br>
        <small>Click for more details</small>
    `;

    // Add click handler to show details
    banner.onclick = () => {
        const details = Object.entries(data.features)
            .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`)
            .join('\n');
        alert(`Phishing Detection Details:\n\n${details}`);
    };

    banner.appendChild(warningText);

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0 10px;
    `;
    closeButton.onclick = (e) => {
        e.stopPropagation();
        banner.remove();
    };
    banner.appendChild(closeButton);

    // Add banner to page
    document.body.appendChild(banner);
}
  