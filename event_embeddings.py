import os
import pandas as pd
import numpy as np
import cohere
import traceback
from dotenv import load_dotenv

# Load environment variables
print("Loading environment variables...")
load_dotenv()

# Initialize Cohere client
print("Initializing Cohere client...")
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
if not COHERE_API_KEY:
    raise ValueError("COHERE_API_KEY environment variable not set. Please set it in a .env file.")
else:
    print(f"COHERE_API_KEY found with length: {len(COHERE_API_KEY)}")

co = cohere.Client(COHERE_API_KEY)

def load_and_preprocess_events(csv_path):
    """
    Load events from CSV and preprocess them
    """
    print(f"Loading events from {csv_path}...")
    
    # Check if file exists
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"CSV file not found: {csv_path}")
    
    # Load events data
    df = pd.read_csv(csv_path)
    print(f"Loaded CSV with {len(df)} rows and {len(df.columns)} columns")
    print(f"Columns: {list(df.columns)}")
    
    # Clean data: remove NaNs and trim whitespace
    for col in df.columns:
        if df[col].dtype == 'object':
            df[col] = df[col].fillna('').astype(str).str.strip()
        else:
            df[col] = df[col].fillna('')
    
    # Create a text representation for each event
    event_texts = []
    for _, row in df.iterrows():
        # Combine key topics if they exist
        key_topics = " ".join([
            str(row.get(f"Key topic {i}", "")) 
            for i in range(1, 4) 
            if f"Key topic {i}" in row and pd.notna(row[f"Key topic {i}"])
        ]).strip()
        
        # Create a formatted text string for the event
        event_text = f"{row.get('event name', '')}. {row.get('event summary', '')} "
        event_text += f"Topics: {key_topics}. "
        event_text += f"Location: {row.get('location', '')}. "
        event_text += f"Date: {row.get('date', '')}"
        
        event_texts.append(event_text)
    
    # Add the text representation to the dataframe
    df["event_text"] = event_texts
    
    print(f"Preprocessed {len(df)} events")
    if len(df) > 0:
        print(f"Sample event text: {df['event_text'].iloc[0][:100]}...")
    
    return df

def generate_embeddings(texts, model="embed-english-v3.0"):
    """
    Generate embeddings for a list of texts using Cohere's API
    """
    print(f"Generating embeddings for {len(texts)} texts using model: {model}...")
    
    # Generate embeddings in batches to avoid API limits
    batch_size = 96  # Cohere's API limit is 96 texts per request
    all_embeddings = []
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        print(f"Processing batch {i//batch_size + 1}/{(len(texts)-1)//batch_size + 1}, size: {len(batch)}")
        
        try:
            response = co.embed(
                texts=batch,
                model=model,
                input_type="search_document"
            )
            all_embeddings.extend(response.embeddings)
            print(f"Generated embeddings for batch {i//batch_size + 1}/{(len(texts)-1)//batch_size + 1}")
        except Exception as e:
            print(f"Error generating embeddings for batch {i//batch_size + 1}: {str(e)}")
            traceback.print_exc()
            raise
    
    return np.array(all_embeddings)

def embed_user_query(query, model="embed-english-v3.0"):
    """
    Generate embedding for a user query
    """
    print(f"Generating embedding for user query: '{query}'")
    
    try:
        response = co.embed(
            texts=[query],
            model=model,
            input_type="search_query"
        )
        print("Successfully generated user query embedding")
        return np.array(response.embeddings[0])
    except Exception as e:
        print(f"Error generating embedding for user query: {str(e)}")
        traceback.print_exc()
        raise

def main():
    try:
        # Print current working directory
        print(f"Current working directory: {os.getcwd()}")
        
        # List files in directory
        print("Files in current directory:")
        for file in os.listdir():
            print(f"  - {file}")
        
        # Load and preprocess events
        events_df_2024 = load_and_preprocess_events("synthetic_event_data_2024.csv")
        events_df_2025 = load_and_preprocess_events("synthetic_event_data_2025.csv")
        
        # Combine the dataframes
        events_df = pd.concat([events_df_2024, events_df_2025], ignore_index=True)
        print(f"Combined dataframe has {len(events_df)} rows")
        
        # Generate embeddings for all events
        event_embeddings = generate_embeddings(events_df["event_text"].tolist())
        print(f"Generated embeddings array with shape: {event_embeddings.shape}")
        
        # Save embeddings to disk
        print("Saving embeddings...")
        np.save("event_embeddings.npy", event_embeddings)
        events_df.to_csv("processed_events.csv", index=False)
        
        print(f"Successfully saved embeddings for {len(events_df)} events")
        
        # Example: Generate embedding for a user query
        user_query = "I'm interested in AI and machine learning events"
        user_embedding = embed_user_query(user_query)
        
        # Save user embedding
        np.save("user_embedding_example.npy", user_embedding)
        
        print("Process completed successfully!")
    
    except Exception as e:
        print(f"Error in main function: {str(e)}")
        traceback.print_exc()

if __name__ == "__main__":
    main() 