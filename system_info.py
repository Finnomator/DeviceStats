import time
from typing import Optional

from pydantic import BaseModel
from subprocess import check_output
from threading import Thread


class SystemInfoReport(BaseModel):
    cpu_temp: Optional[float] = None  # °C
    cpu_usage: Optional[float] = None  # 0..1
    total_memory: Optional[int] = None  # MB
    used_memory: Optional[int] = None  # MB
    total_disk: Optional[int] = None  # GB
    used_disk: Optional[int] = None  # GB


class SystemInfoReporter:
    CMDS = {
        "cpu_temp": "vcgencmd measure_temp | cut -c 6-9 | awk '{printf $1}'",  # °C
        "cpu_usage": "top -n 1 -b | grep \"Cpu(s)\" | awk '{printf $2 + $4}'",  # %
        "memory_usage": "free -m | awk 'NR==2{printf \"%s/%s\", $3,$2}'",  # MB
        "disk_usage": "df -h | awk '$NF==\"/\"{printf \"%d/%d\", $3,$2}'"  # GB
    }

    _current_data = None
    _run = True
    _thread = None

    def __init__(self, update_delay_ms=500):
        self.update_delay_ms = update_delay_ms
        self.cmd_list = list(self.CMDS.values())
        self.all_cmd = " && printf \"\\n\" && ".join(self.cmd_list)

    def start(self):
        self._run = True
        self._thread = Thread(target=self._update_cycle)
        self._thread.start()

    def stop(self):
        self._run = False
        self._thread.join()

    def get_data(self):
        return self._current_data

    def _get_data(self):
        output = check_output(self.all_cmd, shell=True).decode("ascii").split("\n")
        data = SystemInfoReport()
        line: str
        for i, line in enumerate(output):
            cmd = self.cmd_list[i]
            if cmd == "cpu_temp":
                data.cpu_temp = float(line)
            elif cmd == "cpu_usage":
                data.cpu_usage = float(line) / 100
            elif cmd == "memory_usage":
                s = line.split("/")
                data.used_memory = int(s[0])
                data.total_memory = int(s[1])
            elif cmd == "disk_usage":
                s = line.split("/")
                data.used_disk = int(s[0])
                data.total_disk = int(s[1])
        return data

    def _update_cycle(self):
        while self._run:
            self._current_data = self._get_data()
            time.sleep(self.update_delay_ms)
