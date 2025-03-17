from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import tensorflow as tf
import numpy as np
import pickle
import mysql.connector

app = Flask(__name__)
CORS(app)

# Load pre-trained AI model and tokenizer
model = tf.keras.models.load_model("models/sql_injection_model.h5")
with open("models/tokenizer.pkl", "rb") as f:
    tokenizer = pickle.load(f)

def preprocess_query(query):
    sequence = tokenizer.texts_to_sequences([query])
    padded_sequence = tf.keras.preprocessing.sequence.pad_sequences(sequence, maxlen=100)
    return padded_sequence

def detect_sql_injection(query):
    processed_query = preprocess_query(query)
    prediction = model.predict(processed_query)[0][0]
    return "Malicious" if prediction > 0.5 else "Safe"

@app.route("/detect_sql", methods=["POST"])
def detect_sql():
    data = request.json
    query = data.get("query", "")
    if not query:
        return jsonify({"error": "Query is empty!"})
    
    status = detect_sql_injection(query)
    return jsonify({"query": query, "status": status})

@app.route("/execute_query", methods=["POST"])
def execute_query():
    data = request.json
    query = data.get("query", "")
    if not query:
        return jsonify({"error": "Query is empty!"})
    
    if detect_sql_injection(query) == "Malicious":
        return jsonify({"query": query, "status": "Blocked! Possible SQL Injection."})
    
    try:
        conn = mysql.connector.connect(host="localhost", user="root", password="", database="testdb")
        cursor = conn.cursor()
        cursor.execute(query)
        result = cursor.fetchall()
        conn.commit()
        return jsonify({"query": query, "status": "Executed Successfully", "result": result})
    except Exception as e:
        return jsonify({"query": query, "status": "Execution Failed", "error": str(e)})

if __name__ == "__main__":
    app.run(debug=True)
