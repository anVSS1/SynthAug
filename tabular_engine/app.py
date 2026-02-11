import os
import threading
import time

print("[STARTUP] Importing pandas...")
import pandas as pd
print("[STARTUP] Importing requests...")
import requests
print("[STARTUP] Importing flask...")
from flask import Flask, jsonify, request, send_file
print("[STARTUP] Importing flask_cors...")
from flask_cors import CORS
print("[STARTUP] Importing sdv...")
from sdv.metadata import SingleTableMetadata
from sdv.single_table import CTGANSynthesizer, GaussianCopulaSynthesizer
print("[STARTUP] All imports complete")

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(__file__)
WORK_DIR = os.path.join(BASE_DIR, "workdir")
os.makedirs(WORK_DIR, exist_ok=True)

STATE = {}


def get_project_id(req):
    return req.headers.get("X-Project-Id") or req.args.get("projectId")


def get_workspace(project_id):
    workspace = os.path.join(WORK_DIR, project_id)
    os.makedirs(workspace, exist_ok=True)
    return workspace


def update_state(project_id, **updates):
    current = STATE.setdefault(
        project_id,
        {
            "status": "idle",
            "progress": 0,
            "log": "System ready.",
        },
    )
    current.update(updates)


def notify_backend(project_id, status, message, metadata=None):
    backend_url = os.environ.get("BACKEND_URL", "http://localhost:5000")
    secret = os.environ.get("AI_ENGINE_SECRET")
    webhook_url = f"{backend_url}/api/proxy/{project_id}/webhook"

    headers = {}
    if secret:
        headers["x-ai-secret"] = secret

    payload = {
        "status": status,
        "message": message,
        "metadata": metadata or {},
    }

    try:
        requests.post(webhook_url, json=payload, headers=headers, timeout=10)
    except requests.RequestException as exc:
        print(f"Webhook failed: {exc}")


@app.route("/upload", methods=["POST"])
def upload_file():
    project_id = get_project_id(request)
    if not project_id:
        return jsonify({"error": "Missing project id"}), 400

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"error": "No file selected"}), 400

    workspace = get_workspace(project_id)
    input_path = os.path.join(workspace, "input.csv")
    file.save(input_path)

    try:
        df = pd.read_csv(input_path)
    except Exception as exc:
        return jsonify({"error": f"Failed to read CSV: {exc}"}), 400

    update_state(project_id, status="idle", progress=0, log="Dataset uploaded.")

    return jsonify(
        {
            "message": "Dataset uploaded successfully.",
            "rows": len(df),
            "columns": list(df.columns),
            "columnCount": len(df.columns),
        }
    ), 200


@app.route("/train", methods=["POST"])
def start_training():
    project_id = get_project_id(request)
    if not project_id:
        return jsonify({"error": "Missing project id"}), 400

    state = STATE.get(project_id, {})
    if state.get("status") == "training":
        return jsonify({"error": "Engine is busy"}), 409

    data = request.json or {}
    count = int(data.get("count", 500))
    model = data.get("model", "ctgan")
    epochs = int(data.get("epochs", 100))

    thread = threading.Thread(
        target=run_training_background,
        args=(project_id, count, model, epochs),
        daemon=True,
    )
    thread.start()

    return jsonify({"message": f"Training started with {model}."}), 200


@app.route("/status", methods=["GET"])
def get_status():
    project_id = get_project_id(request)
    if not project_id:
        return jsonify({"error": "Missing project id"}), 400

    return jsonify(STATE.get(project_id, {"status": "idle", "progress": 0, "log": "System ready."}))


