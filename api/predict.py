import json
import os
import base64
from http.server import BaseHTTPRequestHandler
import numpy as np

# Lazy imports for cold-start performance
cv2 = None
tflite = None

INTERPRETER = None
INPUT_DETAILS = None
OUTPUT_DETAILS = None
FACE_CASCADE = None

# Match exact ordering from original app.py:
# ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']
EMOTIONS = ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"]


def init_libraries():
    """Lazily import OpenCV and TFLite runtime to optimize cold starts."""
    global cv2, tflite
    if cv2 is None:
        try:
            import cv2 as _cv2
            cv2 = _cv2
        except ImportError as e:
            print(f"Warning: OpenCV not available: {e}")

    if tflite is None:
        try:
            import tflite_runtime.interpreter as _tflite
            tflite = _tflite
        except ImportError:
            try:
                import tensorflow.lite as _tflite
                tflite = _tflite
            except ImportError as e:
                print(f"Warning: TFLite runtime not available: {e}")

def get_face_cascade():
    """Load OpenCV Haar Cascade for face detection."""
    global FACE_CASCADE
    if FACE_CASCADE is not None:
        return FACE_CASCADE
    
    if cv2 is None:
        return None

    candidate_paths = [
        getattr(cv2, 'data', None) and getattr(cv2.data, 'haarcascades', '') + 'haarcascade_frontalface_default.xml',
        os.path.join(os.path.dirname(__file__), "haarcascade_frontalface_default.xml"),
        "haarcascade_frontalface_default.xml"
    ]

    for p in candidate_paths:
        if p and os.path.exists(p):
            try:
                cascade = cv2.CascadeClassifier(p)
                if not cascade.empty():
                    FACE_CASCADE = cascade
                    return FACE_CASCADE
            except Exception:
                pass
    return None

NPZ_WEIGHTS = None

def get_npz_weights():
    """Load lightweight exact weights exported from emotion_model.h5."""
    global NPZ_WEIGHTS
    if NPZ_WEIGHTS is not None:
        return NPZ_WEIGHTS
    candidate_paths = [
        os.path.join(os.path.dirname(__file__), "emotion_weights.npz"),
        os.path.join(os.getcwd(), "api", "emotion_weights.npz"),
        "api/emotion_weights.npz",
        "emotion_weights.npz"
    ]
    for p in candidate_paths:
        if os.path.exists(p):
            try:
                NPZ_WEIGHTS = np.load(p)
                return NPZ_WEIGHTS
            except Exception as e:
                print(f"Warning loading NPZ weights: {e}")
    return None

def conv2d_valid(x, w, b):
    H, W, C_in = x.shape
    kH, kW, _, C_out = w.shape
    out_H, out_W = H - kH + 1, W - kW + 1
    shape = (out_H, out_W, kH, kW, C_in)
    strides = (x.strides[0], x.strides[1], x.strides[0], x.strides[1], x.strides[2])
    cols = np.lib.stride_tricks.as_strided(x, shape=shape, strides=strides)
    cols = cols.reshape(out_H * out_W, kH * kW * C_in)
    w_flat = w.reshape(kH * kW * C_in, C_out)
    out = np.dot(cols, w_flat) + b
    return np.maximum(0, out.reshape(out_H, out_W, C_out))

def maxpool2d(x):
    H, W, C = x.shape
    out_H, out_W = H // 2, W // 2
    x_cropped = x[:out_H*2, :out_W*2, :]
    return x_cropped.reshape(out_H, 2, out_W, 2, C).max(axis=(1, 3))

def predict_npz(img48, weights):
    """Run exact forward pass of the original emotion_model.h5 CNN in ~10ms pure NumPy."""
    c1 = conv2d_valid(img48, weights['w_conv1'], weights['b_conv1'])
    p1 = maxpool2d(c1)
    c2 = conv2d_valid(p1, weights['w_conv2'], weights['b_conv2'])
    p2 = maxpool2d(c2)
    flat = p2.flatten()
    d1 = np.maximum(0, np.dot(flat, weights['w_dense1']) + weights['b_dense1'])
    logits = np.dot(d1, weights['w_dense2']) + weights['b_dense2']
    e = np.exp(logits - np.max(logits))
    return e / np.sum(e)

def get_interpreter():
    """Load and cache the TFLite model interpreter."""
    global INTERPRETER, INPUT_DETAILS, OUTPUT_DETAILS
    if INTERPRETER is not None:
        return INTERPRETER, INPUT_DETAILS, OUTPUT_DETAILS

    if tflite is None:
        return None, None, None

    candidate_model_paths = [
        os.path.join(os.path.dirname(__file__), "emotion_model.tflite"),
        os.path.join(os.getcwd(), "api", "emotion_model.tflite"),
        os.path.join(os.getcwd(), "emotion_model.tflite"),
        "api/emotion_model.tflite",
        "emotion_model.tflite",
    ]

    model_path = None
    for p in candidate_model_paths:
        if os.path.exists(p):
            model_path = p
            break

    if not model_path:
        return None, None, None

    try:
        interpreter = tflite.Interpreter(model_path=model_path)
        interpreter.allocate_tensors()
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        INTERPRETER = interpreter
        INPUT_DETAILS = input_details
        OUTPUT_DETAILS = output_details
        return INTERPRETER, INPUT_DETAILS, OUTPUT_DETAILS
    except Exception as e:
        print(f"Failed to load TFLite model: {e}")
        return None, None, None



