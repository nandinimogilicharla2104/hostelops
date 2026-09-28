from sqlalchemy.orm import Session

from app.models.notification import Notification

import logging

logger = logging.getLogger(__name__)


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str
) -> Notification:

    notification = Notification(
        user_id=user_id,
        title=title,
        message=message
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    logger.info(
        "Notification created for user %s: %s",
        user_id,
        title
    )
    
    return notification

def get_user_notifications(
    db: Session,
    user_id: int
) -> list[Notification]:

    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .all()
    )

def mark_notification_as_read(
    db: Session,
    notification_id: int,
    user_id: int
) -> Notification | None:

    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        )
        .first()
    )

    if notification is None:
        return None

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return notification