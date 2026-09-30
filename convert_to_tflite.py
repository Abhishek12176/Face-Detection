#!/usr/bin/env python3
"""
Model Conversion Script: emotion_model.h5 -> emotion_model.tflite
Optimized for Vercel Serverless Function deployment (File size strictly < 50MB)

Usage:
    python convert_to_tflite.py
    python convert_to_tflite.py --input path/to/emotion_model.h5 --output api/emotion_model.tflite
"""

import os
import sys
import argparse

def convert_h5_to_tflite(h5_path="emotion_model.h5", output_path="api/emotion_model.tflite"):
    print("=" * 60)
    print("🚀 Face Emotion Model Converter (H5 -> TFLite)")
    print("=" * 60)

    # 1. Check if source model exists
    if not os.path.exists(h5_path):
        print(f"❌ Error: Model file '{h5_path}' nahi mila!")
        print(f"👉 Please make sure '{h5_path}' is placed in the project root or provide path via --input.")
        sys.exit(1)

    original_size_mb = os.path.getsize(h5_path) / (1024 * 1024)
    print(f"📦 Found input model: {h5_path} ({original_size_mb:.2f} MB)")

    # 2. Check TensorFlow installation
    try:
        import tensorflow as tf
        print(f"✅ TensorFlow version: {tf.__version__}")
    except ImportError:
        print("❌ TensorFlow is not installed in your Python environment.")
        print("👉 Run: pip install tensorflow")
        sys.exit(1)

    print("\n⏳ Loading Keras model...")
    try:
        model = tf.keras.models.load_model(h5_path, compile=False)
        print("✅ Keras model loaded successfully!")
        print(f"   Input shape:  {model.input_shape}")
        print(f"   Output shape: {model.output_shape}")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        sys.exit(1)

    # 3. Convert with Optimization for Vercel Serverless (size reduction < 50MB)
    print("\n⚡ Converting to TensorFlow Lite format with dynamic range quantization...")
    try:
        converter = tf.lite.TFLiteConverter.from_keras_model(model)
        # Apply DEFAULT optimization (quantizes weights from float32 to int8)
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        
        tflite_model = converter.convert()
        print("✅ Conversion completed!")
    except Exception as e:
        print(f"❌ Conversion failed: {e}")
        sys.exit(1)

    # 4. Save to target location
    output_dir = os.path.dirname(output_path)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)

    with open(output_path, "wb") as f:
        f.write(tflite_model)

    new_size_mb = os.path.getsize(output_path) / (1024 * 1024)
    reduction = ((original_size_mb - new_size_mb) / original_size_mb) * 100 if original_size_mb > 0 else 0

    # Also keep a copy in root if saved in api/, or vice versa
    root_copy_path = "emotion_model.tflite"
    if output_path != root_copy_path:
        with open(root_copy_path, "wb") as f:
            f.write(tflite_model)

    print("\n" + "=" * 60)
    print("🎉 CONVERSION SUMMARY")
    print("=" * 60)
    print(f"📁 Output File:    {output_path}")
    print(f"📦 Original Size:  {original_size_mb:.2f} MB")
    print(f"⚡ TFLite Size:    {new_size_mb:.2f} MB")
    print(f"📉 Size Reduction: {reduction:.1f}%")
    
    if new_size_mb < 50:
        print("✅ PERFECT! Model is well under Vercel's 50MB Serverless Function limit.")
    else:
        print("⚠️ Warning: Model is >= 50MB. Vercel free tier might reject functions > 50MB.")
        print("   Consider additional pruning or float16 quantization.")

    # 5. Quick Verification
    print("\n🔍 Verifying TFLite Interpreter...")
    try:
        interpreter = tf.lite.Interpreter(model_content=tflite_model)
        interpreter.allocate_tensors()
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        print(f"✅ Input Tensor:  Shape = {input_details[0]['shape']}, Type = {input_details[0]['dtype']}")
        print(f"✅ Output Tensor: Shape = {output_details[0]['shape']}, Type = {output_details[0]['dtype']}")
        print("\n✨ Ready for deployment! The model is saved at api/emotion_model.tflite")
    except Exception as e:
        print(f"⚠️ Verification warning: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert Keras .h5 emotion model to optimized .tflite")
    parser.add_argument("--input", "-i", default="emotion_model.h5", help="Path to input .h5 model file")
    parser.add_argument("--output", "-o", default="api/emotion_model.tflite", help="Path to output .tflite model file")
    args = parser.parse_args()

    convert_h5_to_tflite(args.input, args.output)
