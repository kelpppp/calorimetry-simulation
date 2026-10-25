// CONSTANTS
const MASS_WATER = 0.2; 
const SPEC_HEAT_WATER = 4186; 
const INIT_TEMP_WATER = 20; 
const INIT_TEMP_METAL = 100; 

const dt = 0.05;
const STOP_TOLERANCE = 0.001;
const HEAT_FLOW_CONSTANT = 1;
const MAX_STEPS = 50000;

const METAL_SPECIFIC_HEATS = {
    iron: 452,
    aluminum: 900,
    copper: 387,
    lead: 128,
    silver: 235
};

// RESET FUNCTION: rewrite later
// function resetSimulation() {
//     equilibriumTemp = getEquilibriumTemp(metalMass, metalSpecHeat);
//     maxHeatTransferred = getMaxHeatTransferred(equilibriumTemp);
//     state = { currentWaterTemp: INIT_TEMP_WATER, currentMetalTemp: INIT_TEMP_METAL, currentHeatTransferred: 0, timeElapsed: 0 };
// }

// PHYSICS FUNCTIONS
function getEquilibriumTemp(metalMass, metalSpecHeat) {
    return ((metalMass * metalSpecHeat * INIT_TEMP_METAL + MASS_WATER * SPEC_HEAT_WATER * INIT_TEMP_WATER) / (metalMass * metalSpecHeat + MASS_WATER * SPEC_HEAT_WATER));
}

function getMaxHeatTransferred(equilibriumTemp) {
    return ((MASS_WATER * SPEC_HEAT_WATER) * (equilibriumTemp - INIT_TEMP_WATER));
}

function step(state, dt, metalMass, metalSpecHeat) {
    let tempHot = state.currentMetalTemp;
    let tempCold = state.currentWaterTemp;
    let curHeatGained = state.currentHeatGained;
    let curHeatLost = state.currentHeatLost;
    let curTempDiff = tempHot - tempCold;
    let curTime = state.timeElapsed;

    let heatTransferredThisStep = HEAT_FLOW_CONSTANT * curTempDiff * dt;
    curHeatGained += heatTransferredThisStep;
    curHeatLost -= heatTransferredThisStep;

    tempHot -= heatTransferredThisStep / (metalMass * metalSpecHeat);
    tempCold += heatTransferredThisStep / (MASS_WATER * SPEC_HEAT_WATER);
    curTime += dt;

    return { currentWaterTemp: tempCold, 
             currentMetalTemp: tempHot, 
             currentHeatGained: curHeatGained,
             currentHeatLost: curHeatLost, 
             timeElapsed: curTime };
}

// RUN LOOP
function runSimulation(metalMass, metalSpecHeat) {

    const equilibriumTemp = getEquilibriumTemp(metalMass, metalSpecHeat);
    const maxHeatTransferred = getMaxHeatTransferred(equilibriumTemp);
    
    let state = { currentWaterTemp: INIT_TEMP_WATER, 
                  currentMetalTemp: INIT_TEMP_METAL, 
                  currentHeatGained: 0, 
                  currentHeatLost: 0,
                  timeElapsed: 0 };

    const timeHistory = [state.timeElapsed];
    const waterTempHistory = [state.currentWaterTemp];
    const metalTempHistory = [state.currentMetalTemp];
    const heatGainedHistory = [state.currentHeatGained];
    const heatLostHistory = [state.currentHeatLost];

    let stepCount = 0;
    let isRunning = true;

    while (isRunning) {
        state = step(state, dt, metalMass, metalSpecHeat);
        stepCount += 1;

        timeHistory.push(state.timeElapsed);
        waterTempHistory.push(state.currentWaterTemp);
        metalTempHistory.push(state.currentMetalTemp);
        heatGainedHistory.push(state.currentHeatGained);
        heatLostHistory.push(state.currentHeatLost);

        if (Math.abs(state.currentMetalTemp - state.currentWaterTemp) <= STOP_TOLERANCE || 
            stepCount == MAX_STEPS
        ) {
            isRunning = false;
        }
        
    }

    return { equilibriumTemp, maxHeatTransferred, timeHistory, waterTempHistory, metalTempHistory, heatGainedHistory, heatLostHistory };

}


// CONSOLE TESTS
const result = runSimulation(0.05, 128);
console.log(`${result.timeHistory.length} entries`);
console.log(`calculated T_f: ${result.equilibriumTemp}`);
console.log(`final water/metal: ${result.waterTempHistory.at(-1)}, ${result.metalTempHistory.at(-1)}`);
console.log(`heat: ${result.maxHeatTransferred}, ${result.heatGainedHistory.at(-1)}, ${result.heatLostHistory.at(-1)}`);