from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Backend service URLs
SKLEARN_SERVICE = "http://127.0.0.1:5001"
TENSORFLOW_SERVICE = "http://127.0.0.1:5002"


# -------------------------------------------------
# Health check
# -------------------------------------------------
@app.route("/")
def home():
    return jsonify({
        "message": "AI Medical Gateway Running"
    })


# -------------------------------------------------
# Fetal prediction route
# -------------------------------------------------
@app.route("/predict-fetal", methods=["POST"])
def predict_fetal():

    try:
        response = requests.post(
            f"{SKLEARN_SERVICE}/predict-fetal",
            json=request.json
        )

        return jsonify(response.json())

    except Exception as e:
        return jsonify({"error": str(e)})


# -------------------------------------------------
# Infant prediction route
# -------------------------------------------------
@app.route("/predict-infant", methods=["POST"])
def predict_infant():

    try:
        response = requests.post(
            f"{SKLEARN_SERVICE}/predict-infant",
            json=request.json
        )

        return jsonify(response.json())

    except Exception as e:
        return jsonify({"error": str(e)})


# -------------------------------------------------
# Baby cry prediction route
# -------------------------------------------------
@app.route("/predict-baby-cry", methods=["POST"])
def predict_baby_cry():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files['file']

        files = {
            "file": (file.filename, file.read(), file.content_type)
        }

        response = requests.post(
            f"{TENSORFLOW_SERVICE}/predict-baby-cry",
            files=files
        )

        return jsonify(response.json())

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    try:
        file = request.files['file']

        files = {
            'file': (file.filename, file.stream, file.mimetype)
        }

        response = requests.post(
            f"{TENSORFLOW_SERVICE}/predict-baby-cry",
            files=files
        )

        return jsonify(response.json())

    except Exception as e:
        return jsonify({"error": str(e)})


# -------------------------------------------------
# Run gateway
# -------------------------------------------------
if __name__ == "__main__":
    app.run(port=5000, debug=True)