const cpuTempP = document.getElementById('cpuTemp');
const cpuUsageP = document.getElementById('cpuUsage');
const memUsageP = document.getElementById('memUsage');
const diskUsageP = document.getElementById('diskUsage');

async function updateSystemStatus() {
    const response = await fetch('/sysinfo');
    const info = await response.json();
    cpuTempP.innerText = `CPU Temp: ${info["cpu_temp"]}°C`;
    cpuUsageP.innerText = `CPU Usage: ${info["cpu_usage"]}%`;
    memUsageP.innerText = `Memory Usage: ${info["memory_usage"]}MB`;
    diskUsageP.innerText = `Disk Usage: ${info["disk_usage"]}GB`;
}

await updateSystemStatus();
// Update the message every two seconds
setInterval(updateSystemStatus, 5000);
