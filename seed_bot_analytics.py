import sys
import os

# Add Backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'Backend')))

from database import SessionLocal
from models import Chatbot, Visit, Conversation, Message, User, Usage
from datetime import datetime, timedelta, timezone
import random
import uuid

def seed_data():
    db = SessionLocal()
    try:
        # Get all chatbots
        bots = db.query(Chatbot).all()
        if not bots:
            print("No chatbots found. Please create some first.")
            return

        print(f"Seeding data for {len(bots)} chatbots...")

        now = datetime.now(timezone.utc)
        
        for bot in bots:
            print(f"Seeding {bot.name} ({bot.id})...")
            for i in range(7):
                day = now - timedelta(days=i)
                # Random visits (between 10 and 50 per bot)
                visit_count = random.randint(10, 50)
                for _ in range(visit_count):
                    visit_time = day - timedelta(hours=random.randint(0, 23), minutes=random.randint(0, 59))
                    visit = Visit(
                        chatbot_id=bot.id,
                        session_id=str(uuid.uuid4()),
                        created_at=visit_time
                    )
                    db.add(visit)
                
                # Random conversations and usage
                conv_count = random.randint(2, 10)
                for _ in range(conv_count):
                    conv_time = day - timedelta(hours=random.randint(0, 23), minutes=random.randint(0, 59))
                    
                    # Add Usage record (triggered on close)
                    usage = Usage(
                        chatbot_id=bot.id,
                        session_id=str(uuid.uuid4()),
                        created_at=conv_time + timedelta(minutes=10) # closed later
                    )
                    db.add(usage)

                    conv = Conversation(
                        chatbot_id=bot.id,
                        session_id=str(uuid.uuid4()),
                        visitor_name=random.choice(["Visitor A", "Visitor B", "Anon"]),
                        started_at=conv_time,
                        updated_at=conv_time
                    )
                    db.add(conv)
                    db.flush()

                    msg_count = random.randint(2, 4)
                    for j in range(msg_count):
                        msg_time = conv_time + timedelta(minutes=j*2)
                        msg = Message(
                            conversation_id=conv.id,
                            sender="user" if j % 2 == 0 else "bot",
                            content="Query" if j % 2 == 0 else "Answer",
                            created_at=msg_time
                        )
                        db.add(msg)

        db.commit()
        print("Successfully seeded analytics data for all bots for the last 7 days.")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
