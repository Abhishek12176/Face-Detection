import h5py
import numpy as np
import json
import os

def export():
    h5_path = "emotion_model.h5"
    if not os.path.exists(h5_path):
        print(f"Error: {h5_path} not found")
        return

    f = h5py.File(h5_path, 'r')
    mw = f['model_weights']
    
    # Extract weights in float32
    w_conv1 = mw['conv2d']['sequential']['conv2d']['kernel'][()].astype(np.float32)
    b_conv1 = mw['conv2d']['sequential']['conv2d']['bias'][()].astype(np.float32)
    
    w_conv2 = mw['conv2d_1']['sequential']['conv2d_1']['kernel'][()].astype(np.float32)
    b_conv2 = mw['conv2d_1']['sequential']['conv2d_1']['bias'][()].astype(np.float32)
    
    w_dense1 = mw['dense']['sequential']['dense']['kernel'][()].astype(np.float32)
    b_dense1 = mw['dense']['sequential']['dense']['bias'][()].astype(np.float32)
    
    w_dense2 = mw['dense_1']['sequential']['dense_1']['kernel'][()].astype(np.float32)
    b_dense2 = mw['dense_1']['sequential']['dense_1']['bias'][()].astype(np.float32)
    
    f.close()
    
    # 1. Save NPZ for Python serverless API (Fast, no giant TensorFlow library needed)
    os.makedirs("api", exist_ok=True)
    np.savez_compressed(
        "api/emotion_weights.npz",
        w_conv1=w_conv1, b_conv1=b_conv1,
        w_conv2=w_conv2, b_conv2=b_conv2,
        w_dense1=w_dense1, b_dense1=b_dense1,
        w_dense2=w_dense2, b_dense2=b_dense2
    )
    npz_size = os.path.getsize("api/emotion_weights.npz") / (1024 * 1024)
    print(f"[*] Saved api/emotion_weights.npz ({npz_size:.2f} MB)")
    
    # 2. Save TensorFlow.js format for Browser Client Inference
    os.makedirs("public/model", exist_ok=True)
    
    # Concatenate weights in order into binary buffer
    weights_order = [
        ("conv2d/kernel", w_conv1),
        ("conv2d/bias", b_conv1),
        ("conv2d_1/kernel", w_conv2),
        ("conv2d_1/bias", b_conv2),
        ("dense/kernel", w_dense1),
        ("dense/bias", b_dense1),
        ("dense_1/kernel", w_dense2),
        ("dense_1/bias", b_dense2),
    ]
    
    bin_path = "public/model/weights.bin"
    with open(bin_path, "wb") as bf:
        for name, arr in weights_order:
            bf.write(arr.tobytes())
            
    bin_size = os.path.getsize(bin_path) / (1024 * 1024)
    print(f"[*] Saved public/model/weights.bin ({bin_size:.2f} MB)")
    
    manifest_weights = [
        {"name": name, "shape": list(arr.shape), "dtype": "float32"}
        for name, arr in weights_order
    ]
    
    tfjs_model = {
        "format": "layers-model",
        "generatedBy": "keras-export-tool",
        "convertedBy": "Antigravity AI",
        "modelTopology": {
            "class_name": "Sequential",
            "config": {
                "name": "sequential",
                "layers": [
                    {
                        "class_name": "Conv2D",
                        "config": {
                            "name": "conv2d",
                            "trainable": True,
                            "batch_input_shape": [None, 48, 48, 1],
                            "dtype": "float32",
                            "filters": 32,
                            "kernel_size": [3, 3],
                            "strides": [1, 1],
                            "padding": "valid",
                            "data_format": "channels_last",
                            "dilation_rate": [1, 1],
                            "activation": "relu",
                            "use_bias": True
                        }
                    },
                    {
                        "class_name": "MaxPooling2D",
                        "config": {
                            "name": "max_pooling2d",
                            "trainable": True,
                            "pool_size": [2, 2],
                            "padding": "valid",
                            "strides": [2, 2],
                            "data_format": "channels_last"
                        }
                    },
                    {
                        "class_name": "Conv2D",
                        "config": {
                            "name": "conv2d_1",
                            "trainable": True,
                            "filters": 64,
                            "kernel_size": [3, 3],
                            "strides": [1, 1],
                            "padding": "valid",
                            "data_format": "channels_last",
                            "dilation_rate": [1, 1],
                            "activation": "relu",
                            "use_bias": True
                        }
                    },
                    {
                        "class_name": "MaxPooling2D",
                        "config": {
                            "name": "max_pooling2d_1",
                            "trainable": True,
                            "pool_size": [2, 2],
                            "padding": "valid",
                            "strides": [2, 2],
                            "data_format": "channels_last"
                        }
                    },
                    {
                        "class_name": "Flatten",
                        "config": {
                            "name": "flatten",
                            "trainable": True,
                            "data_format": "channels_last"
                        }
                    },
                    {
                        "class_name": "Dense",
                        "config": {
                            "name": "dense",
                            "trainable": True,
                            "units": 128,
                            "activation": "relu",
                            "use_bias": True
                        }
                    },
                    {
                        "class_name": "Dense",
                        "config": {
                            "name": "dense_1",
                            "trainable": True,
                            "units": 7,
                            "activation": "softmax",
                            "use_bias": True
                        }
                    }
                ]
            }
        },
        "weightsManifest": [
            {
                "paths": ["weights.bin"],
                "weights": manifest_weights
            }
        ]
    }
    
    with open("public/model/model.json", "w") as jf:
        json.dump(tfjs_model, jf, indent=2)
        
    print("[*] Saved public/model/model.json for TensorFlow.js")
    print("[SUCCESS] Export completed successfully!")

if __name__ == "__main__":
    export()
