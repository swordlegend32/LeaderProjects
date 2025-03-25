
const Container = document.getElementById('container');
let Rows = 5;
let Columns = 5;
let Grid = [];


const StartBuildButton = document.getElementById('StartNodeBuilder');
StartBuildButton.addEventListener('click', PressStartBuildButton);

const EndBuildButton = document.getElementById('EndNodeBuilder');
EndBuildButton.addEventListener('click', PressFinishBuildButton);

const WallBuildButton = document.getElementById('WallNodeBuilder');
WallBuildButton.addEventListener('click', PressWallBuildButton);

const StartPathfinding = document.getElementById('StartPathfinding');
StartPathfinding.addEventListener('click', StartPathfindingButton);

const StartGeneratingMaze = document.getElementById('StartMazeGen');
StartGeneratingMaze.addEventListener('click', StartMazeGeneration);

const ResetGridButtonB = document.getElementById('ResetGridButton');
ResetGridButtonB.addEventListener('click', ResetGridButton);

const PathfindingSelect = document.getElementById('Algorithms');
PathfindingSelect.addEventListener('change', OptionChanged);

const MazefindingSelect = document.getElementById('MazeAlgorithms');
MazefindingSelect.addEventListener('change', OptionChangedMaze);


const GridSizeSlider = document.getElementById('GridSize');
GridSizeSlider.addEventListener('change', function() {
    let value = GridSizeSlider.value ;
    scale = value
    console.log(scale)
    ResizeGrid()
});

const SpeedSlider = document.getElementById('Speed');
SpeedSlider.addEventListener('change', function() {
    Speed = SpeedSlider.value
    SkipWait = true
});

let CurrentlyBuilding = null;

let StartElement = null;
let EndElement = null;

let StartNode = null;
let EndNode = null;

let PathfindingInProcess = false;

let scale = 1;
let Speed = 50;

let SkipWait = false;

function lerp(a, b, n) {
    return (1 - n) * a + n * b;
}

let ChosenAlgorithm = "BreadthWidthSearch";
let ChosenMazeAlgorithm = "DFSMaze";

function ResetCosts() {
    for (let i = 0; i < Rows * scale; i++) {
        for (let j = 0; j < Columns * scale; j++) {
            let Cell = Grid[i][j]
            Cell.HCost = 0;
            Cell.GCost = 0;
            Cell.FCost = 0;
        }
    }
}

function ResetGrid() {
    for (let i = 0; i < Rows * scale; i++) {
        for (let j = 0; j < Columns * scale; j++) {
            let Element = document.getElementById(`${i}/${j}`)

            if (Element === null || Element == undefined) {
                continue
            }

            if (Element.className != "StartGridCell" && Element.className != "FinishGridCell" && Element.className != "OcupiedGridCell" && Element.className != "GridCell") {
                Element.className = "GridCell"
            }
        }
    }
}

function CreateGrid() {
    if (PathfindingInProcess === true) {
        alert("Pathfinding In Process, Please Wait");
        return;
    }
    StartNode = null;
    EndNode = null;
    StartElement = null;
    EndElement = null;
    PathfindingInProcess = false

    if ((Rows * scale) % 2 === 0) Rows++;
    if ((Columns * scale) % 2 === 0) Columns++;

    Container.style.gridTemplateColumns  = `repeat(${Columns * scale}, 25px)`;
    Container.style.gridTemplateRows = `repeat(${Rows * scale}, 25px)`;

    while (Container.firstChild) {
        Container.removeChild(Container.firstChild);
    }   

    for (let i = 0; i < Rows * scale; i++) {
        Grid[i] = [];
        for (let j = 0; j < Columns * scale; j++) {

            Grid[i][j] = {Type: "Empty", x: i, y: j, Fcost: 0, GCost: 0, HCost: 0, Parent: null};
            let GridCell = document.createElement("div");

            GridCell.textContent =  "";
            GridCell.className = "GridCell";
            GridCell.id = `${i}/${j}`;

            GridCell.style.width = `${25}px`;
            GridCell.style.height = `${25}px`;
            GridCell.style.border = `${2}px solid black`;

            GridCell.style.gridRowstart = i + 1; 
            GridCell.style.gridColumnstart = j + 1;

            Container.appendChild(GridCell);
        }
    }
}

