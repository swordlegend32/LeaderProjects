
const Container = document.getElementById('container');
let Rows = 20;
let Columns = 8;
let Grid = [];

const StartBuildButton = document.getElementById('StartNodeBuilder');
StartBuildButton.addEventListener('click', PressStartBuildButton);

const EndBuildButton = document.getElementById('EndNodeBuilder');
EndBuildButton.addEventListener('click', PressFinishBuildButton);

const WallBuildButton = document.getElementById('WallNodeBuilder');
WallBuildButton.addEventListener('click', PressWallBuildButton);

let CurrentlyBuilding = null;

let StartElement = null;
let EndElement = null;

let StartNode = null;
let EndNode = null;

function CreateGrid() {
    for (let i = 0; i < Rows; i++) {
        Grid[i] = [];
        for (let j = 0; j < Columns; j++) {
            Grid[i][j] = "Empty";
            let GridCell = document.createElement("div");
            GridCell.textContent =  "";
            GridCell.className = "GridCell";
            GridCell.id = i + "/" + j;
            Container.appendChild(GridCell);
        }
    }
}

function BreadthWidthSearch() {
    if (StartNode == null || EndNode == null ) {
        alert("Please select a start and end node");
        return;
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

Container.addEventListener('click', function(event) {
    const clickedElement = event.target;
    if (CurrentlyBuilding == "Start") {

        if (StartElement != null & StartElement != clickedElement) {
            StartElement.className = "GridCell";
        }

        if (clickedElement.className == "StartGridCell") {
            clickedElement.className = "GridCell";
        } else {
            StartElement = clickedElement;
            StartElement.className = "StartGridCell";

            StartNode = StartElement.id.split("/");
            StartNode = { x: parseInt(StartNode[0]), y: parseInt(StartNode[1]) };
        }
    }
    if (CurrentlyBuilding == "Finish") {
        if (EndElement != null & EndElement != clickedElement) {
            EndElement.className = "GridCell";
        }

        if (clickedElement.className == "FinishGridCell") {
            clickedElement.className = "GridCell";
        } else {
            EndElement = clickedElement;
            EndElement.className = "FinishGridCell";

            EndNode = StartElement.id.split("/");
            EndNode = { x: parseInt(EndNode[0]), y: parseInt(EndNode[1]) };
        }

       
    }
    if (CurrentlyBuilding == "Wall") {

        if (clickedElement.className == "OcupiedGridCell") {
            clickedElement.className = "GridCell";
        } else {
            clickedElement.className = "OcupiedGridCell";
        }

    }
});

CreateGrid();
