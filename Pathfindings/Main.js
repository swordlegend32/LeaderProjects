
const Container = document.getElementById('container');
let Rows = 16;
let Columns = 40;
let Grid = [];

const StartBuildButton = document.getElementById('StartNodeBuilder');
StartBuildButton.addEventListener('click', PressStartBuildButton);

const EndBuildButton = document.getElementById('EndNodeBuilder');
EndBuildButton.addEventListener('click', PressFinishBuildButton);

const WallBuildButton = document.getElementById('WallNodeBuilder');
WallBuildButton.addEventListener('click', PressWallBuildButton);

const StartPathfinding = document.getElementById('StartPathfinding');
StartPathfinding.addEventListener('click', StartPathfindingButton);

const ResetGridButtonB = document.getElementById('ResetGridButton');
ResetGridButtonB.addEventListener('click', ResetGridButton);

const PathfindingSelect = document.getElementById('Algorithms');
PathfindingSelect.addEventListener('change', OptionChanged);

const GridSizeSlider = document.getElementById('GridSize');
GridSizeSlider.addEventListener('change', function() {
    let value = GridSizeSlider.value / 2;
    scale = Math.round(value / 0.5) * 0.5;
    console.log(scale)
    ResizeGrid()
});

let CurrentlyBuilding = null;

let StartElement = null;
let EndElement = null;

let StartNode = null;
let EndNode = null;

let PathfindingInProcess = false;

let scale = 1;

let ChosenAlgorithm = "BreadthWidthSearch";

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

            GridCell.style.width = `${Math.floor(25 / scale)}px`;
            GridCell.style.height = `${Math.floor(25 / scale)}px`;
            GridCell.style.border = `${Math.floor(2 / scale)}px solid black`;
            GridCell.style.borderRadius = `${Math.floor(2 / scale)}px`;  

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

    StartNode = null;
    EndNode = null;
    StartElement = null;
    EndElement = null;
    PathfindingInProcess = false;

    Container.style.gridTemplateColumns = `repeat(${Columns * scale}, ${Math.floor(25 / scale)}px)`;
    Container.style.gridTemplateRows = `repeat(${Rows * scale}, ${Math.floor(25 / scale)}px)`;

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

            GridCell.style.width = `${Math.floor(25 / scale)}px`;
            GridCell.style.height = `${Math.floor(25 / scale)}px`;
            GridCell.style.border = `${Math.floor(2 / scale)}px solid black`;

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

    StartNode["GCost"] = 0;  // Initialize GCost for the Start Node
    OpenList.push(StartNode);

    while (OpenList.length > 0) {
        let CurrentNode = OpenList.shift();

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
                await new Promise(resolve => setTimeout(resolve, 50));
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
                    if (ElementCell && ElementCell.className == "GridCell") {
                        ElementCell.className = "QueueGridCell";
                    }
                }
            }
        }

        ClosedList.push(CurrentNode);
        let currentElement = document.getElementById(`${CurrentNode.x}/${CurrentNode.y}`);
        if (currentElement && currentElement.className == "QueueGridCell") {
            currentElement.className = "SearchedGridCell";
        }

        await new Promise(resolve => setTimeout(resolve, 5));
    }

    PathfindingInProcess = false;
    ResetCosts();
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

        if (CurrentNode.x === EndNode.x && CurrentNode.y === EndNode.y) {

            for (let i = 0; i < ClosedList.length; i++) {
                let CurrentGridCell = ClosedList[i];
                let ElementCell = document.getElementById(`${CurrentGridCell.x}/${CurrentGridCell.y}`);
                if (ElementCell && (ElementCell.className == "SearchedGridCell" || ElementCell.className == "QueueGridCell" || ElementCell.className == "PathGridCell")) {
                    ElementCell.className = "GridCell";
                    ElementCell.textContent = "";
                }
            }

            for (let i = 0; i < OpenList.length; i++) {
                let CurrentGridCell = OpenList[i];
                let ElementCell = document.getElementById(`${CurrentGridCell.x}/${CurrentGridCell.y}`);
                if (ElementCell && (ElementCell.className == "SearchedGridCell" || ElementCell.className == "QueueGridCell" || ElementCell.className == "PathGridCell")) {
                    ElementCell.className = "GridCell";
                    ElementCell.textContent = "";
                }
            }

            let PathNode = CurrentNode;
            while (PathNode.Parent != null) {
                PathNode = PathNode.Parent;
                if (PathNode.Type === "Start") {
                    PathfindingInProcess = false;
                    ResetCosts();
                    break;
                }
                let Element = document.getElementById(`${PathNode.x}/${PathNode.y}`);
                Element.className = "PathGridCell";
                Element.textContent = "";
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            return;
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

        await new Promise(resolve => setTimeout(resolve, 5));
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
    }
    else {
        alert("Algorithm Not Yet Implemented");
    }
   
}

function ResetGridButton() {
    CreateGrid();
}

function OptionChanged() {
    ChosenAlgorithm = PathfindingSelect.value;
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
