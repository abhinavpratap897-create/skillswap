"""Skills and Categories router."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.skill import Skill, Category, UserSkill
from app.schemas.schemas import (
    SkillResponse, SkillCreateRequest, CategoryResponse, CategoryCreateRequest,
    UserSkillResponse, UserSkillCreateRequest,
)
from app.utils.security import get_current_user, get_admin_user

router = APIRouter(prefix="/api/skills", tags=["Skills"])


# ─── Categories ─────────────────────────────────────────────
@router.get("/categories", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).filter(Category.is_active == True).all()
    return [CategoryResponse.model_validate(c) for c in categories]


@router.post("/categories", response_model=CategoryResponse, status_code=201)
def create_category(data: CategoryCreateRequest, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    category = Category(**data.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return CategoryResponse.model_validate(category)


# ─── Skills ─────────────────────────────────────────────────
@router.get("/", response_model=List[SkillResponse])
def list_skills(category_id: str = None, db: Session = Depends(get_db)):
    query = db.query(Skill).options(joinedload(Skill.category)).filter(Skill.is_active == True)
    if category_id:
        query = query.filter(Skill.category_id == category_id)
    skills = query.all()
    return [SkillResponse.model_validate(s) for s in skills]


@router.post("/", response_model=SkillResponse, status_code=201)
def create_skill(data: SkillCreateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(Skill).filter(Skill.slug == data.slug).first()
    if existing:
        return SkillResponse.model_validate(existing)
    skill = Skill(**data.model_dump())
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return SkillResponse.model_validate(skill)


@router.get("/{skill_id}", response_model=SkillResponse)
def get_skill(skill_id: str, db: Session = Depends(get_db)):
    skill = db.query(Skill).options(joinedload(Skill.category)).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return SkillResponse.model_validate(skill)


# ─── User Skills ────────────────────────────────────────────
@router.get("/user/my-skills", response_model=List[UserSkillResponse])
def get_my_skills(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_skills = db.query(UserSkill).options(
        joinedload(UserSkill.skill).joinedload(Skill.category)
    ).filter(UserSkill.user_id == current_user.id).all()
    return [UserSkillResponse.model_validate(us) for us in user_skills]


@router.post("/user/my-skills", response_model=UserSkillResponse, status_code=201)
def add_user_skill(
    data: UserSkillCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    skill = db.query(Skill).filter(Skill.id == data.skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    existing = db.query(UserSkill).filter(
        UserSkill.user_id == current_user.id, UserSkill.skill_id == data.skill_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Skill already added")

    user_skill = UserSkill(user_id=current_user.id, **data.model_dump())
    db.add(user_skill)
    db.commit()
    db.refresh(user_skill)
    user_skill = db.query(UserSkill).options(
        joinedload(UserSkill.skill).joinedload(Skill.category)
    ).filter(UserSkill.id == user_skill.id).first()
    return UserSkillResponse.model_validate(user_skill)


@router.delete("/user/my-skills/{user_skill_id}")
def remove_user_skill(user_skill_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_skill = db.query(UserSkill).filter(
        UserSkill.id == user_skill_id, UserSkill.user_id == current_user.id
    ).first()
    if not user_skill:
        raise HTTPException(status_code=404, detail="User skill not found")
    db.delete(user_skill)
    db.commit()
    return {"message": "Skill removed"}
