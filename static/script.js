const mainDiv = document.getElementById("main");

const cpuColor = "#31afcb"
const memColor = "#758cef"
const diskColor = "#218a8a"
const colors = [cpuColor, memColor, diskColor]
const labels = ["CPU Usage", "Memory Usage", "Disk Usage"]

window.Apex = {
    chart: {
        foreColor: "#fff", toolbar: {
            show: false
        }
    }, colors: [cpuColor, memColor, diskColor], stroke: {
        width: 3
    }, dataLabels: {
        enabled: false
    }, grid: {
        borderColor: "#40475D"
    }, xaxis: {
        axisTicks: {
            color: "#333"
        }, axisBorder: {
            color: "#333"
        }
    }, fill: {
        type: "full"
    }, tooltip: {
        theme: "dark"
    }, yaxis: {
        decimalsInFloat: 1, opposite: true, labels: {
            offsetX: -10
        }
    }
};


async function checkOnlineStatus(ip, onlineStatusDiv, piHoleOnlineStatusSpan) {
    const reachable = await fetch(`http://${ip}`, {method: "HEAD"})
        .then(() => {
            return true;
        })
        .catch(() => {
            return false;
        });
    const piHoleReachable = await fetch(`http://${ip}/admin/api.php` ,  {method: "HEAD" })
        .then(response => {
            console.log(response.status)
            return response.ok || response.status === 401;
        })
        .catch(error => {
            console.log(error)
            return false;
        });

    onlineStatusDiv.style.backgroundColor = reachable ? "#07cb07" : "#d20707"
    piHoleOnlineStatusSpan.style.backgroundColor = piHoleReachable ? "#07cb07" : "#d20707"
}


async function main() {

    const resp = await fetch("/available-pis").catch()
    const piIps = await resp.json()

    let piData = {}
    Object.entries(piIps).forEach(function ([name, ip], i) {

        const lineChartId = `lineChart${i}`
        const progressChartIds = [`progress${i}0`, `progress${i}1`, `progress${i}2`]
        const onlineStatusId = `onlineStatus${i}`
        const piHoleOnlineStatusId = `piHoleOnlineStatus${i}`

        piData[ip] = {}
        piData[ip]["onlineStatusId"] = onlineStatusId
        piData[ip]["piHoleOnlineStatusId"] = piHoleOnlineStatusId
        piData[ip]["lineChartId"] = lineChartId
        piData[ip]["progressChartIds"] = progressChartIds

        mainDiv.innerHTML += `<details>
        <summary>
            <img alt="Pi" class="icon" height="55px" src="assets/imgs/raspberry-pi.svg" style="padding: 10px">
            <div id="${onlineStatusId}" style="width: 20px; height: 20px; background-color: grey; margin: 10px; border-radius: 20px"></div>
            ${name}
            <span id="${piHoleOnlineStatusId}" style="padding: 3px 10px 3px 10px;font-size: 20px; background-color: grey; border-radius: 20px; margin-left: 20px">Pi Hole</span>
            <span style="margin-left: auto; margin-right: 10px">${ip}</span>
        </summary>

        <div class="col">
            <div class="box mt-4">
                <div class="mt-4">
                    <div id="${progressChartIds[0]}"></div>
                </div>
                <div class="mt-4">
                    <div id="${progressChartIds[1]}"></div>
                </div>
                <div class="mt-4">
                    <div id="${progressChartIds[2]}"></div>
                </div>
            </div>
            <div class="box mt-4">
                <div id="${lineChartId}"></div>
            </div>
        </div>
      </details>`
    })

    for (const ip of Object.keys(piData)) {
        piData[ip]["lineChart"] = createLineChart(piData[ip]["lineChartId"])
        piData[ip]["progressCharts"] = createProgressCharts(piData[ip]["progressChartIds"], labels, colors)
        piData[ip]["onlineStatus"] = document.getElementById(piData[ip]["onlineStatusId"])
        piData[ip]["piHoleOnlineStatus"] = document.getElementById(piData[ip]["piHoleOnlineStatusId"])
    }

    for (const ip of Object.keys(piData)) {
        await updateCharts(ip, piData[ip]["progressCharts"], piData[ip]["lineChart"], piData[ip]["onlineStatus"])
        await checkOnlineStatus(ip, piData[ip]["onlineStatus"], piData[ip]["piHoleOnlineStatus"])
    }
    window.setInterval(function () {
        for (const ip of Object.keys(piData)) {
            updateCharts(ip, piData[ip]["progressCharts"], piData[ip]["lineChart"])
            checkOnlineStatus(ip, piData[ip]["onlineStatus"], piData[ip]["piHoleOnlineStatus"])
        }
    }, 5000)
}

main()