function ResizeGrid() {
    if (PathfindingInProcess === true) {
        alert("Pathfinding In Process, Please Wait");
        return;
    }

    Container.style.height = `${Rows * scale * 25}px`;
    Container.style.width = `${Columns * scale * 25}px`;

    StartNode = null;
    EndNode = null;
    StartElement = null;
    EndElement = null;
    PathfindingInProcess = false;

    Container.style.gridTemplateColumns = `repeat(${Columns * scale}, ${25}px)`;
    Container.style.gridTemplateRows = `repeat(${Rows * scale}, ${25}px)`;

    while (Container.firstChild) {
        Container.removeChild(Container.firstChild);
    }

    for (let i = 0; i < Rows * scale; i++) {
        if (!Grid[i]) {
            Grid[i] = [];
        }

        for (let j = 0; j < Columns * scale; j++) {
            if (!Grid[i][j]) {
                Grid[i][j] = {
                    Type: "Empty",
                    x: i,
                    y: j,
                    FCost: 0,
                    GCost: 0,
                    HCost: 0,
                    Parent: null,
                };
            }

            const GridCell = document.createElement("div");
            GridCell.className = "GridCell";
            GridCell.id = `${i}/${j}`;

            GridCell.style.width = `${25}px`;
            GridCell.style.height = `${25}px`;
            GridCell.style.border = `${2}px solid black`;

            Container.appendChild(GridCell);
        }
    }
}

function GetNeighbors(Node) {
    const XVector = [1, 0, -1, 0];
    const YVector = [0, 1, 0, -1];

    let Neighbors = [];

    for (let i = 0; i < 4; i++) {
        let NewX = Node.x + XVector[i];
        let NewY = Node.y + YVector[i];

        if (NewX >= 0 && NewX < Rows * scale && NewY >= 0 && NewY < Columns * scale) {
            let Neighbor = Grid[NewX][NewY];
            if (!Neighbor) {
                console.error(`Invalid Neighbor at (${NewX}, ${NewY})`);
            }
            if (Neighbor.Type === "Wall" || Neighbor.Type === "Start") {
                continue;
            }
            Neighbors.push(Neighbor);
        }
    }
    return Neighbors;
}   

function GetMazeNeighbors(node) {
    const directions = [
        { dx: 0, dy: -2 }, 
        { dx: 0, dy: 2 }, 
        { dx: -2, dy: 0 },
        { dx: 2, dy: 0 } 
    ];
    let neighbors = [];

    for (let dir of directions) {
        let newX = node.x + dir.dx;
        let newY = node.y + dir.dy;

        if (newX >= 0 && newX < Rows * scale && newY >= 0 && newY < (Columns * scale)) {
            if (Grid[newX][newY].Type === "Wall" ) {
                neighbors.push(Grid[newX][newY]);
            }
        }
    }

    return neighbors;
}

// function GreedySearchNeigbour(node) {
//     const directions = [
//         { dx: 0, dy: -1 }, 
//         { dx: 0, dy: 1 }, 
//         { dx: -1, dy: 0 },
//         { dx: 1, dy: 0 } 
//     ];

//     let Neighbours = [];
//     let CurHCost = Math.abs(EndNode.x - node.x) + Math.abs(EndNode.y - node.y);

//     for (let dir of directions) {
//         let newX = node.x + dir.dx;
//         let newY = node.y + dir.dy;

//         if (newX >= 0 && newX < Rows * scale && newY >= 0 && newY < Columns * scale) {
//             const NewHCost = Math.abs(EndNode.x - newX) + Math.abs(EndNode.y - newY);
//             if (
//                 Grid[newX][newY].Type !== "Wall" &&
//                 Grid[newX][newY].Type !== "Start" &&
//                 NewHCost < CurHCost
//             ) {
//                 Neighbours.push(Grid[newX][newY]);
//             }
//         }
//     }

//     if (Neighbours.length < 3) {
//         for (let dir of directions) {
//             let newX = node.x + dir.dx;
//             let newY = node.y + dir.dy;

//             if (newX >= 0 && newX < Rows * scale && newY >= 0 && newY < Columns * scale) {
//                 if (
//                     Grid[newX][newY].Type !== "Wall" &&
//                     Grid[newX][newY].Type !== "Start" &&
//                     !Neighbours.includes(Grid[newX][newY])
//                 ) {
//                     Neighbours.push(Grid[newX][newY]);
//                 }
//             }
//         }
//     }

//     Neighbours.sort((a, b) => {
//         return a.HCost - b.HCost;
//     });

//     return Neighbours;
// }

function GetOppositeEdge(x, y) {
    let OppositeX = Rows - x - 1;
    let OppositeY = Columns - y - 1;
    return { x: OppositeX, y: OppositeY };
}

