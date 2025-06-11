export class RandomForest {
    constructor(model) {
        this.nEstimators = model.n_estimators;
        this.featureNames = model.feature_names;
        this.trees = model.trees;
    }

    predictTree(tree, features) {
        let node = 0;
        while (node >= 0) {
            const feature = tree.feature[node];
            if (feature === -2) {  // Leaf node
                return tree.value[node];
            }
            
            const featureValue = features[feature];
            if (featureValue <= tree.threshold[node]) {
                node = tree.children_left[node];
            } else {
                node = tree.children_right[node];
            }
        }
        return null;
    }

    predict(features) {
        // The features array is already ordered since we receive it in the correct order
        // from PhishingDetector.extractFeatures()
        const predictions = this.trees.map(tree => this.predictTree(tree, features));
        
        // Average the predictions
        const sum = predictions.reduce((a, b) => {
            if (!b || !Array.isArray(b)) return a;
            return a + b[1];
        }, 0);
        return sum / this.nEstimators;
    }
} 