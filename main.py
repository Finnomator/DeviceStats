from fastapi import FastAPI
from fastapi.responses import ORJSONResponse
from fastapi.staticfiles import StaticFiles
import system_info

app = FastAPI(default_response_class=ORJSONResponse)
sys_reporter = system_info.SystemInfoReporter()
sys_reporter.start()


@app.get("/sysinfo")
async def system_status():
    return sys_reporter.get_data()


app.mount("/", StaticFiles(directory="static", html=True), name="static")
