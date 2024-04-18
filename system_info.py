from pydantic import BaseModel
from subprocess import check_output


class SystemInfoReport(BaseModel):
    cpu_temp: str
    cpu_usage: str
    memory_usage: str
    disk_usage: str


class SystemInfoReporter:
    cpu_temp_cmd = "vcgencmd measure_temp | cut -c 6-9 | awk '{printf $1}'"  # °C
    cpu_usage_cmd = "top -n 1 -b | grep \"Cpu(s)\" | awk '{printf $2 + $4}'"  # %
    memory_usage_cmd = "free -m | awk 'NR==2{printf \"%s/%s\", $3,$2}'"  # MB
    disk_usage_cmd = "df -h | awk '$NF==\"/\"{printf \"%d/%d\", $3,$2}'"  # GB

    def __init__(self):
        self.all_cmd = " && printf \"\\n\" && ".join(
            [self.cpu_temp_cmd, self.cpu_usage_cmd, self.memory_usage_cmd, self.disk_usage_cmd])

    def get_data(self):
        output = check_output(self.all_cmd, shell=True).decode("ascii").split("\n")
        return SystemInfoReport(cpu_temp=output[0], cpu_usage=output[1], memory_usage=output[2], disk_usage=output[3])
