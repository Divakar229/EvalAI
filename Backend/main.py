from fastapi import FastAPI,APIRouter
from fastapi.middleware.cors import CORSMiddleware
from routers import auth,evaluate,results
from db.database import Base,engine


app=FastAPI(
    title="Eval-AI"
)
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-vercel-app.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True 
)

app.include_router(auth.router)
app.include_router(evaluate.router)
app.include_router(results.router)

@app.get('/')
def root():
    return {"message":"Eval-AI running"}
