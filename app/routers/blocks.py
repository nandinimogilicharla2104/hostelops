from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.block import BlockCreate, BlockResponse
from app.services.block_service import (
    create_block,
    get_all_blocks,
    get_block_by_id
)

router = APIRouter(
    prefix="/blocks",
    tags=["Blocks"]
)


@router.post(
    "",
    response_model=BlockResponse,
    status_code=status.HTTP_201_CREATED
)
def create_block_endpoint(
    block_data: BlockCreate,
    db: Session = Depends(get_db)
):
    return create_block(
        db,
        block_data
    )

@router.get(
    "",
    response_model=list[BlockResponse]
)
def get_blocks(
    db: Session = Depends(get_db)
):
    return get_all_blocks(db)

@router.get(
    "/{block_id}",
    response_model=BlockResponse
)
def get_block(
    block_id: int,
    db: Session = Depends(get_db)
):
    block = get_block_by_id(db, block_id)

    if block is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Block not found"
        )

    return block