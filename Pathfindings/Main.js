
const Container = document.getElementById('container');
let Rows = 16;
let Columns = 40;
let Grid = [];
let ElementGrid = [];

const StartBuildButton = document.getElementById('StartNodeBuilder');
StartBuildButton.addEventListener('click', PressStartBuildButton);

const EndBuildButton = document.getElementById('EndNodeBuilder');
EndBuildButton.addEventListener('click', PressFinishBuildButton);

const WallBuildButton = document.getElementById('WallNodeBuilder');
WallBuildButton.addEventListener('click', PressWallBuildButton);

const StartPathfinding = document.getElementById('StartPathfinding');
StartPathfinding.addEventListener('click', StartPathfindingButton);

let CurrentlyBuilding = null;

let StartElement = null;
let EndElement = null;

let StartNode = null;
let EndNode = null;

let PathfindingComplete = false

function ResetGrid() {
    for (let i = 0; i < Rows; i++) {
        for (let j = 0; j < Columns; j++) {
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
    for (let i = 0; i < Rows; i++) {
        Grid[i] = [];
        ElementGrid[i] = [];
        for (let j = 0; j < Columns; j++) {

            Grid[i][j] = {Type: "Empty", x: i, y: j};
            let GridCell = document.createElement("div");

            GridCell.textContent =  "";
            GridCell.className = "GridCell";
            GridCell.id = `${i}/${j}`;

            GridCell.style.gridRowStart = i + 1; 
            GridCell.style.gridColumnStart = j + 1;

            Container.appendChild(GridCell);
            ElementGrid[i][j] = GridCell;
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

        if (NewX >= 0 && NewX < Rows && NewY >= 0 && NewY < Columns) {
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

    if (PathfindingComplete === true) {
        ResetGrid()
        PathfindingComplete = false
        alert("Pathfinding Already Complete");
        return;
    }

    let OpenList = [];
    let Seen = [];

    OpenList.push(StartNode);

    while (OpenList.length > 0) {
        let CurrentNode = OpenList.shift();

        if (CurrentNode.x === EndNode.x && CurrentNode.y === EndNode.y) {

            for (let i = 0; i < Seen.length; i ++) {
                let CurrentGridCell = Seen[i]
                let ElementCell = document.getElementById(`${CurrentGridCell.x}/${CurrentGridCell.y}`);
                if (ElementCell && ElementCell.className == "SearchedGridCell" || ElementCell.className == "QueueGridCell" || ElementCell.className == "PathGridCell") {
                    ElementCell.className = "GridCell";
                }
            }

            for (let i = 0; i < OpenList.length; i ++) {
                let CurrentGridCell = OpenList[i]
                let ElementCell = document.getElementById(`${CurrentGridCell.x}/${CurrentGridCell.y}`);
                if (ElementCell && ElementCell.className == "SearchedGridCell" || ElementCell.className == "QueueGridCell" || ElementCell.className == "PathGridCell") {
                    ElementCell.className = "GridCell";
                }
            }

            let PathNode = CurrentNode
            while (PathNode.PrevoiusNode != null) {
                PathNode = PathNode.PrevoiusNode
                if (PathNode.Type === "Start") {
                    break;
                }
                let Element = document.getElementById(`${PathNode.x}/${PathNode.y}`);
                Element.className = "PathGridCell";
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            break;
        }

        let Neighbors = GetNeighbors(CurrentNode);
        for (let i = 0; i < Neighbors.length; i++) {
            let Neighbor = Neighbors[i];

            if (Seen.includes(Neighbor) || OpenList.includes(Neighbor)) {
                continue;
            }

            if (Neighbor.Type === "Wall" || Neighbor.Type === "Start") { 
                continue;
            }

            Neighbor["PrevoiusNode"] = CurrentNode;

            OpenList.push(Neighbor);

            let ElementCell = document.getElementById(`${Neighbor.x}/${Neighbor.y}`);
            if (ElementCell && ElementCell.className == "GridCell") {
                ElementCell.className = "QueueGridCell";
            }

        }
        Seen.push(CurrentNode);
        let currentElement = document.getElementById(`${CurrentNode.x}/${CurrentNode.y}`);
        if (currentElement && currentElement.className == "QueueGridCell") {
            currentElement.className = "SearchedGridCell";
        }
           

        await new Promise(resolve => setTimeout(resolve, 25));
    }
    PathfindingComplete = true
}


function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }

async function AStarSearch() {

    if (StartNode == null || EndNode == null ) {
        alert("Please select a start and end node");
        return;
    }

    
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
    BreadthWidthSearch()
}
Container.addEventListener('click', function(event) {
    const clickedElement = event.target;
    if (clickedElement.className != "GridCell" && clickedElement.className != "StartGridCell" && clickedElement.className != "FinishGridCell" && clickedElement.className != "OcupiedGridCell") {
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
