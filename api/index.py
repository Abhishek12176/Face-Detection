import os
import sys

# Ensure the api directory is in python search path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from predict import handler

# Export both handler and app for universal Vercel Python runtime compatibility
app = handler

__all__ = ["handler", "app"]
