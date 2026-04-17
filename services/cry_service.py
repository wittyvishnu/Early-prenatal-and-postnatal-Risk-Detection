# ==========================================
# BABY CRY DETECTION API
# ==========================================

import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import librosa
import tensorflow as tf
import joblib

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# ===============================
# Paths
# ===============================
MODEL_PATH = "baby_cry/baby_cry_model.h5"
LABEL_PATH = "baby_cry/label_encoder.pkl"

# ===============================
# Load label encoder
# ===============================
le = joblib.load(LABEL_PATH)
print("Classes:", list(le.classes_))

# ===============================
# Rebuild Model Architecture
# ===============================
model = tf.keras.models.Sequential([

    tf.keras.layers.Conv2D(32,(3,3),activation="relu",input_shape=(128,128,1)),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.MaxPooling2D(2,2),

    tf.keras.layers.Conv2D(64,(3,3),activation="relu"),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.MaxPooling2D(2,2),

    tf.keras.layers.Conv2D(128,(3,3),activation="relu"),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.MaxPooling2D(2,2),

    tf.keras.layers.Flatten(),

    tf.keras.layers.Dense(256,activation="relu"),
    tf.keras.layers.Dropout(0.4),

    tf.keras.layers.Dense(len(le.classes_),activation="softmax")
])

# Load weights
model.load_weights(MODEL_PATH)

print("Model loaded successfully")

# ===============================
# Audio preprocessing
# ===============================
def preprocess_audio(file_path):

    audio, sr = librosa.load(file_path, duration=5)

    mel = librosa.feature.melspectrogram(
        y=audio,
        sr=sr,
        n_mels=128
    )

    mel_db = librosa.power_to_db(mel, ref=np.max)

    if mel_db.shape[1] >= 128:
        mel_db = mel_db[:128, :128]
    else:
        pad = 128 - mel_db.shape[1]
        mel_db = np.pad(mel_db, ((0,0),(0,pad)))

    mel_db = mel_db[..., np.newaxis]
    mel_db = np.expand_dims(mel_db, axis=0)

    return mel_db


# ===============================
# Prediction API
# ===============================
@app.route("/predict-baby-cry", methods=["POST"])
def predict():

    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    file = request.files["audio"]

    temp_path = "temp_audio.wav"
    file.save(temp_path)

    features = preprocess_audio(temp_path)

    prediction = model.predict(features)

    index = np.argmax(prediction)

    label = le.inverse_transform([index])[0]

    confidence = float(np.max(prediction))

    os.remove(temp_path)

    return jsonify({
        "prediction": label,
        "confidence": confidence
    })


# ===============================
# Run Server
# ===============================
if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5002,
        debug=True
    )