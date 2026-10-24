// CONSTANTS
    // water mass, water specific heat
    // starting temp of water, starting temp of metal
    // heat-flow constant
    const MASS_WATER = 0.2; // kg
    const SPEC_HEAT_WATER = 4186; // J/(kg*C)
    const INIT_TEMP_WATER = 20; // C
    const INIT_TEMP_METAL = 100; // C

    // time step size (dt)
    // stop tolerance (how close the two temps must be to count as 'done')
    // max number of steps (safety limit to avoid infinite loop)
    const dt = 0.05 // time step per frame (seconds)
    const STOP_TOLERANCE = 0.001; // C
    const HEAT_FLOW_CONSTANT = 1;
    const MAX_STEPS = 10000; // safety limit

// USER INPUTS
    // metal mass
    // metal specific heat (gets metal type from user)

    let metalMass; // using fixed test values for now
    let metalSpecHeat; // using fixed test values for now

// STATE (changes every time step)
    // current metal temperature, current water temperature
    // current heat transferred from metal / to water
    // elapsed time
    // history arrays: time, metal temp, water temp, metal heat lost, water heat lost

    let currentWaterTemp;
    let currentMetalTemp;
    let currentHeatTransferred;
    let timeElapsed;
    let equilibriumTemp; // calculated target (temp)
    let maxHeatTransferred; // calculated target (heat)
    
    let timeHistory = [];
    let waterTempHistory = [];
    let metalTempHistory = [];
    let heatTransferredHistory = [];

    let state = { currentWaterTemp, currentMetalTemp, currentHeatTransferred, timeElapsed };

// RESET (function)
    // function reset():
        // set state back to starting values
        // empty history arrays
        // record starting state as first entry in history arrays
    function resetSimulation() {
        equilibriumTemp = getEquilibriumTemp(metalMass, metalSpecHeat);
        maxHeatTransferred = getmaxHeatTransferred(metalMass, metalSpecHeat, equilibriumTemp);
        state = { currentWaterTemp: INIT_TEMP_WATER, currentMetalTemp: INIT_TEMP_METAL, currentHeatTransferred: 0, timeElapsed: 0 };
        
        timeHistory.length = 0;
        waterTempHistory.length = 0;
        metalTempHistory.length = 0;
        heatTransferredHistory.length = 0;

        timeHistory.push(state.timeElapsed);
        waterTempHistory.push(state.currentWaterTemp);
        metalTempHistory.push(state.currentMetalTemp);
        heatTransferredHistory.push(state.currentHeatTransferred);
    };

// PHYSICS FUNCTIONS
    // function getEquilibriumTemp(inputs):
        // calculate final temperature (T_f)
    function getEquilibriumTemp(metalMass, metalSpecHeat) {
        return ((metalMass * metalSpecHeat * INIT_TEMP_METAL + MASS_WATER * SPEC_HEAT_WATER * INIT_TEMP_WATER) / (metalMass * metalSpecHeat + MASS_WATER * SPEC_HEAT_WATER));
    };

    // function getmaxHeatTransferred(inputs):
        // calculate maxmium amount of heat transferred from metal
    function getmaxHeatTransferred(metalMass, metalSpecHeat, equilibriumTemp) {
        return ((MASS_WATER * SPEC_HEAT_WATER) * (equilibriumTemp - INIT_TEMP_WATER));
    };

    // function step(state, dt):
        // calculate rate of heat flow from current temperatures
        // turn into heat change for this time step
        // convert heat change into temperature change
            // one for metal, one for water (depends on mass and c of each)

        // return the new state (don't modify global variables within this function)
    function step(state, dt) {
        let tempHot = state.currentMetalTemp;
        let tempCold = state.currentWaterTemp;
        let curHeatTransferred = state.currentHeatTransferred;
        let curTempDiff = tempHot - tempCold;
        let curTime = state.timeElapsed;

        let heatTransferredThisStep = HEAT_FLOW_CONSTANT * curTempDiff * dt;
        
        curHeatTransferred += heatTransferredThisStep;

        tempHot -= (heatTransferredThisStep / (metalMass * metalSpecHeat));
        tempCold += (heatTransferredThisStep / (MASS_WATER * SPEC_HEAT_WATER));

        curTime += dt;

        return { currentWaterTemp: tempCold, currentMetalTemp: tempHot, currentHeatTransferred: curHeatTransferred, timeElapsed: curTime };
    };

// RUN LOOP
    // function run():
        // reset()
        // repeat until a stop condition is met:
            // new state = step(current state, dt) 
            // update state, increment time
            // record to history arrays
        // stop conditions:
            // two temps are within tolerance OR
            // step count hits safety limit (hard stop)
    function runSimulation() {
        resetSimulation();

        let isRunning = true;
        let stepCount = 0;

        console.log(`Water starting temp: ${INIT_TEMP_WATER}`);
        console.log(`Metal starting temp: ${INIT_TEMP_METAL}`);

        while (isRunning) {
            state = step(state, dt);
            stepCount += 1;

            timeHistory.push(state.timeElapsed);
            waterTempHistory.push(state.currentWaterTemp);
            metalTempHistory.push(state.currentMetalTemp);
            heatTransferredHistory.push(state.currentHeatTransferred);

            if (Math.abs(state.currentMetalTemp - state.currentWaterTemp) <= STOP_TOLERANCE || 
                stepCount == MAX_STEPS
            ) {
                isRunning = false;
            };

            // SHOW CURRENT STATE (testing only)
            // if (stepCount % 500 == 0) {
            //     console.log(`Current step: ${stepCount}`);
            //     console.log(`Target equilibrium temp: ${equilibriumTemp}`);
            //     console.log(`Current water temp: ${state.currentWaterTemp}\nCurrent metal temp: ${state.currentMetalTemp}`);
            //     console.log(`Target heat transferred: ${maxHeatTransferred}`);
            //     console.log(`Current heat transferred: ${state.currentHeatTransferred}`);   
            // }
            
        };

        // SUMMARY RESULTS (testing only)
        console.log('--- FINAL SUMMARY RESULTS: --- ')
        console.log(`Total steps: ${stepCount}`);
        console.log(`Target equilibrium temp: ${equilibriumTemp}`);
        console.log(`Simulated final temperatures:\nWater: ${state.currentWaterTemp}\nMetal: ${state.currentMetalTemp}`);
        console.log(`Target heat transferred: ${maxHeatTransferred}`);
        console.log(`Simulated heat transferred: ${state.currentHeatTransferred}`);

    };

// SUMMARY RESULTS (after each run)
    // final temperature reached, temperature change of each substance
    // heat transferred
    // for testing: difference between simulated final temp and T_f calculated


// CONSOLE TESTS

// 1. Comparing between different metals  
metalMass = 0.10

console.log(`Comparing between different metals at 0.10 kg`);

console.log(`Aluminum: 900`);
metalSpecHeat = 900;
runSimulation();

console.log(`Copper: 387`);
metalSpecHeat = 387;
runSimulation();

console.log(`Lead: 128`);
metalSpecHeat = 128;
runSimulation();

console.log(`Silver: 235`);
metalSpecHeat = 235;
runSimulation();

console.log(`Iron: 452`);
metalSpecHeat = 452;
runSimulation();
