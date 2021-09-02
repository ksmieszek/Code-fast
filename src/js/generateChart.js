const wpm = [],
  accuracy = [],
  result = [];
let chartData,
  spentTyping = 0;

function prepareData() {
  for (const property in chartData) {
    wpm.push({ x: chartData[property].date, y: parseFloat(chartData[property].wpm) });
    accuracy.push({ x: chartData[property].date, y: parseFloat(chartData[property].accuracy) });
    result.push({ x: chartData[property].date, y: parseFloat(chartData[property].result) });
    spentTyping += parseInt(chartData[property].timeTyped);
  }
}

function generateChart() {
  JSC.Chart("statistics__chart", {
    type: "line",
    xAxis_scale_type: "time",
    xAxis_scale_interval: { unit: "month", multiplier: 2 },
    defaultTooltip_combined: true,
    defaultPoint_tooltip: `<span style="width:60px"> %seriesName </span> <b> %yValue </b>`,
    defaultTooltip_fill: ["white", "white", 90],
    defaultPoint_marker_visible: false,
    legend: {
      template: "%icon %name",
      margin: 20,
      defaultEntry_style: {
        fontSize: 14,
      },
    },
    series: [
      { name: "WPM", points: wpm },
      { name: "Accuracy", points: accuracy },
      { name: "Result", points: result },
    ],
  });
}

function generateLabels() {
  const averageAccuracy = (Math.floor(accuracy.reduce((accumulator, currentValue) => accumulator + currentValue.y, 0)) / accuracy.length).toFixed(1);
  const averageWPM = (wpm.reduce((accumulator, currentValue) => accumulator + currentValue.y, 0) / accuracy.length).toFixed(1);
  let spentTypingLabel;
  if (spentTyping < 60) spentTypingLabel = `${spentTyping} minutes`;
  else if (spentTyping >= 120) spentTypingLabel = `${Math.round(spentTyping / 60)} hours`;
  else spentTypingLabel = `1 hour`;

  const contentForLabels = [];
  contentForLabels.push({ name: "times typed", value: wpm.length });
  contentForLabels.push({ name: "spent typing", value: spentTypingLabel });
  contentForLabels.push({ name: "words typed", value: Math.round(spentTyping * averageWPM) });
  contentForLabels.push({ name: "average accuracy", value: `${averageAccuracy} %` });
  contentForLabels.push({ name: "average speed", value: `${averageWPM} WPM` });
  contentForLabels.push({ name: "best speed", value: `${wpm.reduce((prev, current) => (prev.y > current.y ? prev : current)).y.toFixed(1)} WPM` });

  contentForLabels.forEach((item) => {
    const div = document.createElement("div");
    const p1 = document.createElement("p");
    const p2 = document.createElement("p");
    p1.innerHTML = item.name;
    p2.innerHTML = item.value;
    div.appendChild(p1);
    div.appendChild(p2);
    document.querySelector("#statistics__labels").appendChild(div);
  });
}

(function () {
  if (localStorage.getItem("chartData") == null) return;
  chartData = Object.values(JSON.parse(localStorage.getItem("chartData")));
  prepareData();
  generateLabels();
  generateChart();
})();
