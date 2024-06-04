from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import datetime
import pytz
from dateutil import parser

app = FastAPI()

origins = [
    "*",
]

class Imc(BaseModel):
    kg: float
    height: float
    created_at: datetime.datetime  

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def create_imc(imc: Imc):
    conn = sqlite3.connect('imc.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS imc
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, kg REAL, height REAL, imc REAL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    current_imc = round(imc.kg / ((imc.height / 100) ** 2), 2)
    created_at = datetime.datetime.now(pytz.timezone('America/New_York'))
    c.execute("INSERT INTO imc (kg, height, imc, created_at) VALUES (?, ?, ?, ?)", (imc.kg, imc.height, current_imc, created_at))
    conn.commit()
    conn.close()
    return current_imc

def format_date(created_at):
    created_at = parser.parse(created_at)
    return created_at.strftime('%d/%m/%Y - %H:%M')

@app.get("/")
async def main():
    return {"message": "Hello World"}

@app.post("/imc/")
async def calculate_imc(imc: Imc):
    if imc.height != 0:  
        return create_imc(imc)
    else:
        raise HTTPException(status_code=400, detail="Height cannot be zero")

def get_all_imc():
    conn = sqlite3.connect('imc.db')
    c = conn.cursor()
    c.execute("SELECT * FROM imc")
    imc_data = c.fetchall()
    conn.close()
    return imc_data

@app.get("/all_imc/")
async def get_all_imc_route():
    imc_data = get_all_imc()
    formatted_imc_data = [(row[0], row[1], row[2], row[3], format_date(row[4])) for row in imc_data]
    return formatted_imc_data
