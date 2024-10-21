type Grid = number[][];
type StructuringElement = number[][];

const gridSize = 10;
let isProcessing = false; // Flag to track if processing is ongoing
let step: 0 | 1 | 2 = 0; // 0 - draw shape, 1 - processing, 2 - finished
let iterations = 0;
const structuringElements = [
    // corner detection
    [
        [1, 1],
        [1, 0],
    ],

    [
        [0, 1],
        [1, 1],
    ],

    [
        [1, 1],
        [0, 1],
    ],

    [
        [1, 0],
        [1, 1],
    ],
];

// Create a 2D grid (gridSize x gridSize) filled with 0s

// 'grid' will hold the current state of the grid
let grid: Grid = Array.from({ length: gridSize }, () =>
    // For each element in the outer array, create an inner array of size 'gridSize' filled with 0s
    Array(gridSize).fill(0)
);

// 'previousGrid' will hold the previous state of the grid for comparison or tracking purposes
let previousGrid: Grid = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(0)
);

/////////////////////// this implementation if hit or miss second stracture element is complement of the first ///////////////////////

// Function to apply hit-or-miss for a single structuring element
function hitOrMiss(grid: Grid, element: StructuringElement): Grid {
    // Create a deep copy of the input grid to avoid modifying the original grid
    const finalGrid = grid.map((row) => [...row]);

    const elementRows = element.length;
    const elementCols = element[0].length;
    const elementCenter = {
        x: Math.floor(elementRows / 2),
        y: Math.floor(elementCols / 2),
    };

    // Loop through the grid, adjusting the bounds based on the size of the element
    for (let i = 0; i <= grid.length - elementRows; i++) {
        for (let j = 0; j <= grid[i].length - elementCols; j++) {
            // Check if the current sub-grid matches the structuring element
            let match = true;
            for (let x = 0; x < elementRows; x++) {
                for (let y = 0; y < elementCols; y++) {
                    if (grid[i + x][j + y] !== element[x][y]) {
                        match = false;
                        break;
                    }
                }
                if (!match) break;
            }

            // If a match is found, set the corresponding grid region in finalGrid to 1
            if (match) {
                finalGrid[i + elementCenter.x][j + elementCenter.y] = 1;
            }
        }
    }

    // Return the modified grid with updated values
    return finalGrid;
}

function applyConvexHull() {
    let convexHullGrid = grid.map((row) => [...row]);
    let Changed = false;

    // Loop through each structuring element and apply hitOrMiss directly
    structuringElements.forEach((element) => {
        const result = hitOrMiss(grid, element);
        const unionResult = union(convexHullGrid, result); // Call the union function
        convexHullGrid = unionResult.newGrid; // Update convexHullGrid
        Changed = unionResult.hasChanged || Changed; // Update hasChanged
    });
    if (Changed) {
        previousGrid = grid.map((row) => [...row]); // Save the previous state before updating
        grid = convexHullGrid; // Update the grid with the new state
        iterations++;
        render(); // Render the updated grid
    } else {
        step = 2; // Finished
        render(); // Render the final state
    }
}

function union(
    gridArr: number[][],
    hitOrMissArr: number[][]
): { newGrid: number[][]; hasChanged: boolean } {
    // Create a deep copy of gridArr to avoid modifying the original array
    const newGrid = gridArr.map((row) => [...row]);
    let hasChanged = false; // Flag to track if a change is detected

    // Iterate through both arrays
    for (let i = 0; i < gridArr.length; i++) {
        for (let j = 0; j < gridArr[i].length; j++) {
            // Set the value in newGrid to 1 if hitOrMissArr has a 1 in the same position
            if (hitOrMissArr[i][j] === 1) {
                newGrid[i][j] = 1;

                // Check if gridArr has a 0 in the same position
                if (gridArr[i][j] === 0) {
                    hasChanged = true; // A new 1 was set in hitOrMissArr
                }
            }
        }
    }

    // Return the updated grid and whether a change was detected
    return { newGrid, hasChanged };
}

