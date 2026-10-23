from storage.db import SessionLocal, engine
from storage import models

def seed_data():
    db = SessionLocal()
    try:
        # Check if items already exist
        if db.query(models.Product).first():
            print("Database already contains data. Skipping seed.")
            return

        mock_products = [
            models.Product(
                canonical_name="Gateron Oil King Switches (35 Pack)",
                brand="Gateron",
                type="switch",
                min_price=21.00,
                handle="gateron-oil-king-switches",
                product_type_raw="switches"
            ),
            models.Product(
                canonical_name="Keychron Q1 Pro Custom Keyboard",
                brand="Keychron",
                type="keyboard",
                min_price=199.99,
                handle="keychron-q1-pro",
                product_type_raw="keyboards"
            ),
            models.Product(
                canonical_name="GMK Bento R2 Keycap Set",
                brand="GMK",
                type="keycaps",
                min_price=140.00,
                handle="gmk-bento-r2",
                product_type_raw="keycaps"                
            )
        ]

        db.add_all(mock_products)
        db.commit()
        print("Database successfully seeded!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()