class handler(BaseHTTPRequestHandler):
    def _send_response(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        # Enable CORS for Next.js frontend calls
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self._send_response(200, {"status": "ok"})

    def do_GET(self):
        """Health check endpoint."""
        init_libraries()
        npz_weights = get_npz_weights()
        interpreter, _, _ = get_interpreter()
        self._send_response(200, {
            "status": "healthy",
            "message": "Face Emotion Detection Serverless API is alive!",
            "model_loaded": (npz_weights is not None) or (interpreter is not None),
            "engine": "npz_cnn" if npz_weights is not None else ("tflite" if interpreter is not None else "demo"),
            "opencv_loaded": cv2 is not None
        })

    def do_POST(self):
        """Process incoming base64 frame and return emotion prediction."""
        init_libraries()

        try:
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self._send_response(400, {"error": "Empty request body"})
                return

            body = self.rfile.read(content_length)
            payload = json.loads(body.decode('utf-8'))
            image_raw = payload.get("image", "")

            if not image_raw:
                self._send_response(400, {"error": "Missing 'image' parameter in JSON payload"})
                return

            # Strip base64 header if present (e.g. 'data:image/jpeg;base64,...')
            if "," in image_raw:
                image_raw = image_raw.split(",", 1)[1]

            image_bytes = base64.b64decode(image_raw)
            np_arr = np.frombuffer(image_bytes, np.uint8)

            if cv2 is None:
                self._send_response(500, {"error": "OpenCV library is not available in environment"})
                return

            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if frame is None:
                self._send_response(400, {"error": "Failed to decode image"})
                return

            # Preprocessing matching original app.py:
            # gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            # faces = face_detect.detectMultiScale(gray, 1.3, 5)
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            h, w = gray.shape

            face_cascade = get_face_cascade()
            faces = []
            if face_cascade is not None:
                faces = face_cascade.detectMultiScale(
                    gray,
                    scaleFactor=1.3,
                    minNeighbors=5,
                    minSize=(30, 30)
                )

            box_info = None
            face_detected = False

            if len(faces) > 0:
                # Find the largest detected face
                faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
                x, y, fw, fh = faces[0]
                face_roi = gray[y:y+fh, x:x+fw]
                face_detected = True
                box_info = {
                    "x": int(x),
                    "y": int(y),
                    "width": int(fw),
                    "height": int(fh),
                    "frame_width": int(w),
                    "frame_height": int(h)
                }
            else:
                # Fallback: center square crop if face detection misses
                min_dim = min(h, w)
                sx = (w - min_dim) // 2
                sy = (h - min_dim) // 2
                face_roi = gray[sy:sy+min_dim, sx:sx+min_dim]
                box_info = None

            # 1. Primary Engine: Lightweight exact weights from emotion_model.h5
            npz_weights = get_npz_weights()
            interpreter, input_details, output_details = get_interpreter()

            if npz_weights is not None:
                # Exact preprocessing from app.py:
                # face = cv2.resize(face, (48, 48))
                # face = face / 255.0
                # face = np.reshape(face, (1, 48, 48, 1))
                resized = cv2.resize(face_roi, (48, 48), interpolation=cv2.INTER_AREA)
                norm = (resized.astype(np.float32) / 255.0)[:, :, np.newaxis]
                probabilities = predict_npz(norm, npz_weights)
            elif interpreter is not None:
                # TFLite Engine
                expected_shape = input_details[0]['shape']
                target_h = int(expected_shape[1]) if len(expected_shape) > 1 else 48
                target_w = int(expected_shape[2]) if len(expected_shape) > 2 else 48
                target_channels = int(expected_shape[3]) if len(expected_shape) > 3 else 1

                resized = cv2.resize(face_roi, (target_w, target_h), interpolation=cv2.INTER_AREA)
                input_dtype = input_details[0]['dtype']
                if target_channels == 1:
                    input_tensor = np.expand_dims(resized, axis=-1)
                else:
                    input_tensor = cv2.cvtColor(resized, cv2.COLOR_GRAY2RGB)

                if input_dtype == np.float32:
                    input_tensor = input_tensor.astype(np.float32) / 255.0
                else:
                    input_tensor = input_tensor.astype(input_dtype)

                input_tensor = np.expand_dims(input_tensor, axis=0)
                interpreter.set_tensor(input_details[0]['index'], input_tensor)
                interpreter.invoke()
                raw_scores = interpreter.get_tensor(output_details[0]['index'])[0].astype(np.float64)
                if np.sum(raw_scores) > 1.05 or np.min(raw_scores) < 0:
                    e_x = np.exp(raw_scores - np.max(raw_scores))
                    probabilities = e_x / np.sum(e_x)
                else:
                    probabilities = raw_scores
            else:
                # Fallback Demo Mode
                self._send_response(200, {
                    "emotion": "neutral" if not face_detected else "happy",
                    "confidence": 0.95,
                    "detected": face_detected,
                    "box": box_info,
                    "demo_mode": True,
                    "notice": "Model weights pending. Running in interactive demo mode."
                })
                return

            best_idx = int(np.argmax(probabilities))
            best_emotion = EMOTIONS[best_idx] if best_idx < len(EMOTIONS) else "neutral"
            best_confidence = float(probabilities[best_idx])

            all_scores = {
                EMOTIONS[i]: round(float(probabilities[i]), 4)
                for i in range(min(len(EMOTIONS), len(probabilities)))
            }

            response_data = {
                "emotion": best_emotion,
                "confidence": round(best_confidence, 4),
                "detected": face_detected,
                "box": box_info,
                "scores": all_scores
            }

            self._send_response(200, response_data)

        except Exception as e:
            self._send_response(500, {
                "error": f"Internal server error: {str(e)}"
            })

if __name__ == "__main__":
    from http.server import HTTPServer
    port = int(os.environ.get("PORT", 5328))
    print(f"Starting local Python server at http://127.0.0.1:{port}")
    print("Send POST requests to http://127.0.0.1:5328/api/predict")
    server = HTTPServer(("127.0.0.1", port), handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        server.server_close()


