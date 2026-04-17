from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# --------------------------------------------------
# Load fetal model
# --------------------------------------------------
try:
    fetal_model = joblib.load("fetal/fetal_no_accel_model.pkl")
    fetal_scaler = joblib.load("fetal/fetal_no_accel_scaler.pkl") # <-- ADDED THIS
    print("✅ Fetal model and scaler loaded")
except Exception as e:
    fetal_model = None
    fetal_scaler = None
    print("❌ Failed to load fetal model/scaler:", e)

# --------------------------------------------------
# Load infant model
# --------------------------------------------------
try:
    infant_artifacts = joblib.load("infant/infant_model_deployment.pkl")
    infant_model = infant_artifacts["model"]
    infant_encoders = infant_artifacts["encoders"]
    infant_ordinal_maps = infant_artifacts["ordinal_maps"]
    infant_feature_order = infant_artifacts["feature_order"]
    print("✅ Infant model and all artifacts loaded successfully")
except Exception as e:
    infant_model = None
    print("❌ Failed to load infant model artifacts:", e)


# --------------------------------------------------
# Health Check Route
# --------------------------------------------------
@app.route("/")
def home():
    return jsonify({
        "service": "Sklearn Prediction API",
        "fetal_model_loaded": fetal_model is not None,
        "infant_model_loaded": infant_model is not None
    })


# --------------------------------------------------
# Fetal Prediction
# --------------------------------------------------
@app.route("/predict-fetal", methods=["POST"])
def predict_fetal():
    # Check if both loaded correctly
    if fetal_model is None or fetal_scaler is None:
        return jsonify({"error": "Fetal model or scaler not loaded"}), 500

    try:
        data = request.json
        features = data["features"]

        # Reshape to a 2D array for the model
        features_array = np.array(features).reshape(1, -1)

        # 2. SCALE THE DATA (THIS FIXES YOUR BUG)
        scaled_features = fetal_scaler.transform(features_array)

        # 3. PREDICT USING THE SCALED DATA
        prediction = fetal_model.predict(scaled_features)[0]

        labels = {
            1: "NORMAL",
            2: "SUSPECT",
            3: "PATHOLOGICAL"
        }

        return jsonify({
            "prediction": int(prediction),
            "status": labels[int(prediction)]
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        })
# --------------------------------------------------
# Infant Prediction
# --------------------------------------------------
# Helper function for binary yes/no strings
def yn(s):
    return (s.astype(str).str.lower() == 'yes').astype(int)

