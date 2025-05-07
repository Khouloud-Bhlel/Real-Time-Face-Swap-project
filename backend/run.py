import uvicorn
import os
import sys
from pathlib import Path

# Add the parent directory to the path so we can import the app module
sys.path.insert(0, str(Path(__file__).parent))

if __name__ == "__main__":
    # Get port from command line arg or default to 8000
    port = int(os.environ.get("PORT", 8000))

    # Run the application with Uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info",
        workers=4
    )
