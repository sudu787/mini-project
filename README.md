# Phishing Detector Chrome Extension (Client-Server Architecture)

This Chrome extension helps detect phishing websites. It uses a machine learning model served by a Python Flask backend, with the extension acting as a client.

## Overall Architecture

The system is composed of three main parts:
1.  **Model Training Script (`train_model.py`):** A Python script to train the Random Forest classification model using a provided dataset.
2.  **Prediction Server (`app.py`):** A Python Flask application that loads the trained model and exposes an API endpoint for predictions.
3.  **Browser Extension (`phishing_detector.js` and other extension files):** The Chrome extension that extracts features from the currently viewed URL and sends these features to the prediction server to get a phishing likelihood score.

## Prerequisites

To run this project, you'll need:

*   **Python 3.x**
*   **Python Libraries:**
    *   `pandas` (for data manipulation in `train_model.py`)
    *   `scikit-learn` (for model training in `train_model.py`)
    *   `numpy` (for numerical operations in `app.py`)
    *   `Flask` (for the prediction server in `app.py`)
    You can typically install these using pip:
    ```bash
    pip install pandas scikit-learn numpy Flask
    ```
    (A `requirements.txt` file would be ideal for managing these dependencies).
*   **Google Chrome Browser:** To install and run the extension.
*   **Dataset:** `phishing_dataset.csv` for training (see details below).

## Components

### 1. `train_model.py` (Model Training)

*   **Purpose:** This script trains a Random Forest classifier to distinguish between phishing and legitimate websites.
*   **Prerequisites for running:**
    *   A CSV file named `phishing_dataset.csv` must be present in the root directory.
    *   The dataset must have features as columns and the last column named 'Result' as the target variable (1 for phishing, 0 for legitimate).
    *   The expected features are (ensure your `phishing_dataset.csv` has these columns in this order, followed by 'Result'):
        *   `having_IP_Address`
        *   `URL_Length`
        *   `Shortining_Service`
        *   `having_At_Symbol`
        *   `double_slash_redirecting`
        *   `Prefix_Suffix`
        *   `having_Sub_Domain`
        *   `SSLfinal_State`
        *   `Domain_registeration_length`
        *   `Favicon`
        *   `port`
        *   `HTTPS_token`
        *   `Request_URL`
        *   `URL_of_Anchor`
        *   `Links_in_tags`
        *   `SFH`
        *   `Submitting_to_email`
        *   `Abnormal_URL`
        *   `Redirect`
        *   `on_mouseover`
        *   `RightClick`
        *   `popUpWidnow`
        *   `Iframe`
        *   `age_of_domain`
        *   `DNSRecord`
        *   `web_traffic`
        *   `Page_Rank`
        *   `Google_Index`
        *   `Links_pointing_to_page`
        *   `Statistical_report`
*   **How to run:**
    ```bash
    python train_model.py
    ```
*   **Output:**
    *   `model/phishing_model.json`: The trained model, serialized as JSON. The `model` directory is created if it doesn't exist.
    *   Accuracy score printed to the console.

### 2. `app.py` (Prediction Server)

*   **Purpose:** This Flask application loads the `model/phishing_model.json` and serves predictions over an HTTP API.
*   **How to run:**
    ```bash
    python app.py
    ```
    The server will start, typically on `http://127.0.0.1:5000/`.
*   **API Endpoint:**
    *   **Route:** `/predict`
    *   **Method:** `POST`
    *   **Request Body (JSON):** Expects a JSON object with a single key "features", which is a list of numerical feature values.
        ```json
        {
            "features": [0, 1, 0, 1, ..., 0]
        }
        ```
    *   **Response Body (JSON):** Returns a JSON object indicating if the site is phishing.
        ```json
        {"is_phishing": 1} // 1 for phishing, 0 for legitimate
        ```
        Or an error message if something goes wrong:
        ```json
        {"error": "Descriptive error message"}
        ```

### 3. `phishing_detector.js` (Browser Extension Client)

*   **Purpose:** This script runs as part of the Chrome extension. It extracts features from the current URL being viewed by the user.
*   **Functionality:**
    *   Extracts a list of feature values from the current web page's URL and content.
    *   Sends these features as a JSON payload to the `app.py` server's `/predict` endpoint.
    *   Receives the prediction (`0` or `1`) from the server.
    *   (Logic for updating the extension's UI based on the prediction is handled by other parts of the extension, e.g., `popup.js` or `content.js`).

## Workflow / How to Use

1.  **Train the Model:**
    *   Ensure `phishing_dataset.csv` is correctly formatted and in the project's root directory.
    *   Run `python train_model.py`. This will generate/update `model/phishing_model.json`.
2.  **Start the Prediction Server:**
    *   Run `python app.py`. Keep this terminal window open.
3.  **Load the Browser Extension:**
    *   Open Chrome and navigate to `chrome://extensions/`.
    *   Enable "Developer mode".
    *   Click "Load unpacked" and select the directory containing the extension files (including `manifest.json`).
    *   Once loaded, the extension will make API calls to the running `app.py` server when you visit web pages.

## Important Note on Feature Consistency

**CRITICAL:** The success of this phishing detector heavily relies on the consistency of features between the training phase and the prediction phase.

*   The features extracted by `phishing_detector.js` (and sent to `app.py`) **MUST** be in the exact same order and have the same meaning/calculation as the columns in the `phishing_dataset.csv` used by `train_model.py` (when the 'Result' label column is excluded).
*   Any mismatch in the number of features, their order, or how they are derived will lead to incorrect and unreliable predictions.
*   The list of features in the `train_model.py` section above defines this expected order.

## Extension Installation and Usage

(This section may need further details specific to how the UI shows warnings, etc., which is outside the scope of the current backend changes. For now, it refers to standard extension loading.)

1.  Follow steps 1 and 2 in the "Workflow" section above (train model, start server).
2.  Load the extension in Chrome as described in step 3 of the "Workflow".
3.  When you browse websites, the extension will communicate with the local server to analyze the URL. (Further UI details on how warnings are displayed would go here).