async function DFSMaze() {
    ResizeGrid();

    let stack = [];
    let startX = 1;
    let startY = 1;

    let EndX = (Rows * scale) - 3;
    let EndY = (Columns * scale) - 3;

    for (let i = 0; i < Rows * scale; i++) {
        if (!Grid[i]) {
            Grid[i] = [];
        }
        for (let j = 0; j < Columns * scale; j++) {

            if (!Grid[i][j]) {
                Grid[i][j] = {
                    Type: "Wall",
                    x: i,
                    y: j,
                    FCost: 0,
                    GCost: 0,
                    HCost: 0,
                    Parent: null,
                };

                const GridCell = document.createElement("div");
                GridCell.className = "GridCell";
                GridCell.id = `${i}/${j}`;

                GridCell.style.width = `${25}px`;
                GridCell.style.height = `${25}px`;
                GridCell.style.border = `${2}px solid black`;

                Container.appendChild(GridCell);

            }

            Grid[i][j].Type = "Wall";
            let Element = document.getElementById(`${i}/${j}`);
            if (Element) Element.className = "OcupiedGridCell";
        }
    }

    let startNode = Grid[startX][startY];
    startNode.Type = "Empty";
    let startElement = document.getElementById(`${startX}/${startY}`);
    if (startElement) startElement.className = "GridCell";

    stack.push(startNode);

    StartNode = Grid[startX][startY];
    StartNode.Type = "Start";

    startElement = document.getElementById(`${startX}/${startY}`);
    if (startElement) startElement.className = "StartGridCell"; startElement.textContent = "A"

    while (stack.length > 0) {
        let current = stack[stack.length - 1];
        let neighbors = GetMazeNeighbors(current);

        if (neighbors.length > 0) {
            let next = getRandomItem(neighbors);
            let wallX = (current.x + next.x) / 2;
            let wallY = (current.y + next.y) / 2;

            Grid[wallX][wallY].Type = "Empty";
            let wallElement = document.getElementById(`${wallX}/${wallY}`);
            if (wallElement) wallElement.className = "GridCell";

            next.Type = "Empty";
            let nextElement = document.getElementById(`${next.x}/${next.y}`);

            if (nextElement) nextElement.className = "QueueGridCell";

            stack.push(next);

            const WaitTime = calculateWaitTime(Speed);
            if (WaitTime > 1) {
                for (let i = 0; i < WaitTime; i++) {
                    if (SkipWait) {
                        SkipWait = false;
                        break;
                    }
                    await new Promise(resolve => setTimeout(resolve, 1));
                    }
                }
            if (nextElement) nextElement.className = "GridCell";

           
        } else {
            stack.pop();
        }

             
    }

  
    EndNode = Grid[EndX][EndY];
    EndNode.Type = "Finish";
    let endElement = document.getElementById(`${EndX}/${EndY}`);  
 
    if (endElement) endElement.className = "FinishGridCell";  endElement.textContent = "B";

}

