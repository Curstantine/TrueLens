# Import necessary libraries
import os
import json
from pathlib import Path
from bertopic import BERTopic
from sentence_transformers import SentenceTransformer


REPO_ROOT = Path(os.getcwd())
ARTICLES_DIR = REPO_ROOT / "news_filtered_data/news_source_data/data/articles"
OUTPUT_FILE = REPO_ROOT / "news_filtered_data/clustered.json"

MODEL_DIR = REPO_ROOT / "news_filtered_data/clustered_model"
VISUALIZATION_DIR = REPO_ROOT / "news_filtered_data/visualization"


def get_outlet_name(url):
    domain = url.split("/")[2]
    match domain:
        case "www.ft.lk":
            return "Daily FT"
        case "www.newsfirst.lk":
            return "News First"
        case "www.adaderana.lk":
            return "Ada Derana"
        case "www.news.lk":
            return "News.lk"
        case "dbsjeyaraj.com":
            return "DBS Jeyaraj"
        case "www.dailymirror.lk":
            return "Daily Mirror"
        case "www.dailynews.lk":
            return "Daily News"
        case "www.island.lk":
            return "The Island"
        case "www.sundaytimes.lk":
            return "Sunday Times"
        case "www.dailypioneer.com":
            return "Daily Pioneer"
        case _:
            print(f"[cluster] Unknown outlet: {domain}")
            return "unknown"


def load_articles(directory):
    articles = []

    for file in Path(directory).rglob("*.json"):
        with open(file, "r", encoding="utf-8") as f:
            data = json.load(f)
            text = " ".join(data.get("body_paragraphs", [])).strip()
            outlet = get_outlet_name(data["url"])

            if outlet == "unknown" or not text:
                continue

            articles.append(
                {
                    "url": data["url"],
                    "title": data["title"],
                    "ut": data["ut"],
                    "body_paragraphs": text,
                    "outlet": outlet,
                    "reporter": data.get("reporter", None),
                }
            )

    print(f"[cluster] Found {len(articles)} articles for clustering.")
    return articles


def cluster_articles(articles):
    # Cluster articles using BERTopic
    body_paragraphs = [article["body_paragraphs"] for article in articles]

    if not any(body_paragraphs):
        raise ValueError("No valid articles found for clustering.")

    model = SentenceTransformer("paraphrase-MiniLM-L12-v2")

    topic_model = BERTopic(
        language="english",
        calculate_probabilities=True,
        verbose=True,
        embedding_model=model,
        nr_topics=64,
    )
    topics, probabilities = topic_model.fit_transform(body_paragraphs)
    topic_model.save(MODEL_DIR, serialization="safetensors", save_ctfidf=True)

    v_topics = topic_model.visualize_topics()
    v_distribution = topic_model.visualize_distribution(
        probabilities[0], min_probability=0.015
    )

    if not VISUALIZATION_DIR.exists():
        VISUALIZATION_DIR.mkdir(parents=True, exist_ok=True)

    v_topics.write_html(VISUALIZATION_DIR / "topics.html")
    v_distribution.write_html(VISUALIZATION_DIR / "distribution.html")

    for i, article in enumerate(articles):
        article["cluster_id"] = int(topics[i])

    return articles


def save_grouped_articles(articles, output_file):
    # Save grouped articles to a JSON file and return grouped data
    grouped_articles = {}
    for article in articles:
        cluster_id = article["cluster_id"]
        grouped_articles.setdefault(cluster_id, []).append(article)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(grouped_articles, f, indent=2)

    return grouped_articles


def create_reporter_and_outlet(article):
    outlet = get_outlet_name(article["url"])
    id = "_".join(outlet.lower().split(" "))
    reporter = article["reporter"] or f"system-{id}"

    return {
        "outlet": outlet,
        "reporter": reporter,
        "is_system": article["reporter"] is None,
    }


def process_articles(articles):
    for article in articles:  # Process articles to add reporter and outlet information
        article.update(create_reporter_and_outlet(article))
    return articles


if __name__ == "__main__":
    articles = load_articles(ARTICLES_DIR)

    if articles:
        clustered_articles = cluster_articles(articles)
        print("[cluster] Clustering Completed.")

        processed_articles = process_articles(clustered_articles)
        grouped_articles = save_grouped_articles(processed_articles, OUTPUT_FILE)
        print(f"[cluster] Grouped articles saved to {OUTPUT_FILE}.")
    else:
        print("[cluster] No valid articles found. Process terminated.")
