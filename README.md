# 🎭 MemeMood AI - Real-Time Face Emotion Detection

A full-stack, meme-styled, real-time Face Emotion Detection web app powered by **Next.js 14 App Router** (frontend) and a **Vercel Python Serverless Function** (backend) using **TensorFlow Lite**, **OpenCV**, and **NumPy**.

---

## ⚡ Architecture Overview

- **Frontend**: Next.js 14, React 18, Tailwind CSS, `react-webcam`, Web Audio API synthetic sound effects, Canvas Confetti.
- **Backend**: Vercel Python Serverless Function at [`/api/predict.py`](file:///api/predict.py) using `tflite-runtime`, `opencv-python-headless`, and `numpy`.
- **Model Engine**: Dynamic range quantized TensorFlow Lite model (`api/emotion_model.tflite`, < 50MB, typically ~2-5MB) operating on 48x48 grayscale face crops.

---

## 📁 Project Structure

```text
Face-Detection/
├── api/
│   ├── predict.py              # Vercel Python Serverless API Handler
│   ├── requirements.txt        # Python dependencies for Vercel Serverless
│   └── emotion_model.tflite    # Converted TFLite model (<50MB, placed here)
├── app/
│   ├── globals.css             # Tailwind CSS & custom meme glow utilities
│   ├── layout.tsx              # Root HTML & fonts
│   └── page.tsx                # Main camera feed & interactive meme UI
├── components/
│   ├── audio.ts                # Zero-dependency Web Audio synthesizer sound effects
│   ├── EmotionConfidenceBars.tsx# Real-time probability meter for 7 emotions
│   ├── FaceOverlay.tsx         # Responsive face bounding box reticle
│   ├── memeConfig.ts           # Emotion quotes, savage roasts, and gradients
│   └── RoastModal.tsx          # 3-Second animated "Emotional Damage" roast toast
├── public/                     # Static assets
├── convert_to_tflite.py        # Local CLI script to convert emotion_model.h5 -> .tflite
├── vercel.json                 # Vercel Serverless Function configuration
├── package.json                # Frontend dependencies and scripts
└── requirements.txt            # Python dependencies (root copy)
```

---

## 🚀 Step 1: Convert Your Model Locally

Run the conversion script on your laptop to convert your Keras `.h5` model into a quantized `.tflite` model:

```bash
# Make sure tensorflow is installed on your local Python environment
pip install tensorflow

# Run conversion
python convert_to_tflite.py --input emotion_model.h5 --output api/emotion_model.tflite
```

> **Why this matters for Vercel:**  
> The script applies `tf.lite.Optimize.DEFAULT` (dynamic range 8-bit quantization). This shrinks your model from 100MB+ down to ~2MB–8MB, staying well below Vercel's strict **50MB** serverless function limit!

---

## 💻 Step 2: Run Locally for Development

### Terminal 1: Frontend (Next.js)
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Terminal 2: Python Backend (Optional for local testing)
```bash
pip install -r requirements.txt
python api/predict.py
```
> The local python server runs at `http://127.0.0.1:5328`. `next.config.mjs` automatically forwards `/api/predict` to this server during development! If the Python server is offline, the frontend gracefully activates **Interactive Preview Mode** so you can test all meme animations and audio effects immediately.

---

## ☁️ Step 3: Deploy to Vercel (Production)

### 1. Initialize Git and Commit
```bash
git add .
git commit -m "feat: complete Next.js + Python serverless face emotion meme app"
```

### 2. Push to GitHub
Create a new repository on [GitHub](https://github.com/new) named `face-emotion-detection`, then run:
```bash
git remote add origin https://github.com/<YOUR_USERNAME>/face-emotion-detection.git
git branch -M main
git push -u origin main
```

### 3. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **"Add New..."** -> **"Project"**.
3. Import your GitHub repository.
4. Leave **Framework Preset** as **Next.js** (Vercel automatically detects Next.js for the frontend and `api/predict.py` for Python Serverless Functions).
5. Click **Deploy**! 🚀

---

## 🤪 Funny Meme Emotion Mapping

| Emotion | Quote | Background Vibe |
|---|---|---|
| **Happy** | *"Bhai has kyun raha hai? 😂"* | Radiant Amber / Yellow + Confetti Blast 🎉 |
| **Angry** | *"Gussa thuk do, mood kharab ho jayega 🤬"* | Fiery Crimson Red 🔥 |
| **Sad** | *"Rula mat yaar, memes dekh 😭"* | Melancholy Blue 🌧️ |
| **Surprise / Confused** | *"Kya soch raha hai? CAT hai kya? 🤔"* | Electric Purple ⚡ |
| **Neutral** | *"Kuch toh bol, dead kyun hai? 😐"* | Chill Slate Gray 🗿 |
| **Disgust** | *"Eww bhai! Kya dekh liya aisa? 🤢"* | Toxic Lime Green 🥒 |
| **Fear** | *"Darr ke aage jeet hai, par yaha bhoot hai kya? 😱"* | Spooky Violet 👻 |

---

## 🔥 Savage Roast Mode
Toggle **"ROAST MODE"** in the top navigation bar to trigger 3-second savage Hindi roasts whenever your emotion shifts, complete with an animated progress bar and comedic sound effects!
