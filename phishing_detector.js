// URL Feature Extraction for Phishing Detection

export class PhishingDetector {
    constructor() {
        this.shorteningServices = new RegExp(
            'bit\\.ly|goo\\.gl|shorte\\.st|go2l\\.ink|x\\.co|ow\\.ly|t\\.co|tinyurl|tr\\.im|is\\.gd|cli\\.gs|' +
            'yfrog\\.com|migre\\.me|ff\\.im|tiny\\.cc|url4\\.eu|twit\\.ac|su\\.pr|twurl\\.nl|snipurl\\.com|' +
            'short\\.to|BudURL\\.com|ping\\.fm|post\\.ly|Just\\.as|bkite\\.com|snipr\\.com|fic\\.kr|loopt\\.us|' +
            'doiop\\.com|short\\.ie|kl\\.am|wp\\.me|rubyurl\\.com|om\\.ly|to\\.ly|bit\\.do|t\\.co|lnkd\\.in|db\\.tt|' +
            'qr\\.ae|adf\\.ly|goo\\.gl|bitly\\.com|cur\\.lv|tinyurl\\.com|ow\\.ly|bit\\.ly|ity\\.im|q\\.gs|is\\.gd|' +
            'po\\.st|bc\\.vc|twitthis\\.com|u\\.to|j\\.mp|buzurl\\.com|cutt\\.us|u\\.bb|yourls\\.org|x\\.co|' +
            'prettylinkpro\\.com|scrnch\\.me|filoops\\.info|vzturl\\.com|qr\\.net|1url\\.com|tweez\\.me|v\\.gd|' +
            'tr\\.im|link\\.zip\\.net'
        );
        this.apiUrl = 'http://127.0.0.1:5000/predict';
    }

    // Feature extraction methods matching Python implementation
    havingIP(url) {
        try {
            // IPv4 pattern
            const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
            // IPv6 pattern (simplified)
            const ipv6Regex = /^([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}$/;

            const urlObj = new URL(url);
            const domain = urlObj.hostname;
            return ipv4Regex.test(domain) || ipv6Regex.test(domain) ? 1 : 0;
        } catch {
            return 0;
        }
    }

    haveAtSign(url) {
        return url.includes('@') ? 1 : 0;
    }

    getLength(url) {
        return url.length < 54 ? 0 : 1;
    }

    getDepth(url) {
        try {
            const urlObj = new URL(url);
            const path = urlObj.pathname;
            return path.split('/').filter(p => p.length > 0).length;
        } catch {
            return 0;
        }
    }

    redirection(url) {
        const pos = url.lastIndexOf('//');
        if (pos > 6) {
            return pos > 7 ? 1 : 0;
        }
        return 0;
    }

    httpDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.includes('https') ? 1 : 0;
        } catch {
            return 0;
        }
    }

    tinyURL(url) {
        return this.shorteningServices.test(url) ? 1 : 0;
    }

    prefixSuffix(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.includes('-') ? 1 : 0;
        } catch {
            return 0;
        }
    }

    async checkDNSRecord(url) {
        try {
            // Use DNS over HTTPS with Cloudflare
            const domain = new URL(url).hostname;
            const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${domain}`, {
                headers: {
                    'Accept': 'application/dns-json'
                }
            });
            const data = await response.json();
            return data.Answer && data.Answer.length > 0 ? 0 : 1;
        } catch {
            return 1;
        }
    }

    async checkWebTraffic(url) {
        try {
            const domain = new URL(url).hostname;
            // Use a more reliable method - check if site has favicon
            const response = await fetch(`${url}/favicon.ico`);
            return response.ok ? 0 : 1;
        } catch {
            return 1;
        }
    }

    async checkIframe(url) {
        try {
            const response = await fetch(url);
            const html = await response.text();
            // Check for both iframe and suspicious redirects
            return (/<iframe>|<frameBorder>/.test(html) ||
                    /window\.location|document\.location|window\.navigate|document\.navigate/.test(html)) ? 1 : 0;
        } catch {
            return 1;
        }
    }

    async extractFeatures(url) {
        // Extract features in the same order as the Python implementation
        const features = [
            this.havingIP(url),
            this.haveAtSign(url),
            this.getLength(url),
            this.getDepth(url),
            this.redirection(url),
            this.httpDomain(url),
            this.tinyURL(url),
            this.prefixSuffix(url)
        ];

        try {
            // Add DNS and web traffic features
            const [dnsRecord, webTraffic, iframe] = await Promise.all([
                this.checkDNSRecord(url),
                this.checkWebTraffic(url),
                this.checkIframe(url)
            ]);

            features.push(dnsRecord);
            features.push(webTraffic);
            features.push(iframe);
        } catch (error) {
            // If any of the async checks fail, use conservative values
            features.push(1); // DNS
            features.push(1); // Traffic
            features.push(1); // iframe
        }

        return features;
    }

    async getPredictionFromServer(features) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ features: features }),
            });

            if (!response.ok) {
                // Try to parse error response from server, otherwise use status text
                let errorDetail = response.statusText;
                try {
                    const errorData = await response.json();
                    // Use a more generic error field if 'error' or 'detail' is not present
                    errorDetail = errorData.error || errorData.detail || JSON.stringify(errorData) || errorDetail;
                } catch (e) {
                    // Ignore if response is not JSON or empty, errorDetail remains response.statusText
                }
                console.error('Error from prediction server:', response.status, errorDetail);
                throw new Error(`Server error: ${response.status} - ${errorDetail}`);
            }

            const data = await response.json();
            // data is expected to be like {"is_phishing": 0} or {"is_phishing": 1}
            return data;
        } catch (error) {
            console.error('Network or fetch error:', error);
            // Return a structure that indicates an error for the caller to handle
            return { error: error.message || 'Network error or failed to fetch prediction' };
        }
    }

    async predict(url) {
        try {
            console.log('Extracting features for:', url);
            const features = await this.extractFeatures(url);
            console.log('Extracted features:', features);

            // Call the API to get prediction
            const predictionResult = await this.getPredictionFromServer(features);

            if (predictionResult.error) {
                // Propagate error information
                return {
                    is_phishing: false, // Default to false in case of error
                    features: features,
                    score: 0,
                    confidence: 0,
                    error: predictionResult.error
                };
            }

            const isPhishing = predictionResult.is_phishing === 1;

            const result = {
                is_phishing: isPhishing,
                features: features,
                score: isPhishing ? 1 : 0,
                confidence: 1 // Placeholder: indicates prediction was made
            };
            console.log('Final result from API:', result);
            return result;
        } catch (error) {
            // This catch block handles errors from extractFeatures or other unexpected errors in this function
            console.error('Error in predict method:', error);
            return {
                is_phishing: false,
                features: (typeof features !== 'undefined') ? features : [], // Send features if available
                score: 0,
                confidence: 0,
                error: error.message || 'Failed to analyze URL'
            };
        }
    }
}
