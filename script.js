const addBtns = document.querySelectorAll(".add-btn:not(.solid)");
const saveItemBtns = document.querySelectorAll(".solid");
const addItemContainers = document.querySelectorAll(".add-container");
const addItems = document.querySelectorAll(".add-item");

// Item Lists
const listColumns = document.querySelectorAll(".drag-item-list");
const backlogListEl = document.getElementById("to-do-list");
const progressListEl = document.getElementById("doing-list");
const completeListEl = document.getElementById("done-list");
const onHoldListEl = document.getElementById("on-hold-list");

// Items
let updatedOnLoad = false;

// Initialize Arrays
let backlogListArray = [];
let progressListArray = [];
let completeListArray = [];
let onHoldListArray = [];
let listArrays = [];

// Drag Functionality
let draggedItem;
let dragging = false;
let currentColumn;

// Get Arrays from localStorage if available, set default values if not
function getSavedColumns() {
	if (localStorage.getItem("backlogItems")) {
		backlogListArray = JSON.parse(localStorage.backlogItems);
		progressListArray = JSON.parse(localStorage.progressItems);
		completeListArray = JSON.parse(localStorage.completeItems);
		onHoldListArray = JSON.parse(localStorage.onHoldItems);
	} else {
		const intro = prompt(
			"Type 'y' (Yes) if you want to display an Editable Sample? \n(Not typing 'y' will display a plane NEW board.)"
		);
		if (intro === "y" || intro === "Y") {
			backlogListArray = [
				"Write the documentation",
				"Post a technical article",
			];
			progressListArray = ["Work on Droppi project", "Listen to Spotify"];
			completeListArray = ["Submit a PR", "Review my projects code"];
			onHoldListArray = ["Get a girlfriend"];
		} else {
			backlogListArray = [];
			progressListArray = [];
			completeListArray = [];
			onHoldListArray = [];
		}
	}
}

// Set localStorage Arrays
function updateSavedColumns() {
	listArrays = [
		backlogListArray,
		progressListArray,
		completeListArray,
		onHoldListArray,
	];
	const arrayNames = ["backlog", "progress", "complete", "onHold"];
	arrayNames.forEach((arrayName, index) => {
		localStorage.setItem(
			`${arrayName}Items`,
			JSON.stringify(listArrays[index])
		);
	});

	// Similar as code above(DRY):

	// localStorage.setItem("backlogItems", JSON.stringify(backlogListArray));
	// localStorage.setItem("progressItems", JSON.stringify(progressListArray));
	// localStorage.setItem("completeItems", JSON.stringify(completeListArray));
	// localStorage.setItem("onHoldItems", JSON.stringify(onHoldListArray));
}

// Filter Array to remove empty values
function filterArray(array) {
	const filteredArray = array.filter((item) => item !== null);
	return filteredArray;
}

// Create DOM Elements for each list item
function createItemEl(columnEl, column, item, index) {
    // Task card
    const listEl = document.createElement("li");
    listEl.id = index;
    listEl.classList.add("drag-item");
    listEl.draggable = true;
    listEl.setAttribute("ondragstart", "drag(event)");

    // Task text
    const textEl = document.createElement("span");
    textEl.classList.add("task-text");
    textEl.textContent = item;
    textEl.contentEditable = true;
    textEl.setAttribute("onfocusout", `updateItem(${index}, ${column})`);

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.textContent = "Delete";
    deleteBtn.type = "button";
    deleteBtn.setAttribute("contenteditable", "false");
    deleteBtn.setAttribute("draggable", "false");

    deleteBtn.addEventListener("click", function (event) {
        event.stopPropagation();
        deleteItem(column, index);
    });

    // Add elements to card
    listEl.appendChild(textEl);
    listEl.appendChild(deleteBtn);

    // Add card to column
    columnEl.appendChild(listEl);
}



