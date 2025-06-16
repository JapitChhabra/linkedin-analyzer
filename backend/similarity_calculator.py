import numpy as np
from sentence_transformers import SentenceTransformer
from typing import Tuple
import os

class SimilarityCalculator:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SimilarityCalculator, cls).__new__(cls)
            cls._instance.model = None
        return cls._instance

    def __init__(self):
        if self.model is None:
            # Initialize the model only if it hasn't been initialized
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            
    def get_embedding(self, text: str) -> np.ndarray:
        """
        Convert text to embedding vector
        """
        return self.model.encode([text])[0]

    def cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """
        Calculate cosine similarity between two vectors
        """
        dot_product = float(np.dot(vec1, vec2))  # Convert to Python float
        norm1 = float(np.linalg.norm(vec1))      # Convert to Python float
        norm2 = float(np.linalg.norm(vec2))      # Convert to Python float
        return dot_product / (norm1 * norm2)

    def calculate_similarity(self, raw_data: str, summary: str) -> Tuple[float, dict]:
        """
        Calculate similarity between raw data and summary
        Returns:
            Tuple containing:
            - similarity score (float)
            - dict with additional metrics
        """
        # Clean and preprocess the texts
        raw_data = raw_data.strip()
        summary = summary.strip()

        # Get embeddings
        raw_embedding = self.get_embedding(raw_data)
        summary_embedding = self.get_embedding(summary)

        # Calculate similarity and convert to Python float
        similarity_score = float(self.cosine_similarity(raw_embedding, summary_embedding))

        # Additional metrics (ensure all numbers are Python floats)
        metrics = {
            'similarity_score': float(similarity_score),
            'raw_data_length': len(raw_data.split()),
            'summary_length': len(summary.split()),
        }

        return similarity_score, metrics

def main():
    # Example usage
    calculator = SimilarityCalculator()
    
    # Test data
    raw_data = "John is a software engineer with 10 years of experience in Python and JavaScript."
    summary = "Experienced software developer skilled in Python and JavaScript."
    
    score, metrics = calculator.calculate_similarity(raw_data, summary)
    print(f"Similarity Score: {score:.4f}")
    print("Metrics:", metrics)

if __name__ == "__main__":
    main() 