function startProcess() {
    isProcessing = true; // Set processing flag
    step = 1; // Change step to processing mode
    const intervalId = setInterval(() => {
        if (!isProcessing) {
            clearInterval(intervalId);
            return;
        }
        applyConvexHull();

        document.getElementById("iterations-count")!.innerText =
            iterations.toString();

        if (step === 2) {
            clearInterval(intervalId); // Stop interval when finished
            isProcessing = false; // Reset processing flag
        }
    }, 1000);
}

function nextMove() {
    // Allow next move only if currently processing
    if (step === 1 || step === 0) {
        applyConvexHull();

        document.getElementById("iterations-count")!.innerText =
            iterations.toString();
    }
    // Check if finished
    if (step === 2) {
        isProcessing = false; // Reset processing flag when finished
    }
}

function handleCellClick(i: number, j: number) {
    // Prevent drawing if currently processing or after the next move has been clicked
    if (step === 0) {
        grid[i][j] = grid[i][j] === 0 ? 1 : 0; // Toggle cell
        render();
    }
}

function reset() {
    grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
    previousGrid = Array.from({ length: gridSize }, () =>
        Array(gridSize).fill(0)
    );

    step = 0;
    iterations = 0;

    document.getElementById("iterations-count")!.innerText =
        iterations.toString();

    render();
}

function generateRandomShape() {
    reset();
    const newGrid = Array.from({ length: gridSize }, () =>
        Array(gridSize).fill(0)
    );

    const centerX = Math.floor(gridSize / 2);
    const centerY = Math.floor(gridSize / 2);

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const distance = Math.sqrt((i - centerX) ** 2 + (j - centerY) ** 2);
            if (distance <= Math.floor(gridSize / 2) && Math.random() > 0.5) {
                // Randomly fill cells within a radius
                newGrid[i][j] = 1;
            }
        }
    }

    grid = newGrid;

    render();
}
function renderStructuringElements() {
    const structuringContainer = document.getElementById(
        "structuring-elements"
    );

    // Clear previous rendering
    structuringContainer!.innerHTML = "";

    structuringElements.forEach((structure) => {
        const gridDiv = document.createElement("div");
        gridDiv.classList.add("grid");

        structure.forEach((row) => {
            row.forEach((cell) => {
                const cellDiv = document.createElement("div");
                cellDiv.classList.add("cell");

                if (cell === 1) {
                    cellDiv.classList.add("black");
                } else {
                    cellDiv.classList.add("white");
                }

                gridDiv.appendChild(cellDiv);
            });
            const lineBreak = document.createElement("br");
            gridDiv.appendChild(lineBreak);
        });

        structuringContainer!.appendChild(gridDiv);
    });
}

// Function to render the main grid
function render() {
    const gridContainer = document.getElementById("grid");

    // Clear previous rendering
    gridContainer!.innerHTML = "";

    // Render main grid
    grid.forEach((row, i) => {
        row.forEach((cell, j) => {
            const cellDiv = document.createElement("div");
            // last step and black cell
            if (step === 2 && cell === 1) {
                cellDiv.className += " bg-black";
                // previous step in gray insted of black
            } else if (previousGrid[i][j] === 1) {
                cellDiv.className += " bg-gray";
            } else {
                cellDiv.className += cell ? " bg-black" : " bg-white";
            }
            cellDiv.onclick = () => handleCellClick(i, j);
            gridContainer!.appendChild(cellDiv);
        });
    });
}

// Event Listeners for buttons
document.getElementById("start-button")!.onclick = startProcess;
document.getElementById("next-button")!.onclick = nextMove;
document.getElementById("random-button")!.onclick = generateRandomShape;
document.getElementById("reset-button")!.onclick = reset;

// Initial Render
renderStructuringElements();
render();
