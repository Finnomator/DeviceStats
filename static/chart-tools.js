function generatePast5Minutes() {
    let data = []
    const now = Date.now();
    for (let i = 60 * 5; i > 0; i--) {
        data.push([now - i * 5000, 0])
    }
    return data
}

function createLineChart(chartId) {
    const optionsLine = {
        chart: {
            height: 350, type: "area", animations: {
                enabled: false,
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
            name: "CPU Usage", data: generatePast5Minutes()
        }, {
            name: "Memory Usage", data: generatePast5Minutes()
        }, {
            name: "Disk Usage", data: generatePast5Minutes()
        }], xaxis: {
            type: "datetime"
        }, yaxis: {
            max: 100
        }, title: {
            text: "Past 5 Minutes", align: "left", style: {
                fontSize: "12px"
            }
        }, legend: {
            show: true, floating: true, horizontalAlign: "left", onItemClick: {
                toggleDataSeries: false
            }, position: "top", offsetY: -38, offsetX: 100
        }
    };
    const chartLine = new ApexCharts(document.getElementById(chartId), optionsLine);
    chartLine.render();
    return chartLine
}

function createProgressCharts(chartIds, labels, colors) {
    let progressCharts = []
    chartIds.forEach(function (chartId, i) {
        const chart = new ApexCharts(document.getElementById(chartIds[i]), {
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
            }, colors: [colors[i]], stroke: {
                width: 0
            }, series: [{
                name: labels[i], data: [0]
            }], title: {
                floating: true, offsetX: -10, offsetY: 5, text: labels[i]
            }, subtitle: {
                floating: true, align: "right", offsetY: 0, text: "Awaiting...", style: {
                    fontSize: "20px"
                }
            }, tooltip: {
                enabled: false
            }, xaxis: {
                categories: [labels[i]]
            }, yaxis: {
                max: 100
            }, fill: {
                type: "full"
            }
        })
        chart.render()
        progressCharts.push(chart)
    })
    return progressCharts
}

async function getSystemStatus(ip) {
    return await fetch(`http://${ip}/sysinfo`)
}

function setProgressOptions(chart, progress, subtitle) {
    if (typeof progress === 'number' && !isNaN(progress)) chart.updateOptions({
        series: [{
            data: [progress]
        }], subtitle: {
            text: subtitle
        }
    }); else chart.updateOptions({
        series: [{
            data: [0]
        }], subtitle: {
            text: "Unavailable"
        }
    });
}

async function updateCharts(ip, progressCharts, chartLine) {

    let error = false
    const response = await getSystemStatus(ip).catch(
        e => {
            error = true;
        }
    );

    if (error || !response.ok) {
        return
    }

    const status = await response.json()
    const cpuUsage = status["cpu_usage"]
    const memUsage = status["used_memory"] / status["total_memory"] * 100;
    const diskUsage = status["used_disk"] / status["total_disk"] * 100;

    setProgressOptions(progressCharts[0], cpuUsage, `${cpuUsage}%`);
    setProgressOptions(progressCharts[1], memUsage, `${status["used_memory"]}/${status["total_memory"]}MB`);
    setProgressOptions(progressCharts[2], diskUsage, `${status["used_disk"]}/${status["total_disk"]}GB`);

    const series = chartLine.w.config.series

    chartLine.updateSeries([{
        data: [...series[0].data.slice(-59), [series[0].data[series[0].data.length - 1][0] + 5000, cpuUsage]]
    }, {
        data: [...series[1].data.slice(-59), [series[1].data[series[1].data.length - 1][0] + 5000, memUsage]]
    }, {
        data: [...series[2].data.slice(-59), [series[2].data[series[2].data.length - 1][0] + 5000, diskUsage]]
    }]);
}