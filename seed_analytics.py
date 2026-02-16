import sys
import os

# Add Backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'Backend')))

from database import SessionLocal
from models import Chatbot, Visit, Conversation, Message, User
from datetime import datetime, timedelta, timezone
import random
import uuid

def seed_data():
    db = SessionLocal()
    try:
        # Get a chatbot
        bot = db.query(Chatbot).first()
        if not bot:
            print("No chatbot found. Please create one first.")
            return

        print(f"Seeding data for chatbot: {bot.name} ({bot.id})")

        now = datetime.now(timezone.utc)
        
        for i in range(7):
            day = now - timedelta(days=i)
            # Random visits (between 20 and 100)
            visit_count = random.randint(20, 100)
            for _ in range(visit_count):
                visit_time = day - timedelta(hours=random.randint(0, 23), minutes=random.randint(0, 59))
                visit = Visit(
                    chatbot_id=bot.id,
                    session_id=str(uuid.uuid4()),
                    created_at=visit_time
                )
                db.add(visit)
            
            # Random conversations (between 5 and 20)
            conv_count = random.randint(5, 20)
            for _ in range(conv_count):
                conv_time = day - timedelta(hours=random.randint(0, 23), minutes=random.randint(0, 59))
                conv = Conversation(
                    chatbot_id=bot.id,
                    session_id=str(uuid.uuid4()),
                    visitor_name=random.choice(["Alice", "Bob", "Charlie", "Visitor"]),
                    started_at=conv_time,
                    updated_at=conv_time
                )
                db.add(conv)
                db.flush() # To get conv.id

                # Add some messages to each conversation
                msg_count = random.randint(2, 6)
                for j in range(msg_count):
                    msg_time = conv_time + timedelta(minutes=j*2)
                    msg = Message(
                        conversation_id=conv.id,
                        sender="user" if j % 2 == 0 else "bot",
                        content="Test message contents" if j % 2 == 0 else "Bot response",
                        created_at=msg_time
                    )
                    db.add(msg)

        db.commit()
        print("Successfully seeded analytics data for the last 7 days.")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
