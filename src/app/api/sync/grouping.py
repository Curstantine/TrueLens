# Import necessary libraries
import os
import json
import numpy as np
from pathlib import Path
from bertopic import BERTopic
from sentence_transformers import SentenceTransformer

def find_repo_root():
    # Find the repository root dynamically
    repo_root = Path(os.getcwd()).resolve() # Get the current working directory
    while repo_root.name != "TrueLens" and repo_root != repo_root.parent:
        repo_root = repo_root.parent # Move up the directory hierarchy until the repo root is found
    return repo_root

# Define paths relative to the repository root
REPO_ROOT = find_repo_root()
ARTICLES_DIR = REPO_ROOT / "news_filtered_data/news_source_data/data/articles"
OUTPUT_FILE = REPO_ROOT / "news_filtered_data/news_source_data/data/grouped_articles.json"

def is_ascii(s):
    # Check if the string contains only ASCII characters
    return all(ord(c) < 128 for c in s)

def load_articles(directory):
    # Load articles from JSON files and filter out empty ones
    articles = []
    
    for file in Path(directory).rglob("*.json"):  # Recursively find all JSON files
        with open(file, "r", encoding="utf-8") as f:
            data = json.load(f)
            text = " ".join(data.get("body_paragraphs", [])).strip()
                        
            if text and is_ascii(data["title"]): # Skip empty articles and non-ASCII titles
                articles.append({
                    "url": data["url"],
                    "title": data["title"],
                    "ut": data["ut"],
                    "body_paragraphs": text,
                    "outlet": data.get("outlet", "unknown"),
                    "reporter": data.get("reporter", None)
                })
    
    return articles # Return the filtered list of articles

def cluster_articles(articles, num_clusters=5):
    # Cluster articles using BERTopic
    body_paragraphs = [article["body_paragraphs"] for article in articles]
    
    if not any(body_paragraphs):
        raise ValueError("No valid articles found for clustering.")
    
    model = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = model.encode(body_paragraphs, show_progress_bar=True)
    
    topic_model = BERTopic(nr_topics=num_clusters)
    topics, _ = topic_model.fit_transform(body_paragraphs, embeddings)
    
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
    # Create reporter and outlet information
    reporter = article["reporter"] or f"system-{article['outlet']}"
    return {"reporter": reporter, "is_system": article["reporter"] is None, "outlet": article["outlet"]}

def process_articles(articles):
    for article in articles: # Process articles to add reporter and outlet information
        article.update(create_reporter_and_outlet(article))
    return articles

def create_story_and_calculate_factuality(grouped_articles):
    # Create stories and calculate factuality for clustered articles
    class MockTRPCClient:
        class Story:
            @staticmethod
            def create(data):
                return {"id": 1, "title": data["title"], "articles": data["articles"]}
        
        class Article:
            @staticmethod
            def update(data):
                pass
    
    trpc_client = MockTRPCClient()
    
    for cluster_id, articles in grouped_articles.items():
        story = trpc_client.Story.create({
            "title": f"Story for cluster {cluster_id}",
            "articles": [article["url"] for article in articles]
        })
        
        factuality = calculate_factuality(articles)
        
        for article in articles:
            trpc_client.Article.update({
                "url": article["url"],
                "storyId": story["id"],
                "factuality": factuality
            })

def calculate_factuality(articles):
    # Dummy function to calculate factuality. Replace with actual implementation
    
    return 75  # Placeholder value

if _name_ == "_main_":
    articles = load_articles(ARTICLES_DIR)
    
    if articles:
        clustered_articles = cluster_articles(articles, num_clusters=min(5, len(articles)))
        print("Clustering Completed.")
        
        processed_articles = process_articles(clustered_articles)
        grouped_articles = save_grouped_articles(processed_articles, OUTPUT_FILE)
        print(f"Grouped articles saved to {OUTPUT_FILE}.")
        
        create_story_and_calculate_factuality(grouped_articles)
        print("Stories created and factuality calculated.")
    else:
        print("No valid articles found. Process terminated.")