@app.route("/download", methods=["GET"])
def download_results():
    project_id = get_project_id(request)
    if not project_id:
        return jsonify({"error": "Missing project id"}), 400

    workspace = get_workspace(project_id)
    generated_path = os.path.join(workspace, "generated.csv")
    input_path = os.path.join(workspace, "input.csv")
    download_type = request.args.get("type", "generated")

    if download_type == "merged" and os.path.exists(input_path) and os.path.exists(generated_path):
        merged_path = os.path.join(workspace, "merged.csv")
        original = pd.read_csv(input_path)
        generated = pd.read_csv(generated_path)
        merged = pd.concat([original, generated], ignore_index=True)
        merged.to_csv(merged_path, index=False)
        return send_file(merged_path, as_attachment=True)

    if not os.path.exists(generated_path):
        return jsonify({"error": "No generated data found."}), 404

    return send_file(generated_path, as_attachment=True)


def run_training_background(project_id, count, model, epochs):
    workspace = get_workspace(project_id)
    input_path = os.path.join(workspace, "input.csv")
    generated_path = os.path.join(workspace, "generated.csv")

    print(f"\n{'='*60}")
    print(f"[TRAIN] Project: {project_id}")
    print(f"[TRAIN] Workspace: {workspace}")
    print(f"[TRAIN] Input CSV path: {input_path}")
    print(f"[TRAIN] Model: {model}, Rows: {count}, Epochs: {epochs}")
    print(f"{'='*60}\n")

    if not os.path.exists(input_path):
        print(f"[ERROR] Input file not found: {input_path}")
        update_state(project_id, status="failed", log="Missing input CSV.")
        notify_backend(project_id, "failed", "Missing input CSV.")
        return

    start_time = time.time()
    update_state(project_id, status="training", progress=10, log="Preparing metadata...")
    print(f"[TRAIN] Loading CSV from: {input_path}")

    try:
        df = pd.read_csv(input_path)
        print(f"[TRAIN] Loaded DataFrame: {len(df)} rows, {len(df.columns)} columns")
        print(f"[TRAIN] Columns: {list(df.columns)}")
        
        metadata = SingleTableMetadata()
        print(f"[TRAIN] Detecting metadata from dataframe...")
        metadata.detect_from_dataframe(df)
        print(f"[TRAIN] Metadata detected successfully")

        if model == "gaussian":
            print(f"[TRAIN] Initializing GaussianCopulaSynthesizer...")
            synthesizer = GaussianCopulaSynthesizer(metadata)
        else:
            print(f"[TRAIN] Initializing CTGANSynthesizer with {epochs} epochs...")
            synthesizer = CTGANSynthesizer(metadata, epochs=epochs)

        update_state(project_id, progress=35, log=f"Training {model} model...")
        print(f"[TRAIN] Starting fit...")
        synthesizer.fit(df)
        print(f"[TRAIN] Fit complete")

        update_state(project_id, progress=80, log="Sampling synthetic rows...")
        print(f"[TRAIN] Sampling {count} rows...")
        generated = synthesizer.sample(count)
        print(f"[TRAIN] Generated shape: {generated.shape}")
        
        print(f"[TRAIN] Saving to: {generated_path}")
        generated.to_csv(generated_path, index=False)
        print(f"[TRAIN] File saved")

        duration = int(time.time() - start_time)
        print(f"[TRAIN] Training completed in {duration} seconds")
        
        update_state(
            project_id,
            status="completed",
            progress=100,
            log=f"Complete. Generated {count} rows.",
        )

        print(f"[TRAIN] Notifying backend...")
        notify_backend(
            project_id,
            "completed",
            f"Tabular generation complete. {count} rows created.",
            {
                "generatedRows": count,
                "columnCount": len(df.columns),
                "processingTime": duration,
            },
        )
        print(f"[TRAIN] Backend notified successfully\n")
        
    except Exception as exc:
        import traceback
        print(f"\n[ERROR] Training failed for project {project_id}")
        print(f"[ERROR] Exception: {exc}")
        print(f"[ERROR] Traceback:\n{traceback.format_exc()}\n")
        
        update_state(project_id, status="failed", progress=0, log=f"ERROR: {exc}")
        notify_backend(project_id, "failed", str(exc))


if __name__ == "__main__":
    port = int(os.environ.get("TABULAR_ENGINE_PORT", 5001))
    app.run(host="0.0.0.0", port=port)