// Update Columns in DOM - Reset HTML, Filter Array, Update localStorage
function updateDOM() {
	// Check localStorage once
	if (!updatedOnLoad) {
		getSavedColumns();
	}
	// Backlog Column
	backlogListEl.textContent = "";
	backlogListArray.forEach((backlogItem, index) => {
		createItemEl(backlogListEl, 0, backlogItem, index);
	});
	backlogListArray = filterArray(backlogListArray);
	// Progress Column
	progressListEl.textContent = "";
	progressListArray.forEach((progressItem, index) => {
		createItemEl(progressListEl, 1, progressItem, index);
	});
	progressListArray = filterArray(progressListArray);
	// Complete Column
	completeListEl.textContent = "";
	completeListArray.forEach((completeItem, index) => {
		createItemEl(completeListEl, 2, completeItem, index);
	});
	completeListArray = filterArray(completeListArray);
	// On Hold Column
	onHoldListEl.textContent = "";
	onHoldListArray.forEach((onHoldItem, index) => {
		createItemEl(onHoldListEl, 3, onHoldItem, index);
	});
	onHoldListArray = filterArray(onHoldListArray);
	// Run getSavedColumns only once, Update Local Storage
	updatedOnLoad = true;
	updateSavedColumns();
}

// Update Task - Delete if empty, otherwise update task text
function updateItem(id, column) {
    const selectedArray = listArrays[column];
    const selectedColumn = listColumns[column].children;

    if (!dragging) {
        const taskText = selectedColumn[id].querySelector(".task-text");

        if (!taskText.textContent.trim()) {
            selectedArray.splice(id, 1);
        } else {
            selectedArray[id] = taskText.textContent.trim();
        }

        updateDOM();
    }
}

// Delete Task
function deleteItem(column, index) {
    const selectedArray = listArrays[column];

    if (confirm("Are you sure you want to delete this task?")) {
        selectedArray.splice(index, 1);
        updateDOM();
    }
}

// Add to Column List, Reset Textbox
function addToColumn(column) {
    const itemText = addItems[column].textContent.trim();
    const selectedArray = listArrays[column];

    // Prevent empty tasks
    if (!itemText) {
        alert("Please enter a task before saving.");
        addItems[column].focus();
        return false;
    }

    selectedArray.push(itemText);
    addItems[column].textContent = "";
    updateDOM(column);

    return true;
}

// Show Add Item Input Box
function showInputBox(column) {
	addBtns[column].style.visibility = "hidden";
	saveItemBtns[column].style.display = "flex";
	addItemContainers[column].style.display = "flex";
}

// Hide Item Input Box
function hideInputBox(column) {
    const saved = addToColumn(column);

    if (!saved) {
        return;
    }

    addBtns[column].style.visibility = "visible";
    saveItemBtns[column].style.display = "none";
    addItemContainers[column].style.display = "none";
}

// Rebuild arrays after Drag and Drop
function rebuildArrays() {
    backlogListArray = [];
    for (let i = 0; i < backlogListEl.children.length; i++) {
        backlogListArray.push(
            backlogListEl.children[i].querySelector(".task-text").textContent
        );
    }

    progressListArray = [];
    for (let i = 0; i < progressListEl.children.length; i++) {
        progressListArray.push(
            progressListEl.children[i].querySelector(".task-text").textContent
        );
    }

    completeListArray = [];
    for (let i = 0; i < completeListEl.children.length; i++) {
        completeListArray.push(
            completeListEl.children[i].querySelector(".task-text").textContent
        );
    }

    onHoldListArray = [];
    for (let i = 0; i < onHoldListEl.children.length; i++) {
        onHoldListArray.push(
            onHoldListEl.children[i].querySelector(".task-text").textContent
        );
    }

    updateDOM();
}

// When Item Enters Column Area
function dragEnter(column) {
	listColumns[column].classList.add("over");
	currentColumn = column;
}

// When Item Starts Dragging
function drag(e) {
	draggedItem = e.target;
	dragging = true;
}

// Column Allows for Item to Drop
function allowDrop(e) {
	e.preventDefault();
}

// Dropping Item in Column
function drop(e) {
	e.preventDefault();
	const parent = listColumns[currentColumn];
	// Remove Background Color/Padding
	listColumns.forEach((column) => {
		column.classList.remove("over");
	});
	// Add item to Column
	parent.appendChild(draggedItem);
	// Dragging complete
	dragging = false;
	rebuildArrays();
}

// On Load
updateDOM();
