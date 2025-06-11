import subprocess
import time
import requests # Make sure to install this: pip install requests
import json
import os

# Define the path to the Flask app
APP_PY_PATH = "app.py"
MODEL_PATH = "model/phishing_model.json" # For app.py to load

# Sample feature vector for testing (matches one from phishing_dataset.csv)
# feature1,feature2,feature3,feature4,feature5,label
# 1,0,1,0,1,1
sample_features = [1, 0, 1, 0, 1]
expected_prediction = 1 # Based on the sample data

def run_tests():
    server_process = None
    try:
        # 1. Ensure model exists (it should have been created by train_model.py)
        if not os.path.exists(MODEL_PATH):
            print(f"Error: Model file {MODEL_PATH} not found. Run train_model.py first.")
            return False

        # 2. Start the Flask server as a subprocess
        #    Make sure Flask is installed: pip install Flask
        print(f"Starting Flask server ({APP_PY_PATH})...")
        # Use python -u for unbuffered output, helpful for seeing Flask logs immediately
        server_process = subprocess.Popen(["python", "-u", APP_PY_PATH],
                                          stdout=subprocess.PIPE,
                                          stderr=subprocess.PIPE,
                                          text=True)

        # Wait a few seconds for the server to initialize
        time.sleep(5) # Increased wait time

        # Check if server started successfully (optional: check server_process.poll())
        if server_process.poll() is not None: # If process terminated
            print("Error: Flask server failed to start or terminated prematurely.")
            print("Server stdout:\n", server_process.stdout.read())
            print("Server stderr:\n", server_process.stderr.read())
            return False
        print("Flask server presumed to be running.")

        # 3. Send a POST request to the /predict endpoint
        api_url = "http://127.0.0.1:5000/predict"
        payload = {"features": sample_features}

        print(f"Sending POST request to {api_url} with payload: {payload}")
        response = requests.post(api_url, json=payload, timeout=10) # Added timeout

        # 4. Assertions
        print(f"Response Status Code: {response.status_code}")
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

        response_json = response.json()
        print(f"Response JSON: {response_json}")

        assert "is_phishing" in response_json, "Response JSON missing 'is_phishing' key"
        assert response_json["is_phishing"] == expected_prediction, \
            f"Expected prediction {expected_prediction}, got {response_json['is_phishing']}"

        print("API test successful!")
        return True

    except requests.exceptions.ConnectionError as e:
        print(f"Error: Could not connect to Flask server at {api_url}. Is it running?")
        print(f"Details: {e}")
        if server_process and server_process.poll() is not None:
             print("Server (app.py) might have crashed. Check its logs.")
             print("Server stdout:\n", server_process.stdout.read())
             print("Server stderr:\n", server_process.stderr.read())
        return False
    except Exception as e:
        print(f"An error occurred during testing: {e}")
        if server_process and server_process.poll() is not None:
             print("Server (app.py) might have crashed during the test. Check its logs.")
             print("Server stdout:\n", server_process.stdout.read())
             print("Server stderr:\n", server_process.stderr.read())
        return False
    finally:
        # 5. Terminate the Flask server
        if server_process and server_process.poll() is None: # if process is still running
            print("Terminating Flask server...")
            server_process.terminate()
            try:
                server_process.wait(timeout=5) # Wait for graceful termination
            except subprocess.TimeoutExpired:
                print("Server did not terminate gracefully, killing.")
                server_process.kill()
            print("Flask server terminated.")

if __name__ == "__main__":
    if run_tests():
        print("All tests passed.")
    else:
        print("Some tests failed.")
