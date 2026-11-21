import sys
from pathlib import Path

# Ensure backend root directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Re-export the main FastAPI app
from main import app  # noqa: F401, E402
