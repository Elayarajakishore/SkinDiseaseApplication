from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
from flask_cors import CORS
from PIL import Image as PilImage
import os

app = Flask(__name__)
CORS(app)

# Load trained DenseNet model
MODEL_PATH = r"D:\Skin Disease Ui\backend\densenet121_model.h5"
model = tf.keras.models.load_model(MODEL_PATH)

UPLOAD_FOLDER = "uploads"

# uploads folder create
if os.path.exists(UPLOAD_FOLDER) and not os.path.isdir(UPLOAD_FOLDER):
    os.remove(UPLOAD_FOLDER)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

IMG_SIZE = 224


# ----------- Check image looks like skin -----------
def looks_like_skin_image(img_path, min_fraction=0.15):

    try:
        img = PilImage.open(img_path).convert("RGB")

        img.thumbnail((256,256))

        arr = np.asarray(img, dtype=np.float32) / 255.0

        if arr.size == 0:
            return False, 0.0

        r = arr[:,:,0]
        g = arr[:,:,1]
        b = arr[:,:,2]

        skin_mask = (
            (r > 0.35) &
            (r < 1.0) &
            (g > 0.2) &
            (g < 0.9) &
            (b > 0.15) &
            (b < 0.9) &
            (r > g) &
            (r > b)
        )

        skin_fraction = float(skin_mask.mean())

        red_mask = (r > 0.5) & (r > g + 0.05) & (r > b + 0.05)

        red_fraction = float(red_mask.mean())

        is_skin_like = skin_fraction >= min_fraction and red_fraction >= 0.01

        return is_skin_like, skin_fraction

    except:
        return False, 0.0


# ----------- Prediction Function -----------

def predict_image(img_path):

    img = image.load_img(img_path, target_size=(224,224))

    img_array = image.img_to_array(img) / 255.0

    img_array = np.expand_dims(img_array, axis=0)

    pred = model.predict(img_array)[0][0]

    if pred < 0.4:

        disease = "MEASLES"
        confidence = (1 - pred) * 100

    elif pred > 0.6:

        disease = "RUBELLA"
        confidence = pred * 100

    else:

        disease = "UNCERTAIN (Needs Doctor Review)"
        confidence = 50 + abs(pred - 0.5) * 100

    return disease, confidence


# ----------- API Route -----------

@app.route("/predict", methods=["POST"])

def predict():

    file = request.files["file"]

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)

    file.save(filepath)

    # check skin image
    is_skin, skin_fraction = looks_like_skin_image(filepath)

    if not is_skin:

        os.remove(filepath)

        return jsonify({
            "disease": "UNKNOWN_IMAGE",
            "confidence": 0.0,
            "note": "Upload clear skin disease image"
        })

    disease, confidence = predict_image(filepath)

    os.remove(filepath)

    return jsonify({
        "disease": str(disease),
        "confidence": float(round(confidence,2)),
        "skin_fraction": float(round(skin_fraction,4))
    })


# ----------- Run Server -----------

if __name__ == "__main__":
    app.run(debug=True)