function GetRandomNode() {
    let X = Math.floor(Math.random() * (Rows * scale));
    let Y =  Math.floor(Math.random() * (Columns * scale));
    return Grid[X][Y]
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function PrimsMaze() {
    ResizeGrid();
    let stack = [];

    let startX = 1;
    let startY = 1;

    let EndX = (Rows * scale) - 3;
    let EndY = (Columns * scale) - 3;

    let StartingNode = Grid[Math.floor((Rows * scale) / 2)][Math.floor((Columns * scale) / 2)];
    console.log(StartingNode)

    for (let i = 0; i < Rows * scale; i++) {
        if (!Grid[i]) {
            Grid[i] = [];
        }
        for (let j = 0; j < Columns * scale; j++) {

            if (!Grid[i][j]) {
                Grid[i][j] = {
                    Type: "Wall",
                    x: i,
                    y: j,
                    FCost: 0,
                    GCost: 0,
                    HCost: 0,
                    Parent: null,
                };

                const GridCell = document.createElement("div");
                GridCell.className = "GridCell";
                GridCell.id = `${i}/${j}`;

                GridCell.style.width = `${25}px`;
                GridCell.style.height = `${25}px`;
                GridCell.style.border = `${2}px solid black`;

                Container.appendChild(GridCell);

            }

            Grid[i][j].Type = "Wall";
            let Element = document.getElementById(`${i}/${j}`);
            if (Element) Element.className = "OcupiedGridCell";
        }
    }

    stack.push(StartingNode);

    while (stack.length > 0) {

        let current = getRandomItem(stack);

        let neighbors = GetMazeNeighbors(current)

        if (neighbors.length > 0) {
            let next = getRandomItem(neighbors);
            while (stack.includes(next)) {
                neighbors.splice(neighbors.indexOf(next), 1);
                next = getRandomItem(neighbors);
            }
            if (!next) {
                stack.splice(stack.indexOf(current), 1);
                continue;
            }
            let wallX = (current.x + next.x) / 2;
            let wallY = (current.y + next.y) / 2;

            Grid[wallX][wallY].Type = "Empty";
            let wallElement = document.getElementById(`${wallX}/${wallY}`);
            if (wallElement) wallElement.className = "GridCell";

           

            next.Type = "Empty";
            let nextElement = document.getElementById(`${next.x}/${next.y}`);
            if (nextElement) nextElement.className = "QueueGridCell";

            stack.push(next);

            const WaitTime = calculateWaitTime(Speed);
            if (WaitTime > 1) {
                for (let i = 0; i < WaitTime; i++) {
                    if (SkipWait) {
                        SkipWait = false;
                        break;
                    }
                    await new Promise(resolve => setTimeout(resolve, 1));
                    }
                } 
            if (nextElement) nextElement.className = "GridCell";
        }
       else {
            stack.splice(stack.indexOf(current), 1);
        }

       
        
    }

    StartNode = Grid[startX][startY];
    StartNode.Type = "Start";
    let startElement = document.getElementById(`${startX}/${startY}`);
    if (startElement) startElement.className = "StartGridCell"; startElement.textContent = "A"

    EndNode = Grid[EndX][EndY];
    EndNode.Type = "Finish";
    let endElement = document.getElementById(`${EndX}/${EndY}`);
    if (endElement) endElement.className = "FinishGridCell"; endElement.textContent = "B"
}

async function GrowingTree() {
    ResizeGrid();
    let stack = [];
    let startX = 1;
    let startY = 1;

    let EndX = (Rows * scale) - 3;
    let EndY = (Columns * scale) - 3;

    

    let StartingNode = Grid[Math.floor((Rows * scale) / 2)][Math.floor((Columns * scale) / 2)];
    console.log(StartingNode)

    for (let i = 0; i < Rows * scale; i++) {
        if (!Grid[i]) {
            Grid[i] = [];
        }
        for (let j = 0; j < Columns * scale; j++) {

            if (!Grid[i][j]) {
                Grid[i][j] = {
                    Type: "Wall",
                    x: i,
                    y: j,
                    FCost: 0,
                    GCost: 0,
                    HCost: 0,
                    Parent: null,
                };

                const GridCell = document.createElement("div");
                GridCell.className = "GridCell";
                GridCell.id = `${i}/${j}`;

                GridCell.style.width = `${25}px`;
                GridCell.style.height = `${25}px`;
                GridCell.style.border = `${2}px solid black`;

                Container.appendChild(GridCell);

            }

            Grid[i][j].Type = "Wall";
            let Element = document.getElementById(`${i}/${j}`);
            if (Element) Element.className = "OcupiedGridCell";
        }
    }

    stack.push(StartingNode);

    while (stack.length > 0) {

        let current = getRandomItem(stack);

        for (let i = 0;i < 4;i++) {
            
            let neighbors = GetMazeNeighbors(current)

            if (neighbors.length > 0) {
                let next = getRandomItem(neighbors);
                while (stack.includes(next)) {
                    break
                }
                if (!next) {
                    stack.splice(stack.indexOf(current), 1);
                    break;
                }
                let wallX = (current.x + next.x) / 2;
                let wallY = (current.y + next.y) / 2;

                Grid[wallX][wallY].Type = "Empty";
                let wallElement = document.getElementById(`${wallX}/${wallY}`);
                if (wallElement) wallElement.className = "GridCell";

                next.Type = "Empty";
                let nextElement = document.getElementById(`${next.x}/${next.y}`);
                if (nextElement) nextElement.className = "QueueGridCell";

                stack.push(next);

                current = next;

                const WaitTime = calculateWaitTime(Speed);
                if (WaitTime > 1) {
                for (let i = 0; i < WaitTime; i++) {
                    if (SkipWait) {
                        SkipWait = false;
                        break;
                    }
                    await new Promise(resolve => setTimeout(resolve, 1));
                    }
                } 
                if (nextElement) nextElement.className = "GridCell";

            }
        else {
                stack.splice(stack.indexOf(current), 1);
                break
            }
           
        }
        
    }

    StartNode = Grid[startX][startY];
    StartNode.Type = "Start";
    let startElement = document.getElementById(`${startX}/${startY}`);
    if (startElement) startElement.className = "StartGridCell"; startElement.textContent = "A"

    EndNode = Grid[EndX][EndY];
    EndNode.Type = "Finish";
    let endElement = document.getElementById(`${EndX}/${EndY}`);
    if (endElement) endElement.className = "FinishGridCell"; endElement.textContent = "B"
}

async function BreadthWidthSearch() {
    if (StartNode == null || EndNode == null) {
        alert("Please select a start and end node");
        return;
    }

    if (PathfindingInProcess === true) {
        alert("Pathfinding Already In Process");
        return;
    }

    ResetGrid();
    PathfindingInProcess = true;

    let OpenList = [];
    let ClosedList = [];

    StartNode["GCost"] = 0;  
    OpenList.push(StartNode);

    while (OpenList.length > 0) {
        let CurrentNode = OpenList.shift();

        const WaitTime = calculateWaitTime(Speed);

        if (CurrentNode.x === EndNode.x && CurrentNode.y === EndNode.y) {
            for (let i = 0; i < ClosedList.length; i++) {
                let CurrentGridCell = ClosedList[i];
                let ElementCell = document.getElementById(`${CurrentGridCell.x}/${CurrentGridCell.y}`);
                if (ElementCell && (ElementCell.className == "SearchedGridCell" || ElementCell.className == "QueueGridCell" || ElementCell.className == "PathGridCell")) {
                    ElementCell.className = "GridCell";
                }
            }

            for (let i = 0; i < OpenList.length; i++) {
                let CurrentGridCell = OpenList[i];
                let ElementCell = document.getElementById(`${CurrentGridCell.x}/${CurrentGridCell.y}`);
                if (ElementCell && (ElementCell.className == "SearchedGridCell" || ElementCell.className == "QueueGridCell" || ElementCell.className == "PathGridCell")) {
                    ElementCell.className = "GridCell";
                }
            }

            let PathNode = CurrentNode;
            while (PathNode.Parent != null) {
                PathNode = PathNode.Parent;
                if (PathNode.Type === "Start") {
                    break;
                }
                let Element = document.getElementById(`${PathNode.x}/${PathNode.y}`);
                Element.className = "PathGridCell";

                const WaitTime = Math.floor(10 / scale);

                if ( WaitTime > 1) {
                    await new Promise(resolve => setTimeout(resolve, WaitTime));
                }

               
            }
            PathfindingInProcess = true;
            break;
        }

        let Neighbors = GetNeighbors(CurrentNode);
        for (let i = 0; i < Neighbors.length; i++) {
            let Neighbor = Neighbors[i];

            if (ClosedList.includes(Neighbor) || Neighbor.Type === "Wall") {
                continue;
            }

            if (OpenList.includes(Neighbor)) {
                Neighbor = OpenList[OpenList.indexOf(Neighbor)];
            }

            let NewGCost = CurrentNode.GCost + 1;

            if (!OpenList.includes(Neighbor) || NewGCost < Neighbor.GCost) {
                Neighbor["GCost"] = NewGCost;
                Neighbor["Parent"] = CurrentNode;

             
                if (!OpenList.includes(Neighbor)) {
                    OpenList.push(Neighbor);

                    if(Neighbor.Type == "Finish") {
                        break;
                    }    

                    let ElementCell = document.getElementById(`${Neighbor.x}/${Neighbor.y}`);
                    if (ElementCell && ElementCell.className == "GridCell" && !SkipWait && WaitTime > 1) {
                        ElementCell.className = "QueueGridCell";
                    }
                }
            }
        }

        ClosedList.push(CurrentNode);
        let currentElement = document.getElementById(`${CurrentNode.x}/${CurrentNode.y}`);
        if (currentElement && currentElement.className == "QueueGridCell" && !SkipWait && WaitTime > 1) {
            currentElement.className = "SearchedGridCell";
        }

       
        if (WaitTime > 1) {
            for (let i = 0; i < WaitTime; i++) {
                if (SkipWait) {
                    SkipWait = false;
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 1));
                }
            }        
    }

    PathfindingInProcess = false;
    ResetCosts();
}

