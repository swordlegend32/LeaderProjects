
const Container = document.getElementById('container');
let Rows = 8;
let Columns = 20;
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


async function BreadthWidthSearch() {
    if (StartNode == null || EndNode == null) {
        alert("Please select a start and end node");
        return;
    }

    let OpenList = [];
    let Seen = new Set();

    OpenList.push(StartNode);

    while (OpenList.length > 0) {
        let CurrentNode = OpenList.shift();

        if (CurrentNode.x === EndNode.x && CurrentNode.y === EndNode.y) {
            let PathNode = CurrentNode
            while (PathNode.PrevoiusNode != null) {
                PathNode = PathNode.PrevoiusNode
                if (PathNode.Type === "Start") {
                    break;
                }
                let Element = document.getElementById(`${PathNode.x}/${PathNode.y}`);
                Element.className = "PathGridCell";
               
            }
            break;
        }

        let Neighbors = GetNeighbors(CurrentNode);
        for (let i = 0; i < Neighbors.length; i++) {
            let Neighbor = Neighbors[i];

            if (Seen.has(Neighbor) || OpenList.includes(Neighbor)) {
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
        Seen.add(CurrentNode);
        let currentElement = document.getElementById(`${CurrentNode.x}/${CurrentNode.y}`);
        if (currentElement && currentElement.className == "QueueGridCell") {
            currentElement.className = "SearchedGridCell";
        
        }
           

        await new Promise(resolve => setTimeout(resolve, 25));
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


function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }

function AStarSearch() {
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
            StartNode = null;
        }

        if (clickedElement.className == "StartGridCell") {
            clickedElement.className = "GridCell";
        } else {
            StartElement = clickedElement;
            StartElement.className = "StartGridCell";

            StartNode = StartElement.id.split("/");
            StartNode = Grid[parseInt(StartNode[0])][parseInt(StartNode[1])];
            StartNode.Type = "Start";
        }
    }
    if (CurrentlyBuilding == "Finish") {
        if (EndElement != null & EndElement != clickedElement) {
            EndElement.className = "GridCell";
            EndNode = null;
        }

        if (clickedElement.className == "FinishGridCell") {
            clickedElement.className = "GridCell";
        } else {
            EndElement = clickedElement;
            EndElement.className = "FinishGridCell";

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
