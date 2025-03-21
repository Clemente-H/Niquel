from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Project Manager API",
    description="API para el sistema de gestión de proyectos",
    version="0.1.0",
)

# Configurar CORS
origins = [
    "http://localhost:3000",  # Frontend en desarrollo
    "http://frontend:3000",   # Frontend en Docker
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Bienvenido a la API de Project Manager"}

@app.get("/api/status")
async def check_status():
    return {
        "status": "online",
        "version": "0.1.0"
    }

# Aquí importaremos las rutas cuando las creemos
# from app.api.routes import users, projects, auth