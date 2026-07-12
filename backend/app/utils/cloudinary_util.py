"""Cloudinary image upload utilities."""

from app.config import settings


def configure_cloudinary():
    """Configure Cloudinary SDK. Call once at startup."""
    if not all([settings.CLOUDINARY_CLOUD_NAME, settings.CLOUDINARY_API_KEY, settings.CLOUDINARY_API_SECRET]):
        print("[CLOUDINARY] Not configured - image uploads will be stubbed")
        return False
    try:
        import cloudinary
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
        )
        return True
    except ImportError:
        print("[CLOUDINARY] cloudinary package not installed")
        return False


def upload_image(file_data, folder: str = "skillswap") -> dict:
    """Upload an image to Cloudinary. Returns dict with url and public_id."""
    try:
        import cloudinary.uploader
        result = cloudinary.uploader.upload(
            file_data,
            folder=folder,
            transformation={"quality": "auto", "fetch_format": "auto"},
        )
        return {"url": result["secure_url"], "public_id": result["public_id"]}
    except Exception as e:
        print(f"[CLOUDINARY ERROR] {e}")
        return {"url": None, "public_id": None}


def delete_image(public_id: str) -> bool:
    """Delete an image from Cloudinary."""
    try:
        import cloudinary.uploader
        cloudinary.uploader.destroy(public_id)
        return True
    except Exception as e:
        print(f"[CLOUDINARY ERROR] {e}")
        return False
