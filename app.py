import json
from pathlib import Path

from flask import Flask, render_template, send_from_directory

# Папка, в которой лежит этот файл. Так сайт запустится из любого места.
BASE_DIR = Path(__file__).resolve().parent

# index.html лежит рядом с app.py, поэтому указываем Flask искать шаблоны здесь.
app = Flask(__name__, template_folder=str(BASE_DIR))


def load_cards():
    """Читаем карточки из content.json при каждом открытии страницы."""
    with open(BASE_DIR / "content.json", "r", encoding="utf-8") as file:
        data = json.load(file)
    return data["cards"]


def collect_tags(cards):
    """Собираем теги и считаем, сколько карточек у каждого тега."""
    tags = []
    for card in cards:
        for tag in card["tags"]:
            if tag not in tags:
                tags.append(tag)

    return [
        {"name": tag, "count": sum(1 for card in cards if tag in card["tags"])}
        for tag in tags
    ]


@app.route("/")
def index():
    cards = load_cards()
    return render_template("index.html", cards=cards, tags=collect_tags(cards))


@app.route("/style.css")
def styles():
    return send_from_directory(str(BASE_DIR), "style.css")


@app.route("/script.js")
def scripts():
    return send_from_directory(str(BASE_DIR), "script.js")


if __name__ == "__main__":
    # debug=True автоматически перезапускает сервер после изменений в коде.
    app.run(debug=True)
