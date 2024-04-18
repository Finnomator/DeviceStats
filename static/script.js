cpuColor = "#31afcb"
memColor = "#758cef"
diskColor = "#218a8a"

window.Apex = {
    chart: {
        foreColor: "#fff", toolbar: {
            show: false
        }
    }, colors: [cpuColor, memColor, cpuColor], stroke: {
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
        decimalsInFloat: 2, opposite: true, labels: {
            offsetX: -10
        }
    }
};


async function getSystemStatus() {
    const response = await fetch('/sysinfo');
    return await response.json();
}

now = Date.now();
const optionsLine = {
    chart: {
        height: 350, type: "line", stacked: true, animations: {
            enabled: true, easing: "linear", dynamicAnimation: {
                speed: 1000
            }
        }, dropShadow: {
            enabled: false
        }, toolbar: {
            show: false
        }, zoom: {
            enabled: false
        }
    }, dataLabels: {
        enabled: false
    }, stroke: {
        curve: "straight", width: 1
    }, grid: {
        padding: {
            left: 0, right: 0
        }
    }, markers: {
        size: 0, hover: {
            size: 0
        }
    }, series: [{
        name: "CPU Usage", data: []
    }, {
        name: "Memory Usage", data: []
    }, {
        name: "Disk Usage", data: []
    }], xaxis: {
        type: "datetime"
    }, title: {
        text: "24 Hours", align: "left", style: {
            fontSize: "12px"
        }
    }, legend: {
        show: true, floating: true, horizontalAlign: "left", onItemClick: {
            toggleDataSeries: false
        }, position: "top", offsetY: -33, offsetX: 60
    }
};

const chartLine = new ApexCharts(document.querySelector("#linechart"), optionsLine);
chartLine.render();
const optionsProgress1 = {
    chart: {
        height: 70, type: "bar", stacked: true, sparkline: {
            enabled: true
        }
    }, plotOptions: {
        bar: {
            horizontal: true, barHeight: "20%", colors: {
                backgroundBarColors: ["#40475D"]
            }
        }
    }, colors: [cpuColor], stroke: {
        width: 0
    }, series: [{
        name: "CPU Usage", data: [0]
    }], title: {
        floating: true, offsetX: -10, offsetY: 5, text: "CPU Usage"
    }, subtitle: {
        floating: true, align: "right", offsetY: 0, text: "Awaiting...", style: {
            fontSize: "20px"
        }
    }, tooltip: {
        enabled: false
    }, xaxis: {
        categories: ["CPU Usage"]
    }, yaxis: {
        max: 100
    }, fill: {
        type: "full"
    }
};

const chartProgress1 = new ApexCharts(document.querySelector("#progress1"), optionsProgress1);
chartProgress1.render();

const optionsProgress2 = {
    chart: {
        height: 70, type: "bar", stacked: true, sparkline: {
            enabled: true
        }
    }, plotOptions: {
        bar: {
            horizontal: true, barHeight: "20%", colors: {
                backgroundBarColors: ["#40475D"]
            }
        }
    }, colors: [memColor], stroke: {
        width: 0
    }, series: [{
        name: "Memory Usage", data: [0]
    }], title: {
        floating: true, offsetX: -10, offsetY: 5, text: "Memory Usage"
    }, subtitle: {
        floating: true, align: "right", offsetY: 0, text: "Awaiting...", style: {
            fontSize: "20px"
        }
    }, tooltip: {
        enabled: false
    }, xaxis: {
        categories: ["Memory Usage"]
    }, yaxis: {
        max: 100
    }, fill: {
        type: "full"
    }
};

const chartProgress2 = new ApexCharts(document.querySelector("#progress2"), optionsProgress2);
chartProgress2.render();

const optionsProgress3 = {
    chart: {
        height: 70, type: "bar", stacked: true, sparkline: {
            enabled: true
        }
    }, plotOptions: {
        bar: {
            horizontal: true, barHeight: "20%", colors: {
                backgroundBarColors: ["#40475D"]
            }
        }
    }, colors: [diskColor], stroke: {
        width: 0
    }, series: [{
        name: "Disk Usage", data: [0]
    }], fill: {
        type: "full"
    }, title: {
        floating: true, offsetX: -10, offsetY: 5, text: "Disk Usage"
    }, subtitle: {
        floating: true, align: "right", offsetY: 0, text: "Awaiting...", style: {
            fontSize: "20px"
        }
    }, tooltip: {
        enabled: false
    }, xaxis: {
        categories: ["Disk Usage"]
    }, yaxis: {
        max: 100
    },
};

const chartProgress3 = new ApexCharts(document.querySelector("#progress3"), optionsProgress3);
chartProgress3.render();



let xOffset = now;

updateCharts();
window.setInterval(updateCharts, 5000);

async function updateCharts() {
    const status = await getSystemStatus();
    const cpuUsage = status["cpu_usage"]
    const memUsage = status["used_memory"] / status["total_memory"] * 100;
    const diskUsage = status["used_disk"] / status["total_disk"] * 100;

    setProgressOptions(chartProgress1, cpuUsage);
    setProgressOptions(chartProgress2, memUsage);
    setProgressOptions(chartProgress3, diskUsage);


    chartLine.updateSeries([{
        data: [...chartLine.w.config.series[0].data, [xOffset, cpuUsage]]
    }, {
        data: [...chartLine.w.config.series[1].data, [xOffset, memUsage]]
    }, {
        data: [...chartLine.w.config.series[2].data, [xOffset, diskUsage]]
    }]);

    xOffset += 5000;

}

function setProgressOptions(chart, progress) {
    if (typeof progress === 'number' && !isNaN(progress)) chart.updateOptions({
        series: [{
            data: [progress]
        }], subtitle: {
            text: Math.round(progress * 10) / 10 + "%"
        }
    }); else chart.updateOptions({
        series: [{
            data: [0]
        }], subtitle: {
            text: "Unavailable"
        }
    });
}