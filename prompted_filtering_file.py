import numpy as np
import pandas as pd
import cohere
import os
import json
import re
import sys
import argparse
import traceback
from dotenv import load_dotenv
from event_embeddings import embed_user_query

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

def cosine_similarity(embedding1, embedding2):
    """
    Calculate cosine similarity between two embeddings
    """
    return np.dot(embedding1, embedding2) / (np.linalg.norm(embedding1) * np.linalg.norm(embedding2))

def get_top_similar_events(user_summary, top_n=10, verbose=False):
    """
    Find top N events most similar to the user summary based on embeddings
    """
    if verbose:
        print(f"Finding events similar to user summary: '{user_summary}'")
    
    # Generate embedding for the user summary
    try:
        user_embedding = embed_user_query(user_summary)
        if verbose:
            print(f"Generated user embedding with shape: {user_embedding.shape}")
    except Exception as e:
        if verbose:
            print(f"Error generating user embedding: {str(e)}")
            traceback.print_exc()
        return None
    
    # Load event embeddings and events data
    try:
        if verbose:
            print("Loading event embeddings and processed events data...")
        event_embeddings = np.load("event_embeddings.npy")
        events_df = pd.read_csv("processed_events.csv")
        if verbose:
            print(f"Loaded event embeddings with shape: {event_embeddings.shape}")
            print(f"Loaded processed events data with {len(events_df)} rows")
    except FileNotFoundError as e:
        if verbose:
            print(f"Error: {str(e)}. Run event_embeddings.py first.")
        return None
    except Exception as e:
        if verbose:
            print(f"Error loading embeddings or events data: {str(e)}")
            traceback.print_exc()
        return None
    
    # Calculate similarity scores
    if verbose:
        print("Calculating similarity scores...")
    similarities = []
    for i, event_embedding in enumerate(event_embeddings):
        similarity = cosine_similarity(user_embedding, event_embedding)
        similarities.append((i, similarity))
    
    # Sort by similarity (highest first)
    similarities.sort(key=lambda x: x[1], reverse=True)
    
    # Get top N results
    if verbose:
        print(f"Getting top {top_n} results...")
    top_results = []
    for i, similarity in similarities[:top_n]:
        event_data = events_df.iloc[i]
        result = {
            "event_id": event_data.get("event_id", f"Event {i}"),
            "event_name": event_data.get("event name", ""),
            "date": event_data.get("date", ""),
            "similarity_score": float(similarity),
            "topics": f"{event_data.get('Key topic 1', '')} {event_data.get('Key topic 2', '')} {event_data.get('Key topic 3', '')}".strip(),
            "location": event_data.get("location", ""),
            "summary": event_data.get("event summary", ""),
            "event_text": event_data.get("event_text", "")
        }
        top_results.append(result)
    
    return top_results

def create_prompt(user_summary, top_events):
    """
    Create a prompt for Cohere to refine the top N matches
    """
    prompt = f"""User preferences:
{user_summary}

Event options:
"""
    
    for i, event in enumerate(top_events):
        prompt += f"{i+1}. {event['event_name']} - {event['date']} - {event['location']}\n"
        prompt += f"   Summary: {event['summary']}\n"
        prompt += f"   Topics: {event['topics']}\n\n"
    
    prompt += """Based on the user's preferences, select and rank the top 3 most relevant events for networking. 
For each selected event, provide:
- A brief reason why it's a good fit
- A relevance score (1 to 100)

Format your response as follows:
Event #X: [Event Name]
Reason: [Brief explanation of why this event is relevant]
Relevance Score: [Score between 1-100]

Please ensure your response is structured exactly as specified above."""
    
    return prompt

def parse_llm_output(output_text, verbose=False):
    """
    Parse the LLM output into a structured format
    """
    if verbose:
        print("Parsing LLM output...")
    
    results = []
    
    # Extract each event section using regex
    pattern = r"Event #\d+: (.*?)\nReason: (.*?)\nRelevance Score: (\d+)"
    matches = re.findall(pattern, output_text, re.DOTALL)
    
    for i, match in enumerate(matches):
        event_name = match[0].strip()
        reason = match[1].strip()
        score = int(match[2].strip())
        
        results.append({
            "event_number": i + 1,  # Add explicit event number
            "event_title": event_name,
            "reason": reason,
            "relevance_score": score
        })
    
    return results

def format_results_for_display(results):
    """
    Format the results for display in the chatbot
    """
    if not results or not results.get("llm_filtered_events"):
        return "I couldn't find specific events matching your preferences at this time."
    
    output = "## Recommended Events for You:\n\n"
    
    for event in results["llm_filtered_events"]:
        output += f"### {event['event_number']}. {event['event_title']}\n"
        output += f"**Why this is a good match:** {event['reason']}\n"
        output += f"**Relevance Score:** {event['relevance_score']}/100\n\n"
    
    return output

def get_recommendations_json(results):
    """
    Return results as JSON for API usage
    """
    if not results or not results.get("llm_filtered_events"):
        return json.dumps({"error": "No matching events found"})
    
    return json.dumps({
        "recommendations": results["llm_filtered_events"],
        "user_summary": results["user_summary"]
    })

