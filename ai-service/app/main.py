import logging
from fastapi import FastAPI
from app.routes import router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

app = FastAPI(
    title="FieldCam AI Service",
    description="Standalone image quality analysis microservice for FieldCam",
    version="1.0.0",
)

app.include_router(router)


if __name__ == "__main__":
    import uvicorn
    from app.config import settings

    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)
