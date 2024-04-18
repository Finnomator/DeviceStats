from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import system_info

app = FastAPI()
sys_reporter = system_info.SystemInfoReporter()


@app.get("/sysinfo")
async def system_status():
    return sys_reporter.get_data().json()


app.mount("/", StaticFiles(directory="static", html=True), name="static")