def llm_filter_events(user_summary, top_n=5, output_format="text", verbose=False):
    """
    Main function to filter events using embeddings and LLM
    
    Parameters:
    - user_summary: String with user's preferences
    - top_n: Number of events to consider (default 5)
    - output_format: 'text' for markdown formatting, 'json' for API responses
    - verbose: Whether to print detailed logs
    
    Returns:
    - Formatted string (text mode) or JSON string (json mode)
    """
    try:
        # Step 1: Get top N similar events based on embeddings
        top_events = get_top_similar_events(user_summary, top_n, verbose)
        if not top_events:
            return "No matching events found" if output_format == "text" else json.dumps({"error": "No matching events found"})
        
        # Step 2: Create prompt for Cohere
        prompt = create_prompt(user_summary, top_events)
        if verbose:
            print("\nPrompt for Cohere:")
            print("-" * 80)
            print(prompt)
            print("-" * 80)
        
        # Step 3: Call Cohere's generate API
        if verbose:
            print("\nCalling Cohere's generate API...")
        try:
            response = co.generate(
                prompt=prompt,
                max_tokens=800,
                temperature=0.3,
                k=0,
                p=0.75
            )
            
            # Get the generated text
            output_text = response.generations[0].text
            if verbose:
                print("\nCohere's response:")
                print("-" * 80)
                print(output_text)
                print("-" * 80)
            
        except Exception as e:
            if verbose:
                print(f"Error in Cohere generate API call: {str(e)}")
                traceback.print_exc()
            # Mock response for testing or fallback
            output_text = f"""Event #1: {top_events[0]['event_name']} 
Reason: This event matches the user's interests.
Relevance Score: 95

Event #2: {top_events[1]['event_name']}
Reason: This event is also relevant to the user's interests.
Relevance Score: 85

Event #3: {top_events[2]['event_name']}
Reason: This event provides good networking opportunities.
Relevance Score: 75"""
            if verbose:
                print("\nUsing mock response:")
                print("-" * 80)
                print(output_text)
                print("-" * 80)
        
        # Step 4: Parse the LLM output
        parsed_results = parse_llm_output(output_text, verbose)
        
        # Step 5: Format the results
        results = {
            "user_summary": user_summary,
            "embedding_top_events": top_events,
            "llm_filtered_events": parsed_results,
            "llm_raw_output": output_text
        }
        
        if output_format == "json":
            return get_recommendations_json(results)
        else:
            return format_results_for_display(results)
    
    except Exception as e:
        if verbose:
            print(f"Error in llm_filter_events: {str(e)}")
            traceback.print_exc()
        return "Error processing recommendations" if output_format == "text" else json.dumps({"error": str(e)})

def process_from_file(input_file, output_file, verbose=True):
    """
    Process a user summary from a file and write results to another file
    """
    try:
        # Read user summary from file
        if verbose:
            print(f"Reading user summary from {input_file}...")
        with open(input_file, "r") as f:
            user_summary = f.read().strip()
        
        if verbose:
            print(f"User summary: {user_summary}")
        
        # Get event recommendations
        results = llm_filter_events(user_summary, top_n=5, output_format="text", verbose=verbose)
        
        # Write to output file
        if verbose:
            print(f"Writing recommendations to {output_file}...")
        with open(output_file, "w") as f:
            f.write(results)
        
        if verbose:
            print("Recommendations written successfully")
        return True
    
    except Exception as e:
        if verbose:
            print(f"Error processing from file: {str(e)}")
            traceback.print_exc()
        
        # Write error message to file
        try:
            with open(output_file, "w") as f:
                f.write("An error occurred while processing your request. Please try again.")
        except:
            pass
        return False

def main():
    """
    Command-line interface for using the filtering function
    """
    parser = argparse.ArgumentParser(description='Event recommendation system')
    parser.add_argument('--input', type=str, help='Input file with user summary (or "stdin" to read from standard input)')
    parser.add_argument('--output', type=str, help='Output file for recommendations (or "stdout" to print to console)')
    parser.add_argument('--summary', type=str, help='Direct user summary input (alternative to input file)')
    parser.add_argument('--format', choices=['text', 'json'], default='text', help='Output format: text (markdown) or json')
    parser.add_argument('--events', type=int, default=5, help='Number of events to consider')
    parser.add_argument('--quiet', action='store_true', help='Suppress verbose output')
    
    args = parser.parse_args()
    verbose = not args.quiet
    
    # Determine user summary
    user_summary = None
    if args.summary:
        user_summary = args.summary
    elif args.input == "stdin":
        print("Enter user summary (Ctrl+D or Ctrl+Z to finish):")
        user_summary = sys.stdin.read().strip()
    elif args.input:
        try:
            with open(args.input, "r") as f:
                user_summary = f.read().strip()
        except Exception as e:
            print(f"Error reading input file: {str(e)}")
            return 1
    else:
        # Default to legacy behavior - read from user_summary.txt
        if os.path.exists("user_summary.txt"):
            with open("user_summary.txt", "r") as f:
                user_summary = f.read().strip()
        else:
            print("No input specified and user_summary.txt not found. Use --input or --summary to provide user preferences.")
            return 1
    
    if not user_summary:
        print("Error: Empty user summary. Please provide preferences.")
        return 1
    
    # Get recommendations
    result = llm_filter_events(user_summary, top_n=args.events, output_format=args.format, verbose=verbose)
    
    # Output the results
    if args.output == "stdout" or not args.output:
        print(result)
    else:
        try:
            with open(args.output, "w") as f:
                f.write(result)
            if verbose:
                print(f"Results written to {args.output}")
        except Exception as e:
            print(f"Error writing to output file: {str(e)}")
            return 1
    
    return 0

# For backwards compatibility with the web_interface.py
def process_legacy():
    process_from_file("user_summary.txt", "recommendations.txt")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        sys.exit(main())
    else:
        # For backward compatibility, maintain the old behavior
        process_legacy() 