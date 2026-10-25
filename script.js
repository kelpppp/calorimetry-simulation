const metalPicker = document.getElementById("metalPicker");
const massPicker = document.getElementById("massPicker");
const massValue = document.getElementById("massValue");
const startBtn = document.getElementById("startBtn");
const resultDisplay = document.getElementById("result");

function updateMassLabel() {
    massValue.textContent = parseFloat(massPicker.value).toFixed(2);
}

function handleStart() {
    const metal = metalPicker.value;
    const mass = parseFloat(massPicker.value);
    const specHeat = METAL_SPECIFIC_HEATS[metal];

    if (specHeat === undefined || Number.isNaN(mass) || mass <= 0) {
        resultDisplay.textContent = "Please choose a metal and a mass.";
        return;
    }

    const result = runSimulation(mass, specHeat);

    drawCharts(result);

    console.log(`${metal}, ${mass} kg, c = ${specHeat}`);
    console.log("calculated T_f:", result.equilibriumTemp);
    console.log("final water/metal:",
        result.waterTempHistory.at(-1), result.metalTempHistory.at(-1));
    console.log("steps:", result.timeHistory.length - 1);

    resultDisplay.textContent =
        `Final equilibrium temperature: ${result.equilibriumTemp.toFixed(2)} °C`;
}

massPicker.addEventListener("input", updateMassLabel);
startBtn.addEventListener("click", handleStart);
updateMassLabel();

let tempChart = null;
let heatChart = null;

function toPoints(xs, ys) {
    return xs.map((x, i) => ({ x: x, y: ys[i] }));
}

function makeChart(canvasId, datasets, yTitle) {
    return new Chart(document.getElementById(canvasId), {
        type: "line",
        data: { datasets: datasets },
        options: {
            animation: false, 
            maintainAspectRatio: false,
            scales: {
                x: { type: "linear", title: { display: true, text: "Time (not to scale)" } },
                y: { title: { display: true, text: yTitle } }
            },
            elements: { point: { radius: 0 } }   // draw lines only, no dots
        }
    });
}

function drawCharts(result) {
    // destroy the old charts so they don't pile up on the same canvas
    if (tempChart) tempChart.destroy();
    if (heatChart) heatChart.destroy();

    tempChart = makeChart("tempChart", [
        { label: "Metal", data: toPoints(result.timeHistory, result.metalTempHistory),
          borderColor: "#c0392b" },
        { label: "Water", data: toPoints(result.timeHistory, result.waterTempHistory),
          borderColor: "#2980b9" }
    ], "Temperature (°C)");

    heatChart = makeChart("heatChart", [
        { label: "Metal", data: toPoints(result.timeHistory, result.heatLostHistory),
          borderColor: "#c0392b" }, 
        { label: "Water", data: toPoints(result.timeHistory, result.heatGainedHistory),
          borderColor: "#2980b9" }
    ], "Heat transferred (J)");
}
