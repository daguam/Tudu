document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    updateScoreDisplay();
});

function addTask() {
    const input = document.getElementById('taskInput');
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    if (input.value.trim() !== '') {
        const task = { text: input.value.trim(), difficulty: difficulty };
        console.log("Adding task:", task); // Debugging statement
        saveTask(task);
        appendTaskToList(task);
        input.value = '';
    } else {
        console.log("No task input provided."); // Debugging statement
    }
}

function appendTaskToList(task, isCompleted = false) {
    const taskList = isCompleted ? document.getElementById('completedList') : document.getElementById('taskList');
    const li = document.createElement('li');
    li.textContent = `${task.text} (${task.difficulty})`;

    const btnContainer = document.createElement('div'); // Container for buttons

    if (!isCompleted) {
        const completeBtn = createButton('✓', 'complete', () => completeTask(task, li));
        btnContainer.appendChild(completeBtn);
    }

    const deleteBtn = createButton('X', 'delete', () => deleteTask(task, li));
    btnContainer.appendChild(deleteBtn);

    li.appendChild(btnContainer);
    taskList.appendChild(li);
}


function createButton(text, className, onClickFunction) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = className;
    button.onclick = onClickFunction;
    return button;
}

function saveTask(task) {
    let tasks = getStoredTasks();
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = getStoredTasks();
    tasks.forEach(task => appendTaskToList(task));
}

function getStoredTasks() {
    let tasks = localStorage.getItem('tasks');
    return tasks ? JSON.parse(tasks) : [];
}

function deleteTask(taskToDelete, listItem) {
    const tasks = getStoredTasks().filter(task => task.text !== taskToDelete.text);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    listItem.remove();
}

function completeTask(taskToComplete, listItem) {
    const tasks = getStoredTasks().filter(task => task.text !== taskToComplete.text);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    listItem.remove();
    updateScore(taskToComplete.difficulty);

    // Add the task to the completed list
    appendTaskToList(taskToComplete, true);
}

function updateScore(difficulty) {
    let score = parseInt(localStorage.getItem('score') || 0);
    score += getPointsForDifficulty(difficulty);
    localStorage.setItem('score', score.toString());
    updateScoreDisplay();
}

function getPointsForDifficulty(difficulty) {
    const points = { 'easy': 100, 'medium': 250, 'hard': 500 };
    return points[difficulty] || 0;
}

function updateScoreDisplay() {
    const scoreDisplay = document.getElementById('score');
    scoreDisplay.textContent = `Score: ${localStorage.getItem('score') || 0}`;
}

function importTasks(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const lines = e.target.result.split('\n');
        lines.forEach(line => {
            if (line.trim() !== '') {
                const parts = line.split(',');
                if (parts.length === 2) {
                    const [text, difficulty] = parts;
                    const task = { text: text.trim(), difficulty: difficulty.trim() };
                    if (!getStoredTasks().some(storedTask => storedTask.text === task.text)) {
                        saveTask(task);
                        appendTaskToList(task);
                    }
                }
            }
        });
    };
    reader.readAsText(file);
}


function exportTasks() {
    const tasks = getStoredTasks();
    const exportData = tasks.map(task => `${task.text},${task.difficulty}`).join('\n');
    const blob = new Blob([exportData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.txt';
    a.click();
    URL.revokeObjectURL(url);
}
document.getElementById('addTaskButton').addEventListener('click', addTask);
document.getElementById('exportButton').addEventListener('click', exportTasks);
