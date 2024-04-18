import time

from pydantic import BaseModel
from subprocess import check_output
from threading import Thread


class SystemInfoReport(BaseModel):
    cpu_temp: float  # °C
    cpu_usage: float  # 0..1
    total_memory: int  # MB
    used_memory: int  # MB
    total_disk: int  # GB
    used_disk: int  # GB


class SystemInfoReporter:
    CMDS = [
        "vcgencmd measure_temp | cut -c 6-9 | awk '{printf $1}'",  # °C
        "top -n 1 -b | grep \"Cpu(s)\" | awk '{printf $2 + $4}'",  # %
        "free -m | awk 'NR==2{printf \"%s/%s\", $3,$2}'",  # MB
        "df -h | awk '$NF==\"/\"{printf \"%d/%d\", $3,$2}'"  # GB
    ]

    _current_data = None
    _run = True
    _thread = None

    def __init__(self, update_delay_ms=500):
        self.update_delay_ms = update_delay_ms
        self.all_cmd = " && printf \"\\n\" && ".join(self.CMDS)

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
        s = output[2].split("/")
        s1 = output[3].split("/")
        return SystemInfoReport(cpu_temp=float(output[0]), cpu_usage=float(output[1]), used_memory=int(s[0]),
                                total_memory=int(s[1]), used_disk=int(s1[0]), total_disk=int(s1[1]))

    def _update_cycle(self):
        while self._run:
            self._current_data = self._get_data()
            time.sleep(self.update_delay_ms / 1000)
