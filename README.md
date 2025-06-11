# Phishing Detector Chrome Extension

This Chrome extension helps detect phishing websites using a machine learning model.

## Model Training

This section describes the process of training the machine learning model used by the extension.

### Purpose of `train_model.py`

The `train_model.py` script is responsible for training the phishing detection model. It takes a dataset of website features, trains a RandomForestClassifier, and saves the trained model to a file.

### Prerequisites

Before running the `train_model.py` script, ensure you have the following:

1.  **Python Environment:** Python 3.x installed with the following libraries:
    *   `pandas`
    *   `scikit-learn`
2.  **Dataset:** A CSV file named `phishing_dataset.csv` must be present in the same directory as the `train_model.py` script. The dataset should have the following characteristics:
    *   It must be a comma-separated values (CSV) file.
    *   The last column of the CSV should be the target variable, named 'Result', where `1` indicates a phishing website and `0` indicates a legitimate website.
    *   The preceding columns are the features used for training. The script currently expects the following features (ensure your `phishing_dataset.csv` has these columns):
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
        *   `Result` (Target Variable)

### Steps to Run the Script

1.  **Prepare the dataset:** Ensure `phishing_dataset.csv` is correctly formatted and placed in the root directory.
2.  **Navigate to the script directory:** Open your terminal or command prompt and change the directory to where `train_model.py` is located.
3.  **Run the script:** Execute the following command:
    ```bash
    python train_model.py
    ```

### Output

After successful execution, the `train_model.py` script will produce the following output:

*   **`model/phishing_model.json`**: This file contains the trained machine learning model, serialized in JSON format. The `model` directory will be created if it doesn't already exist. This file is then used by the Chrome extension to make predictions.
*   **Accuracy Score**: The script will also print the accuracy of the trained model on the test set to the console.

## Extension Installation and Usage

(To be added: Instructions on how to load and use the Chrome extension)

## Model Usage in the Extension

The trained phishing detection model, saved as `model/phishing_model.json`, is a crucial component of the Chrome extension. This section explains how the extension utilizes this model.

The `phishing_detector.js` script is responsible for loading and using the trained model to classify URLs in real-time.

1.  **Model Loading**:
    *   When the extension initializes, the `PhishingDetector` class in `phishing_detector.js` automatically loads the model.
    *   The `loadModel` method within this class fetches the `model/phishing_model.json` file. This is done using `chrome.runtime.getURL('model/phishing_model.json')` to get the correct path to the model file within the extension's context.
    *   The fetched JSON data, which represents the trained Random Forest model, is then parsed and used to instantiate a `RandomForest` object.

2.  **Feature Extraction and Prediction**:
    *   When a URL needs to be classified, the `phishing_detector.js` script first extracts relevant features from the URL. These feature extraction methods are designed to mirror the features used during the model training phase.
    *   The extracted features are then passed to the `predict` method of the loaded `RandomForest` model.
    *   The model outputs a prediction score, which is then used to determine if the URL is likely to be a phishing attempt.

This process allows the extension to dynamically analyze websites and warn users about potential phishing threats based on the patterns learned by the machine learning model.
