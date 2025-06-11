import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import json

# Load your phishing dataset
# Replace this with your actual dataset path
# The dataset should have features in the same order as our feature extraction
# and a 'label' column with 1 for phishing and 0 for legitimate
data = pd.read_csv('phishing_dataset.csv')

# Separate features and target
X = data.drop('label', axis=1)
y = data['label']

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train Random Forest model
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
rf_model.fit(X_train, y_train)

# Evaluate the model
train_score = rf_model.score(X_train, y_train)
test_score = rf_model.score(X_test, y_test)

print(f"Training accuracy: {train_score:.4f}")
print(f"Testing accuracy: {test_score:.4f}")

# Export the model as JSON
def tree_to_json(tree, feature_names):
    tree_dict = {
        'n_nodes': tree.node_count,
        'children_left': tree.children_left.tolist(),
        'children_right': tree.children_right.tolist(),
        'feature': tree.feature.tolist(),
        'threshold': tree.threshold.tolist(),
        'value': [v[0].tolist() for v in tree.value]
    }
    return tree_dict

# Convert the entire forest to JSON
forest_dict = {
    'n_estimators': len(rf_model.estimators_),
    'feature_names': X.columns.tolist(),
    'trees': [tree_to_json(tree.tree_, X.columns) for tree in rf_model.estimators_]
}

# Save the model as JSON
with open('model/phishing_model.json', 'w') as f:
    json.dump(forest_dict, f) 