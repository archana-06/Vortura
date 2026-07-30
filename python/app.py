import base64
import os
from pathlib import Path

import cv2
import numpy as np
import requests
# pyrefly: ignore [missing-import]
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent

DETECTION_MODEL = (
    BASE_DIR
    / "models"
    / "face_detection_yunet_2023mar.onnx"
)

RECOGNITION_MODEL = (
    BASE_DIR
    / "models"
    / "face_recognition_sface_2021dec.onnx"
)

BACKEND_URL = "http://localhost:8000"

if not DETECTION_MODEL.exists():
    raise FileNotFoundError(
        f"Detection model missing: {DETECTION_MODEL}"
    )

if not RECOGNITION_MODEL.exists():
    raise FileNotFoundError(
        f"Recognition model missing: {RECOGNITION_MODEL}"
    )

detector = cv2.FaceDetectorYN.create(
    str(DETECTION_MODEL),
    "",
    (320, 320),
    score_threshold=0.75,
    nms_threshold=0.3,
    top_k=5000,
)

recognizer = cv2.FaceRecognizerSF.create(
    str(RECOGNITION_MODEL),
    "",
)

# OpenCV documentation reference threshold is 0.363.
# A stricter threshold of 0.58 helps avoid false matches.
MATCH_THRESHOLD = 0.58


def decode_base64_image(data_url):
    if not data_url:
        return None

    try:
        encoded = (
            data_url.split(",", 1)[1]
            if "," in data_url
            else data_url
        )

        image_bytes = base64.b64decode(encoded)

        image_array = np.frombuffer(
            image_bytes,
            dtype=np.uint8,
        )

        return cv2.imdecode(
            image_array,
            cv2.IMREAD_COLOR,
        )

    except Exception as error:
        print("Base64 decode error:", error)
        return None


def detect_single_face(image):
    if image is None or image.size == 0:
        return None

    # Correct phone-image orientation when possible
    image = np.ascontiguousarray(image)

    height, width = image.shape[:2]

    # Upscale small dataset images
    if width < 640:
        scale = 640 / width
        image = cv2.resize(
            image,
            (
                int(width * scale),
                int(height * scale),
            ),
            interpolation=cv2.INTER_CUBIC,
        )

        height, width = image.shape[:2]

    detector.setInputSize((width, height))

    _, faces = detector.detect(image)

    if faces is None or len(faces) == 0:
        # Retry with improved lighting
        enhanced = cv2.convertScaleAbs(
            image,
            alpha=1.2,
            beta=15,
        )

        detector.setInputSize(
            (enhanced.shape[1], enhanced.shape[0])
        )

        _, faces = detector.detect(enhanced)

        if faces is None or len(faces) == 0:
            return None

        image[:] = enhanced

    # Select largest detected face
    face = max(
        faces,
        key=lambda detected: detected[2] * detected[3],
    )

    return face


def extract_sface_embedding(image):
    if image is None:
        return None

    face = detect_single_face(image)

    if face is None:
        return None

    try:
        aligned_face = recognizer.alignCrop(
            image,
            face,
        )

        embedding = recognizer.feature(
            aligned_face
        )

        if embedding is None:
            return None

        return embedding.copy()

    except cv2.error as error:
        print("SFace extraction error:", error)
        return None


def download_registered_images(voter_id):
    response = requests.get(
        f"{BACKEND_URL}/api/face-images/voter/{voter_id}",
        timeout=15,
    )

    if response.status_code != 200:
        raise RuntimeError(
            f"Unable to retrieve dataset for {voter_id}"
        )

    voter_data = response.json()

    image_urls = voter_data.get("images", [])

    stored_images = []

    for image_url in image_urls:
        image_response = requests.get(
            image_url,
            timeout=15,
        )

        if image_response.status_code != 200:
            continue

        image_array = np.frombuffer(
            image_response.content,
            dtype=np.uint8,
        )

        image = cv2.imdecode(
            image_array,
            cv2.IMREAD_COLOR,
        )

        if image is not None:
            stored_images.append(image)

    return voter_data, stored_images


def calculate_confidence(cosine_score):
    # Convert accepted similarity range into a readable percentage.
    confidence = (
        cosine_score * 100.0
    )

    return round(
        max(0.0, min(100.0, confidence)),
        1,
    )


@app.get("/health")
def health():
    return jsonify({
        "success": True,
        "message": "SFace recognition service running",
    })


