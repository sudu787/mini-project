import json
import os
from flask import Flask, request, jsonify
import numpy as np

app = Flask(__name__)

# Global variable to store the loaded model
MODEL = None
MODEL_PATH = 'model/phishing_model.json'

def load_model(model_path):
    """Loads the Random Forest model from a JSON file."""
    global MODEL
    try:
        if not os.path.exists(model_path):
            print(f"Error: Model file not found at {model_path}")
            MODEL = None
            return False
        with open(model_path, 'r') as f:
            model_data = json.load(f)

        actual_trees = []
        if isinstance(model_data, list): # Handles direct list of trees (original expectation)
            actual_trees = model_data
            print("Model loaded as a direct list of trees.")
        elif isinstance(model_data, dict) and 'trees' in model_data and isinstance(model_data['trees'], list):
            # Handles dict with 'trees' key (current train_model.py output)
            actual_trees = model_data['trees']
            print(f"Model loaded from dictionary, extracted {len(actual_trees)} trees from 'trees' key.")
            # Optionally, store other metadata if needed, e.g., feature_names
            # if 'feature_names' in model_data:
            #     app.config['FEATURE_NAMES'] = model_data['feature_names']
        else:
            print("Error: Model JSON is not in an expected format (direct list of trees or dict with 'trees' key).")
            MODEL = None
            return False

        if not actual_trees: # Check if actual_trees list is empty
            print("Error: No trees found in the model data.")
            MODEL = None
            return False

        if not all(isinstance(tree, dict) for tree in actual_trees):
            print("Error: One or more items in the trees list are not dictionaries.")
            MODEL = None
            return False

        # Further validation can be added here to check for required keys in each tree dict
        for i, tree in enumerate(actual_trees):
            required_keys = ['children_left', 'children_right', 'feature', 'threshold', 'value']
            if not all(key in tree for key in required_keys):
                print(f"Error: Tree {i} in model JSON is missing one or more required keys ({required_keys}).")
                MODEL = None
                return False

        MODEL = actual_trees
        print(f"Model loaded successfully from {model_path}")
        return True
    except FileNotFoundError:
        print(f"Error: Model file not found at {model_path}")
        MODEL = None
        return False
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from model file at {model_path}")
        MODEL = None
        return False
    except Exception as e:
        print(f"An unexpected error occurred while loading the model: {e}")
        MODEL = None
        return False

def predict_single_tree(tree_model, features):
    """Makes a prediction using a single decision tree."""
    node_index = 0
    # Loop until we reach a leaf node
    # A leaf node is where children_left[node_index] == children_right[node_index] (or typically -1 in scikit-learn)
    while tree_model['children_left'][node_index] != tree_model['children_right'][node_index]:
        feature_index = tree_model['feature'][node_index]
        threshold = tree_model['threshold'][node_index]

        if feature_index == -2: # Should not happen if tree is well-formed before splitting
             break # Leaf node or undefined node

        if features[feature_index] <= threshold:
            node_index = tree_model['children_left'][node_index]
        else:
            node_index = tree_model['children_right'][node_index]

    # At a leaf node, 'value' contains the class distribution (e.g., counts or probabilities)
    # For scikit-learn RandomForestClassifier, value is typically like [[n_samples_class_0, n_samples_class_1, ...]]
    leaf_value = tree_model['value'][node_index]

    # We predict the class with the highest count/probability at the leaf
    # If leaf_value is like [[7.0, 3.0]], np.argmax would return 0.
    # If it's just [7.0, 3.0], it still works.
    # Ensure leaf_value is a list/array that np.argmax can process.
    if isinstance(leaf_value, list) and len(leaf_value) > 0:
        if isinstance(leaf_value[0], list): # Handles [[c0, c1, ...]]
             return np.argmax(leaf_value[0])
        else: # Handles [c0, c1, ...]
             return np.argmax(leaf_value)
    else: # Fallback or error
        print(f"Warning: Unexpected leaf value format: {leaf_value}")
        return 0 # Default prediction in case of unexpected format

def predict_random_forest(forest_model, features):
    """Makes a prediction using the loaded Random Forest model."""
    if forest_model is None:
        return None # Model not loaded

    predictions = []
    for tree_model in forest_model:
        predictions.append(predict_single_tree(tree_model, features))

    # Majority vote for classification
    if not predictions:
        return None # Should not happen if model is loaded

    return np.bincount(predictions).argmax()


@app.route('/predict', methods=['POST'])
def predict():
    if MODEL is None:
        return jsonify({"error": "Model not loaded. Please check server logs."}), 500

    try:
        data = request.get_json()
        if 'features' not in data or not isinstance(data['features'], list):
            return jsonify({"error": "Invalid input: 'features' key missing or not a list."}), 400

        features = data['features']

        # Basic validation for feature length, assuming the model expects a certain number.
        # This length can be inferred from the max feature index in trees if needed,
        # but for now, let's assume the client sends correctly sized feature vectors.
        # For example, if train_model.py uses 30 features:
        # if len(features) != 30:
        #     return jsonify({"error": f"Invalid input: Expected 30 features, got {len(features)}."}), 400

        prediction = predict_random_forest(MODEL, features)

        if prediction is None:
            return jsonify({"error": "Prediction failed due to model error."}), 500

        return jsonify({"is_phishing": int(prediction)})

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({"error": f"An internal error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    if load_model(MODEL_PATH):
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        print("Failed to load model. Flask app will not start.")
