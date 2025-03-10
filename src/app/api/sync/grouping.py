import os
import json
from pathlib import Path
from typing import List, Dict
import logging
from bertopic import BERTopic
from sentence_transformers import SentenceTransformer

# Configuration
REPO_ROOT = Path(os.getcwd())
ARTICLES_DIR = REPO_ROOT / "news_filtered_data/news_source_data/data/articles"
OUTPUT_FILE = REPO_ROOT / "news_filtered_data/clustered.json"
MODEL_DIR = REPO_ROOT / "news_filtered_data/clustered_model"

OUTLET_MAPPING = {
    "ft.lk": "Daily FT",
    "newsfirst.lk": "News First",
    "dailymirror.lk": "Daily Mirror",
    "sundaytimes.lk": "Sunday Times",
    "dbsjeyaraj.com": "DBS Jeyaraj",
    "newswire.lk": "Newswire",
    "news.lk": "News.lk",
    "adaderana.lk": "Ada Derana",
    "dailynews.lk": "Daily News",           
    "srilankamirror.com": "Sri Lanka Mirror",       
    "colombotelegraph.com": "Colombo Telegraph",
}

# Global model to avoid reinitialization
embedding_model = SentenceTransformer("paraphrase-MiniLM-L12-v2")
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("[cluster]")


def get_outlet_name(url: str) -> str:
    domain = url.split("/")[2]
    domain = domain.replace("www.", "")
    return OUTLET_MAPPING.get(domain, "unknown")


def load_articles(directory: Path) -> List[Dict]:
    """Load and preprocess articles from JSON files."""
    articles = []
    for file in directory.rglob("*.json"):
        try:
            with open(file, "r", encoding="utf-8") as f:
                data = json.load(f)
                text = " ".join(data.get("body_paragraphs", [])).strip()
                outlet = get_outlet_name(data["url"])
                if outlet == "unknown" or not text:
                    logger.warning(f"Skipping due to missing outlet or text: {data['url']}")
                    continue
                reporter = (
                    data.get("reporter") or f"system-{'_'.join(outlet.lower().split())}"
                )
                articles.append(
                    {
                        "url": data["url"],
                        "title": data["title"],
                        "ut": data["ut"],
                        "body_paragraphs": text,
                        "outlet": outlet,
                        "reporter": reporter,
                        "is_system": data.get("reporter") is None,
                    }
                )
        except (json.JSONDecodeError, IOError) as e:
            logger.warning(f"Error processing {file}: {e}")
    logger.info(f"Found {len(articles)} articles for clustering.")
    return articles


def cluster_articles(articles: List[Dict]) -> List[Dict]:
    """Cluster articles using BERTopic."""
    body_paragraphs = [article["body_paragraphs"] for article in articles]
    if not any(body_paragraphs):
        raise ValueError("No valid articles found for clustering.")

    topic_model = BERTopic(
        language="english",
        verbose=True,
        embedding_model=embedding_model,
        min_topic_size=20,
    )
    topics = topic_model.fit_transform(body_paragraphs)
    topic_model.save(MODEL_DIR, serialization="safetensors", save_ctfidf=True)

    for i, article in enumerate(articles):
        article["cluster_id"] = int(topics[0][i]) if topics[0][i] != -1 else "outliers"
    return articles


def save_grouped_articles(articles: List[Dict], output_file: Path) -> Dict:
    """Save clustered articles to a JSON file."""
    grouped_articles = {}
    for article in articles:
        cluster_id = article["cluster_id"]
        grouped_articles.setdefault(cluster_id, []).append(article)

    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(grouped_articles, f, indent=4)
    return grouped_articles


if __name__ == "__main__":
    articles = load_articles(ARTICLES_DIR)
    if articles:
        clustered_articles = cluster_articles(articles)
        logger.info("Clustering completed.")
        grouped_articles = save_grouped_articles(clustered_articles, OUTPUT_FILE)
        logger.info(f"Grouped articles saved to {OUTPUT_FILE}.")
    else:
        logger.warning("No valid articles found. Process terminated.")