@app.post("/recognize-voter")
def recognize_voter():
    try:
        payload = request.get_json(silent=True) or {}

        voter_id = str(
            payload.get("voterId", "")
        ).strip().upper()

        live_image_data = payload.get("image", "")

        if not voter_id:
            return jsonify({
                "success": False,
                "isMatch": False,
                "livenessPassed": False,
                "message": "Voter ID is required.",
            }), 400

        live_image = decode_base64_image(
            live_image_data
        )

        if live_image is None:
            return jsonify({
                "success": False,
                "isMatch": False,
                "livenessPassed": False,
                "message": "Invalid live-camera image.",
            }), 400

        try:
            live_embedding = extract_sface_embedding(
                live_image
            )
        except ValueError as error:
            return jsonify({
                "success": False,
                "isMatch": False,
                "livenessPassed": False,
                "message": str(error),
            }), 400

        if live_embedding is None:
            return jsonify({
                "success": False,
                "isMatch": False,
                "livenessPassed": False,
                "message": (
                    "No clear face detected. "
                    "Look directly at the camera."
                ),
            }), 400

        voter_data, registered_images = (
            download_registered_images(voter_id)
        )

        if not registered_images:
            return jsonify({
                "success": False,
                "isMatch": False,
                "livenessPassed": False,
                "message": (
                    f"No registered face images found "
                    f"for {voter_id}."
                ),
            }), 404

        similarity_scores = []

        for index, stored_image in enumerate(
            registered_images,
            start=1,
        ):
            try:
                stored_embedding = extract_sface_embedding(
                    stored_image
                )
            except ValueError as error:
                print(
                    f"Dataset image {index} skipped:",
                    error,
                )
                continue

            if stored_embedding is None:
                print(
                    f"No face extracted from dataset image {index} "
                    f"for voter {voter_id}"
                )
                continue

            cosine_score = recognizer.match(
                live_embedding,
                stored_embedding,
                cv2.FaceRecognizerSF_FR_COSINE,
            )

            similarity_scores.append(
                float(cosine_score)
            )

        if not similarity_scores:
            return jsonify({
                "success": False,
                "isMatch": False,
                "livenessPassed": False,
                "message": (
                    "Faces could not be extracted "
                    "from the registered dataset."
                ),
            }), 400

        similarity_scores.sort(reverse=True)

        best_score = similarity_scores[0]

        top_scores = similarity_scores[
            : min(3, len(similarity_scores))
        ]

        average_top_score = float(
            np.mean(top_scores)
        )

        supporting_matches = sum(
            score >= MATCH_THRESHOLD
            for score in similarity_scores
        )

        required_matches = (
            3
            if len(similarity_scores) >= 5
            else 2
        )

        is_match = (
            best_score >= 0.62
            and average_top_score >= 0.58
            and supporting_matches >= required_matches
        )

        confidence = calculate_confidence(
            average_top_score
        )

        full_name = voter_data.get(
            "fullName",
            f"Voter {voter_id}",
        )

        print({
            "voterId": voter_id,
            "scores": [
                round(score, 4)
                for score in similarity_scores
            ],
            "bestScore": round(best_score, 4),
            "averageTopScore": round(average_top_score, 4),
            "supportingMatches": supporting_matches,
            "requiredMatches": required_matches,
            "isMatch": is_match,
        })

        return jsonify({
            "success": True,
            "isMatch": bool(is_match),
            "livenessPassed": False,
            "voterId": voter_id,
            "fullName": full_name,
            "confidence": confidence,
            "cosineScore": round(best_score, 4),
            "averageScore": round(average_top_score, 4),
            "matchedImages": supporting_matches,
            "totalImagesChecked": len(
                similarity_scores
            ),
            "message": (
                "Registered voter face matched."
                if is_match
                else (
                    "Live face does not match the "
                    "registered voter dataset."
                )
            ),
        })

    except requests.RequestException as error:
        print("Dataset download error:", error)

        return jsonify({
            "success": False,
            "isMatch": False,
            "livenessPassed": False,
            "message": (
                "Unable to retrieve registered "
                "images from the backend."
            ),
        }), 503

    except Exception as error:
        print(
            "Python recognition error:",
            str(error),
        )

        return jsonify({
            "success": False,
            "isMatch": False,
            "livenessPassed": False,
            "message": f"Server error: {error}",
        }), 500


if __name__ == "__main__":
    print(
        "SFace recognition service running "
        "at http://localhost:5001"
    )

    app.run(
        host="0.0.0.0",
        port=5001,
        debug=False,
    )