@app.route("/predict-infant", methods=["POST"])
def predict_infant():
    if infant_model is None:
        return jsonify({"error": "Infant model not loaded"}), 500

    try:
        # 1. Receive raw JSON dictionary (NOT an array of numbers)
        raw_data = request.json
        
        # 2. Convert the single JSON object into a Pandas DataFrame
        df_inf = pd.DataFrame([raw_data])

        # 3. Apply Ordinal Maps
        df_inf['RUQO2_n']    = df_inf['RUQO2'].map(infant_ordinal_maps['RUQO2'])
        df_inf['LBO2_n']     = df_inf['LowerBodyO2'].map(infant_ordinal_maps['LowerBodyO2'])
        df_inf['Age_n']      = df_inf['Age'].map(infant_ordinal_maps['Age'])
        df_inf['HypO2_n']    = df_inf['HypoxiaInO2'].map(infant_ordinal_maps['HypoxiaInO2'])
        df_inf['CO2_n']      = df_inf['CO2'].map(infant_ordinal_maps['CO2'])
        df_inf['LF_n']       = df_inf['LungFlow'].map(infant_ordinal_maps['LungFlow'])
        df_inf['LP_n']       = df_inf['LungParench'].map(infant_ordinal_maps['LungParench'])
        df_inf['CM_n']       = df_inf['CardiacMixing'].fillna('None').map(infant_ordinal_maps['CardiacMixing'])
        df_inf['DF_n']       = df_inf['DuctFlow'].fillna('None').map(infant_ordinal_maps['DuctFlow'])
        df_inf['Chest_n']    = df_inf['ChestXray'].map(infant_ordinal_maps['ChestXray'])
        df_inf['Xray_n']     = df_inf['XrayReport'].map(infant_ordinal_maps['XrayReport'])
        df_inf['HypDist_n']  = (df_inf['HypDistrib'] == 'Unequal').astype(int)
        df_inf['CO2Rpt_n']   = (df_inf['CO2Report'] == '>=7.5').astype(int)

        # 4. Apply Binary Flags
        df_inf['BA']      = yn(df_inf['BirthAsphyxia'])
        df_inf['Grunt']   = yn(df_inf['Grunting'])
        df_inf['GrRpt']   = yn(df_inf['GruntingReport'])
        df_inf['LVHr']    = yn(df_inf['LVHreport'])
        df_inf['LVH_n']   = yn(df_inf['LVH'])
        df_inf['Sick_n']  = yn(df_inf['Sick'])

        # 5. Feature Engineering (Interactions)
        df_inf['O2_diff']     = df_inf['RUQO2_n'] - df_inf['LBO2_n']
        df_inf['O2_sum']      = df_inf['RUQO2_n'] + df_inf['LBO2_n']
        df_inf['O2_ratio']    = df_inf['RUQO2_n'] / (df_inf['LBO2_n'] + 0.1)
        df_inf['Risk']        = df_inf['BA'] + df_inf['Grunt'] + df_inf['LVHr'] + df_inf['Sick_n'] + df_inf['HypO2_n']
        df_inf['Lung_combo']  = df_inf['LP_n'] * 10 + df_inf['LF_n']
        df_inf['Card_combo']  = df_inf['CM_n'] * 10 + df_inf['DF_n']
        df_inf['HypO2_x_CM']  = df_inf['HypO2_n'] * df_inf['CM_n']
        df_inf['O2_x_CM']     = df_inf['RUQO2_n'] * df_inf['CM_n']
        df_inf['LF_x_DF']     = df_inf['LF_n'] * df_inf['DF_n']

        # 6. Label Encode Raw Categoricals
        CAT_RAW = [
            'BirthAsphyxia', 'HypDistrib', 'HypoxiaInO2', 'CO2', 'ChestXray',
            'Grunting', 'GruntingReport', 'LVHreport', 'CO2Report', 'XrayReport',
            'LVH', 'LungParench', 'LungFlow', 'CardiacMixing', 'DuctFlow',
            'RUQO2', 'LowerBodyO2', 'Sick', 'Age'
        ]
        for col in CAT_RAW:
            le = infant_encoders[col]
            val = df_inf[col].fillna('None').astype(str)
            
            try:
                df_inf[col + '_le'] = le.transform(val)
            except ValueError:
                # If an unseen label is passed, tell the frontend exactly what went wrong
                valid_options = list(le.classes_)
                return jsonify({
                    "error": "Invalid input data",
                    "details": f"The value '{val.iloc[0]}' is not valid for field '{col}'.",
                    "valid_options": valid_options
                }), 400

        # 7. Reorder columns to exactly match training data
        X_final = df_inf[infant_feature_order].fillna(-1)

        # 8. Predict!
        prediction = infant_model.predict(X_final)[0]
        
        # 9. Get Probabilities!
        probabilities = infant_model.predict_proba(X_final)[0]
        
        # 10. Map probabilities to their disease names
        class_names = infant_artifacts["classes"]
        prob_dict = {}
        for i in range(len(class_names)):
            # Convert to a standard float and multiply by 100 for a clean percentage
            prob_dict[class_names[i]] = round(float(probabilities[i]) * 100, 2)

        return jsonify({
            "prediction": str(prediction),
            "probabilities_percent": prob_dict
        })

    except Exception as e:
        import traceback
        return jsonify({
            "error": str(e),
            "traceback": traceback.format_exc()
        })

    except Exception as e:
        import traceback
        return jsonify({
            "error": str(e),
            "traceback": traceback.format_exc()
        })
# --------------------------------------------------
# Run Flask Server
# --------------------------------------------------
if __name__ == "__main__":
    app.run(port=5001, debug=True)