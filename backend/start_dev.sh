set -e

echo "Starting 3D Keyboard Customizer Backend..."

# Run migrations
./.venv/bin/python -m alembic upgrade head

# Run Uvicorn server
./.venv/bin/python -m uvicorn api.main:app --reload --port 8000