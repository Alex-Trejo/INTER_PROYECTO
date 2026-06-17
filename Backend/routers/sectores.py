from fastapi import APIRouter, HTTPException
from database.connection import database
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api/sectores", tags=["Sectores"])

class SectorResponse(BaseModel):
    id: int
    nombre: str

@router.get("", response_model=List[SectorResponse])
async def obtener_sectores():
    query = "SELECT id, nombre FROM sectores ORDER BY id ASC"
    try:
        rows = await database.fetch_all(query=query)
        return [SectorResponse(id=row["id"], nombre=row["nombre"]) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo sectores: {str(e)}")
