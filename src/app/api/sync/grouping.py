import os
import json
from pathlib import Path
from typing import List, Dict
import logging
from bertopic import BERTopic
from sentence_transformers import SentenceTransformer

# Configuration
REPO_ROOT = Path(os.getcwd())
ARTICLES_FILE = REPO_ROOT / "news_data/articles.json"
OUTPUT_FILE = REPO_ROOT / "news_data/clustered.json"
MODEL_DIR = REPO_ROOT / "news_data/clustered_model"

# Global model to avoid reinitialization
embedding_model = "all-mpnet-base-v2"
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("[cluster]")


class Author:
    """
    Represents an author of an article.
    """

    def __init__(self, name: str, is_system: bool = False):
        self.name = name
        self.is_system = is_system

    def to_dict(self) -> Dict:
        """Convert the author to a dictionary representation."""
        return {"name": self.name, "isSystem": self.is_system}

    @classmethod
    def from_dict(cls, data: Dict) -> "Author":
        """Create an Author instance from a dictionary."""
        return cls(name=data.get("name", ""), is_system=data.get("isSystem", False))


class SourceArticle:
    """
    Represents a source article with essential metadata and content.
    """

    def __init__(
        self,
        external_id: str,
        title: str,
        url: str,
        published_at: str,  # ISO format date string
        body: List[str],
        outlet: str,
        author: Author,
        cover_image_url: str,
    ):
        self.external_id = external_id
        self.title = title
        self.url = url
        self.published_at = published_at
        self.body = body
        self.outlet = outlet
        self.author = author
        self.cover_image_url = cover_image_url
        self.cluster_id = None

    def to_dict(self) -> Dict:
        """Convert the article to a dictionary representation."""
        return {
            "externalId": self.external_id,
            "title": self.title,
            "url": self.url,
            "publishedAt": self.published_at,
            "body": self.body,
            "outlet": self.outlet,
            "coverImageUrl": self.cover_image_url,
            "author": self.author.to_dict(),
        }

    @classmethod
    def from_dict(cls, data: Dict) -> "SourceArticle":
        """Create a SourceArticle instance from a dictionary."""
        author_data = data.get("author", {})
        author = Author.from_dict(author_data)

        return cls(
            external_id=data.get("externalId", ""),
            title=data.get("title", ""),
            url=data.get("url", ""),
            published_at=data.get("publishedAt", ""),
            body=data.get("body", []),
            outlet=data.get("outlet", ""),
            cover_image_url=data.get("coverImageUrl", ""),
            author=author,
        )

    def set_cluster_id(self, cluster_id: int):
        self.cluster_id = cluster_id


def load_articles() -> List[SourceArticle]:
    """Load and preprocess articles from JSON files."""
    articles = []
    with open(ARTICLES_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
        for article_data in data:
            article = SourceArticle.from_dict(article_data)
            articles.append(article)
    return articles


def cluster_articles(articles: List[SourceArticle]) -> List[Dict]:
    """Cluster articles using BERTopic."""
    docs = []
    for article in articles:
        docs.append(str.format("{0} {1}", article.title, " ".join(article.body)))

    if not any(docs):
        raise ValueError("No valid articles found for clustering.")

    topic_model = BERTopic(
        language="english",
        verbose=True,
        embedding_model=embedding_model,
        min_topic_size=2,
    )
    topics = topic_model.fit_transform(docs)
    topic_model.save(MODEL_DIR, serialization="safetensors", save_ctfidf=True)

    print(topic_model.get_topic_info())
    for i, article in enumerate(articles):
        article.set_cluster_id(topic_model.topics_[i])

    return articles


def save_grouped_articles(articles: List[SourceArticle]) -> Dict:
    """Save clustered articles to a JSON file."""
    grouped_articles: Dict[str, Dict] = {}
    for article in articles:
        cluster_id = article.cluster_id if article.cluster_id is not None else -1
        grouped_articles.setdefault(cluster_id, []).append(article.to_dict())

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(grouped_articles, f, indent=4)

    return grouped_articles


if __name__ == "__main__":
    articles = load_articles()

    if articles:
        clustered_articles = cluster_articles(articles)
        logger.info("Clustering completed.")
        grouped_articles = save_grouped_articles(clustered_articles)
        logger.info(f"Grouped articles saved to {OUTPUT_FILE}.")
    else:
        logger.warning("No valid articles found. Process terminated.")
