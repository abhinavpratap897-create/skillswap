"""Messages router."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.models.message import Conversation, Message
from app.models.notification import Notification, NotificationType
from app.schemas.schemas import (
    ConversationResponse, MessageResponse, MessageCreateRequest,
    ConversationCreateRequest, UserResponse,
)
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/messages", tags=["Messages"])


@router.get("/conversations", response_model=List[ConversationResponse])
def list_conversations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conversations = db.query(Conversation).options(
        joinedload(Conversation.participant_one),
        joinedload(Conversation.participant_two),
    ).filter(
        or_(
            Conversation.participant_one_id == current_user.id,
            Conversation.participant_two_id == current_user.id,
        )
    ).order_by(Conversation.last_message_at.desc()).all()

    results = []
    for conv in conversations:
        last_msg = db.query(Message).filter(
            Message.conversation_id == conv.id
        ).order_by(Message.created_at.desc()).first()

        unread = db.query(Message).filter(
            Message.conversation_id == conv.id,
            Message.sender_id != current_user.id,
            Message.is_read == False,
        ).count()

        results.append(ConversationResponse(
            id=conv.id,
            participant_one=UserResponse.model_validate(conv.participant_one),
            participant_two=UserResponse.model_validate(conv.participant_two),
            last_message_at=conv.last_message_at,
            last_message=last_msg.content[:100] if last_msg else None,
            unread_count=unread,
        ))
    return results


@router.post("/conversations", response_model=ConversationResponse, status_code=201)
def create_conversation(
    data: ConversationCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Check if conversation exists
    existing = db.query(Conversation).filter(
        or_(
            (Conversation.participant_one_id == current_user.id) & (Conversation.participant_two_id == data.recipient_id),
            (Conversation.participant_one_id == data.recipient_id) & (Conversation.participant_two_id == current_user.id),
        )
    ).first()

    if existing:
        return ConversationResponse(
            id=existing.id,
            participant_one=UserResponse.model_validate(existing.participant_one),
            participant_two=UserResponse.model_validate(existing.participant_two),
            last_message_at=existing.last_message_at,
        )

    recipient = db.query(User).filter(User.id == data.recipient_id).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="User not found")

    conv = Conversation(
        participant_one_id=current_user.id,
        participant_two_id=data.recipient_id,
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    conv = db.query(Conversation).options(
        joinedload(Conversation.participant_one),
        joinedload(Conversation.participant_two),
    ).filter(Conversation.id == conv.id).first()

    return ConversationResponse(
        id=conv.id,
        participant_one=UserResponse.model_validate(conv.participant_one),
        participant_two=UserResponse.model_validate(conv.participant_two),
        last_message_at=conv.last_message_at,
    )


@router.get("/conversations/{conversation_id}", response_model=List[MessageResponse])
def get_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if current_user.id not in [conv.participant_one_id, conv.participant_two_id]:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Mark messages as read
    db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.sender_id != current_user.id,
        Message.is_read == False,
    ).update({"is_read": True})
    db.commit()

    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.asc()).all()

    return [MessageResponse.model_validate(m) for m in messages]


@router.post("/conversations/{conversation_id}", response_model=MessageResponse, status_code=201)
def send_message(
    conversation_id: str,
    data: MessageCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if current_user.id not in [conv.participant_one_id, conv.participant_two_id]:
        raise HTTPException(status_code=403, detail="Not authorized")

    message = Message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        content=data.content,
    )
    db.add(message)

    conv.last_message_at = datetime.utcnow()

    # Notify recipient
    recipient_id = conv.participant_two_id if conv.participant_one_id == current_user.id else conv.participant_one_id
    notification = Notification(
        user_id=recipient_id,
        type=NotificationType.NEW_MESSAGE,
        title="New Message",
        message=f"{current_user.first_name}: {data.content[:50]}",
        link=f"/messages/{conversation_id}",
    )
    db.add(notification)
    db.commit()
    db.refresh(message)
    return MessageResponse.model_validate(message)