async function GreedyBestFirstSearch() {
    if (StartNode == null || EndNode == null) {
        alert("Please select a start and end node");
        return;
    }

    if (PathfindingInProcess === true) {
        alert("Pathfinding Already In Process");
        return;
    }

    ResetGrid();
    PathfindingInProcess = true;

    let OpenList = [];
    let ClosedList = [];
    const NewHCost = Math.abs(EndNode.x - StartNode.x) + Math.abs(EndNode.y - StartNode.y);

    StartNode["GCost"] = 0;  
    StartNode["HCost"] = NewHCost

    OpenList.push(StartNode);

    while (OpenList.length > 0) {
        let CurrentNode = OpenList.shift();

        const WaitTime = calculateWaitTime(Speed);

        if (CurrentNode.x === EndNode.x && CurrentNode.y === EndNode.y) {
            for (let i = 0; i < ClosedList.length; i++) {
                let CurrentGridCell = ClosedList[i];
                let ElementCell = document.getElementById(`${CurrentGridCell.x}/${CurrentGridCell.y}`);
                if (ElementCell && (ElementCell.className == "SearchedGridCell" || ElementCell.className == "QueueGridCell" || ElementCell.className == "PathGridCell")) {
                    ElementCell.className = "GridCell";
                }
            }

            for (let i = 0; i < OpenList.length; i++) {
                let CurrentGridCell = OpenList[i];
                let ElementCell = document.getElementById(`${CurrentGridCell.x}/${CurrentGridCell.y}`);
                if (ElementCell && (ElementCell.className == "SearchedGridCell" || ElementCell.className == "QueueGridCell" || ElementCell.className == "PathGridCell")) {
                    ElementCell.className = "GridCell";
                }
            }

            let PathNode = CurrentNode;
            while (PathNode.Parent != null) {
                PathNode = PathNode.Parent;
                if (PathNode.Type === "Start") {
                    break;
                }
                let Element = document.getElementById(`${PathNode.x}/${PathNode.y}`);
                Element.className = "PathGridCell";

                const WaitTime = Math.floor(10 / scale);

                if ( WaitTime > 1) {
                    await new Promise(resolve => setTimeout(resolve, WaitTime));
                }

               
            }
            PathfindingInProcess = true;
            break;
        }

        let Neighbors = GetNeighbors(CurrentNode);
        for (let i = 0; i < Neighbors.length; i++) {
            let Neighbor = Neighbors[i];
        
            if (ClosedList.includes(Neighbor) || Neighbor.Type === "Wall") {
                continue;
            }
        
            if (OpenList.includes(Neighbor)) {
                Neighbor = OpenList[OpenList.indexOf(Neighbor)];
            }
        
            let NewGCost = CurrentNode.GCost + 1;
            const NewHCost = Math.abs(EndNode.x - Neighbor.x) + Math.abs(EndNode.y - Neighbor.y);
        
            if (!OpenList.includes(Neighbor) || NewGCost < Neighbor.GCost) {
                Neighbor["GCost"] = NewGCost;
                Neighbor["Parent"] = CurrentNode;
                Neighbor["HCost"] = NewHCost;
        
                if (!OpenList.includes(Neighbor)) {
                    OpenList.push(Neighbor);

                    OpenList.sort((a, b) => {
                        return a.HCost - b.HCost;
                    });
                    let ElementCell = document.getElementById(`${Neighbor.x}/${Neighbor.y}`);
                    if (ElementCell && ElementCell.className == "GridCell") {
                        ElementCell.className = "QueueGridCell";
                    }
                }
            }
        }
        ClosedList.push(CurrentNode);
        let currentElement = document.getElementById(`${CurrentNode.x}/${CurrentNode.y}`);
        if (currentElement && currentElement.className == "QueueGridCell" && !SkipWait && WaitTime > 1) {
            currentElement.className = "SearchedGridCell";
        }
        if (WaitTime > 1) {
            for (let i = 0; i < WaitTime; i++) {
                if (SkipWait) {
                    SkipWait = false;
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
    }
    PathfindingInProcess = false;
    ResetCosts();
}

// async function VectorField() {
//     if (EndNode == null) {
//         alert("Please select a start and end node");
//         return;
//     }

//     if (PathfindingInProcess === true) {
//         alert("Pathfinding Already In Process");
//         return;
//     };

//     OpenList = [];
//     ClosedList = [];

//     OpenList.push(EndNode);

//     while (OpenList.length < 0 ) {
//         const CurrentNode = OpenList.shift() 
//         Neigbours = GetNeighbors()

//         const WaitTime = calculateWaitTime(Speed);
//     }
// }

function calculateWaitTime(Speed) {
    if (Speed >= 100) {
        return 0;
    }
    if (Speed <= 0) {
        return 50000;
    }

    let maxWaitTime = 500;
    const minWaitTime = 0; 

    maxWaitTime /= scale;

   return Math.floor(lerp(maxWaitTime, minWaitTime, (Speed / 100)));
}

async function AStarSearch() {

    if (StartNode == null || EndNode == null) {
        alert("Please select a start and end node");
        return;
    }

    if (PathfindingInProcess === true) {
        alert("Pathfinding Already In Process");
        return;
    }

    ResetGrid();
    PathfindingInProcess = true;

    let OpenList = [];
    let ClosedList = [];

    let ListNode = StartNode;
    let GCost = 0;
    let HCost = Math.abs(EndNode.x - ListNode.x) + Math.abs(EndNode.y - ListNode.y);
    let FCost = GCost + HCost;

    ListNode["GCost"] = GCost;
    ListNode["HCost"] = HCost;
    ListNode["FCost"] = FCost;
    ListNode["Parent"] = null;

    OpenList.push(ListNode);

    function GetLowestFCostNode() {
        let LowestFCostNode = OpenList[0];

        for (let i = 1; i < OpenList.length; i++) {
            if (OpenList[i].FCost < LowestFCostNode.FCost) {
                LowestFCostNode = OpenList[i];
            }
        }
        return LowestFCostNode;
    }

    while (OpenList.length > 0) {
        let CurrentNode = GetLowestFCostNode();

        const WaitTime = calculateWaitTime(Speed);

        if (CurrentNode.x === EndNode.x && CurrentNode.y === EndNode.y) {
            for (let i = 0; i < ClosedList.length; i++) {
                let CurrentGridCell = ClosedList[i];
                let ElementCell = document.getElementById(`${CurrentGridCell.x}/${CurrentGridCell.y}`);
                if (ElementCell && (ElementCell.className == "SearchedGridCell" || ElementCell.className == "QueueGridCell" || ElementCell.className == "PathGridCell")) {
                    ElementCell.className = "GridCell";
                    ElementCell.textContent = ""
                }
            }

            for (let i = 0; i < OpenList.length; i++) {
                let CurrentGridCell = OpenList[i];
                let ElementCell = document.getElementById(`${CurrentGridCell.x}/${CurrentGridCell.y}`);
                if (ElementCell && (ElementCell.className == "SearchedGridCell" || ElementCell.className == "QueueGridCell" || ElementCell.className == "PathGridCell")) {
                    ElementCell.className = "GridCell";
                    ElementCell.textContent = ""

                }
            }

            let PathNode = CurrentNode;
            while (PathNode.Parent != null) {
                PathNode = PathNode.Parent;
                if (PathNode.Type === "Start") {
                    break;
                }
                let Element = document.getElementById(`${PathNode.x}/${PathNode.y}`);
                Element.className = "PathGridCell";
                Element.textContent = ""

                const WaitTime = Math.floor(10 / scale);

                if ( WaitTime > 1) {
                    await new Promise(resolve => setTimeout(resolve, WaitTime));
                }

               
            }
            PathfindingInProcess = true;
            break;
        }

        OpenList.splice(OpenList.indexOf(CurrentNode), 1);
        ClosedList.push(CurrentNode);

        let Neighbors = GetNeighbors(CurrentNode);

        for (let i = 0; i < Neighbors.length; i++) {
            let Neighbor = Neighbors[i];

            if(OpenList.includes(Neighbor) ){
                Neighbor = OpenList[OpenList.indexOf(Neighbor)];
            }

            if (ClosedList.includes(Neighbor) || Neighbor.Type === "Wall") {
                continue;
            }

            let TentativeGCost = CurrentNode.GCost + 1;

            if (!OpenList.includes(Neighbor) || TentativeGCost < Neighbor.GCost) {
                Neighbor["GCost"] = TentativeGCost;
                Neighbor["HCost"] = Math.abs(EndNode.x - Neighbor.x) + Math.abs(EndNode.y - Neighbor.y);
                Neighbor["FCost"] = Neighbor.GCost + Neighbor.HCost;
                Neighbor["Parent"] = CurrentNode;

                Grid[Neighbor.x][Neighbor.y] = Neighbor;

                if (!OpenList.includes(Neighbor)) {
                    OpenList.push(Neighbor);

                    if(Neighbor.Type == "Finish") {
                        break;
                    }    
                    let ElementCell = document.getElementById(`${Neighbor.x}/${Neighbor.y}`);
                    if (ElementCell && ElementCell.className == "GridCell") {
                        ElementCell.className = "QueueGridCell";
                        ElementCell.innerHTML = `${Neighbor.GCost} ${Neighbor.HCost} <br> ${Neighbor.FCost}`;
                    }
                }
            }
        }

        let CurrentElement = document.getElementById(`${CurrentNode.x}/${CurrentNode.y}`);
        if (CurrentElement && CurrentElement.className == "QueueGridCell") {
            CurrentElement.className = "SearchedGridCell";
        }

        if (WaitTime > 1) {
            for (let i = 0; i < WaitTime; i++) {
                if (SkipWait) {
                    SkipWait = false;
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 1));
                }
            } 
    }
    PathfindingInProcess = false;
    ResetCosts();
}

function PressStartBuildButton() {
    CurrentlyBuilding = "Start";
}

function PressFinishBuildButton() {
    CurrentlyBuilding = "Finish";
}

function PressWallBuildButton() {
    CurrentlyBuilding = "Wall";
}

function StartPathfindingButton() {
    if (ChosenAlgorithm === "BreadthWidthSearch") {
        BreadthWidthSearch();
    } else if (ChosenAlgorithm === "A*") {
        AStarSearch()
    } else if (ChosenAlgorithm == "GreedyBestFirstSearch") {
        GreedyBestFirstSearch();
    }
    else {
        alert("Algorithm Not Yet Implemented");
    }
   
}

function StartMazeGeneration() {
    if (ChosenMazeAlgorithm === "DFSMaze") {
        DFSMaze();
    } else if (ChosenMazeAlgorithm === "PrimsMaze") {
        PrimsMaze();
    } else if (ChosenMazeAlgorithm === "GrowingTree") {
        GrowingTree();
    }else {
        alert("Maze Algorithm Not Yet Implemented");
    }
}

function ResetGridButton() {
    CreateGrid();
}

function OptionChanged() {
    ChosenAlgorithm = PathfindingSelect.value;
}

function OptionChangedMaze() {
    ChosenMazeAlgorithm = MazefindingSelect.value;
}

Container.addEventListener('click', function(event) {
    const clickedElement = event.target;
    if (clickedElement.className != "GridCell" && clickedElement.className != "StartGridCell" && clickedElement.className != "FinishGridCell" && clickedElement.className != "OcupiedGridCell" && clickedElement.className != "PathGridCell") {
        return
    }

    if (CurrentlyBuilding == "Start") {

        if (StartElement != null & StartElement != clickedElement) {
            StartElement.className = "GridCell";
            StartElement.textContent = ""
            StartNode.Type = "Empty"
            StartNode = null;
        }

        if (clickedElement.className == "StartGridCell") {
            clickedElement.className = "GridCell";  
        } else {
            StartElement = clickedElement;
            StartElement.className = "StartGridCell";
            StartElement.textContent = "A"

            StartNode = StartElement.id.split("/");
            StartNode = Grid[parseInt(StartNode[0])][parseInt(StartNode[1])];
            StartNode.Type = "Start";
        }
    }
    if (CurrentlyBuilding == "Finish") {
        if (EndElement != null & EndElement != clickedElement) {
            EndElement.className = "GridCell";
            EndElement.textContent = ""
            EndNode.Type = "Empty"
            EndNode = null;
        }

        if (clickedElement.className == "FinishGridCell") {
            clickedElement.className = "GridCell";
        } else {
            EndElement = clickedElement;
            EndElement.className = "FinishGridCell";
            EndElement.textContent = "B"

            EndNode = EndElement.id.split("/");
            EndNode = Grid[parseInt(EndNode[0])][parseInt(EndNode[1])];
            EndNode.Type = "Finish";

        }

       
    }
    if (CurrentlyBuilding == "Wall") {

        if (clickedElement.className == "OcupiedGridCell") {
            clickedElement.className = "GridCell";
            let Node = clickedElement.id.split("/");
            Node = Grid[parseInt(Node[0])][parseInt(Node[1])];
            Node.Type = "Empty";
        } else {
            clickedElement.className = "OcupiedGridCell";
            let Node = clickedElement.id.split("/");
            Node = Grid[parseInt(Node[0])][parseInt(Node[1])];
            Node.Type = "Wall";
        }

    }
});

CreateGrid();
