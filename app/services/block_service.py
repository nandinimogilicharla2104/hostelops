from sqlalchemy.orm import Session

from app.models.block import Block
from app.schemas.block import BlockCreate


def create_block(
    db: Session,
    block_data: BlockCreate
) -> Block:

    block = Block(
        name=block_data.name,
        hostel_id=block_data.hostel_id
    )

    db.add(block)
    db.commit()
    db.refresh(block)

    return block

def get_all_blocks(db: Session) -> list[Block]:
    return db.query(Block).all()


def get_block_by_id(
    db: Session,
    block_id: int
) -> Block | None:

    return (
        db.query(Block)
        .filter(Block.id == block_id)
        .first()
    )