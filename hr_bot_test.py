import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_question_endpoint():
    history = []
    asked_questions = set()

    print("--- Starting HR Bot Endpoint Test ---")

    for i in range(12): # Test for 10 questions + 2 extra calls
        print(f"\n--- Request {i+1} ---")
        try:
            response = requests.post(f"{BASE_URL}/aeon/question", json={"history": history})
            response.raise_for_status() # Raise an exception for bad status codes

            data = response.json()
            print(f"Response: {data}")

            if not data.get("questions"):
                print("No more questions.")
                if i < 10:
                    print(f"ERROR: Stopped prematurely at question {i+1}")
                break

            question_text = data["questions"][0]["text"]
            if question_text in asked_questions:
                print(f"ERROR: Duplicate question found: {question_text}")
            else:
                print(f"OK: New question: {question_text}")
                asked_questions.add(question_text)

            # Add a dummy answer to history to simulate user progression
            history.append({"question": question_text, "answer": "Test answer"})

        except requests.exceptions.RequestException as e:
            print(f"ERROR: Could not connect to the server: {e}")
            print("Please make sure the backend server is running.")
            break
        except json.JSONDecodeError:
            print(f"ERROR: Failed to decode JSON from response: {response.text}")
            break

    print("\n--- Test Summary ---")
    print(f"Total unique questions received: {len(asked_questions)}")
    if len(asked_questions) == 10:
        print("SUCCESS: Received 10 unique questions.")
    else:
        print(f"FAILURE: Expected 10 unique questions, but got {len(asked_questions)}.")

if __name__ == "__main__":
    test_question_endpoint()
