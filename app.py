from flask import Flask, render_template, jsonify
from locations import get_locations

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/locations")
def locations():
    return jsonify(get_locations())


if __name__ == "__main__":
    app.run(debug=True)