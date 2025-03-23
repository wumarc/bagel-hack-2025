import os
import sys
import json
import argparse
from prompted_filtering_file import llm_filter_events

def process_input_text(input_text, top_n=3, format_type="text", verbose=False):
    """
    Process input text to get event recommendations
    
    Parameters:
    - input_text (str): User preferences/summary
    - top_n (int): Number of events to return
    - format_type (str): Output format ("text" or "json")
    - verbose (bool): Whether to show detailed logs
    
    Returns:
    - str: Formatted recommendations or JSON string
    """
    if not input_text or input_text.strip() == "":
        return "Error: No input text provided."
    
    try:
        # Call the llm_filter_events function from prompted_filtering_file
        results = llm_filter_events(
            user_summary=input_text,
            top_n=top_n,
            output_format=format_type,
            verbose=verbose
        )
        
        return results
    
    except Exception as e:
        error_msg = f"Error processing input: {str(e)}"
        if verbose:
            import traceback
            traceback.print_exc()
        
        return error_msg if format_type == "text" else json.dumps({"error": error_msg})

def process_from_file(input_file, output_file=None, top_n=3, format_type="text", verbose=False):
    """
    Process user preferences from a file and optionally write results to another file
    
    Parameters:
    - input_file (str): Path to input file containing user preferences
    - output_file (str, optional): Path to output file for recommendations
    - top_n (int): Number of events to return
    - format_type (str): Output format ("text" or "json")
    - verbose (bool): Whether to show detailed logs
    
    Returns:
    - str: Formatted recommendations or JSON string
    """
    try:
        # Read input file
        if verbose:
            print(f"Reading from {input_file}...")
        
        with open(input_file, 'r') as f:
            input_text = f.read().strip()
        
        # Process the input
        results = process_input_text(input_text, top_n, format_type, verbose)
        
        # Write to output file if specified
        if output_file:
            if verbose:
                print(f"Writing results to {output_file}...")
            
            with open(output_file, 'w') as f:
                f.write(results)
            
            if verbose:
                print(f"Results successfully written to {output_file}")
        
        return results
    
    except Exception as e:
        error_msg = f"Error processing file: {str(e)}"
        if verbose:
            import traceback
            traceback.print_exc()
        
        if output_file:
            try:
                with open(output_file, 'w') as f:
                    f.write(error_msg if format_type == "text" else json.dumps({"error": error_msg}))
            except:
                pass
        
        return error_msg if format_type == "text" else json.dumps({"error": error_msg})

def get_top_events_for_user(user_text, count=3, output_format="text", verbose=False):
    """
    Simple function to get top events for a user preference text
    
    Parameters:
    - user_text (str): User preferences/summary
    - count (int): Number of events to return (default: 3)
    - output_format (str): Output format ("text" or "json")
    - verbose (bool): Show detailed logs
    
    Returns:
    - str: Formatted recommendations or JSON string
    """
    return process_input_text(user_text, count, output_format, verbose)

def main():
    """
    Command-line interface
    """
    parser = argparse.ArgumentParser(description='Event Recommendation Connection Tool')
    parser.add_argument('--text', type=str, help='Direct input text with user preferences')
    parser.add_argument('--input', type=str, help='Input file path')
    parser.add_argument('--output', type=str, help='Output file path')
    parser.add_argument('--events', type=int, default=3, help='Number of events to return (default: 3)')
    parser.add_argument('--format', choices=['text', 'json'], default='text', help='Output format: text (markdown) or json')
    parser.add_argument('--verbose', action='store_true', help='Show detailed logs')
    
    args = parser.parse_args()
    
    # Check for input
    if not args.text and not args.input:
        print("Please provide either --text or --input parameter")
        return 1
    
    # Process based on input method
    if args.text:
        results = process_input_text(
            args.text, 
            args.events, 
            args.format, 
            args.verbose
        )
    else:
        results = process_from_file(
            args.input, 
            args.output, 
            args.events, 
            args.format, 
            args.verbose
        )
    
    # Output results if no output file specified
    if not args.output:
        print(results)
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 