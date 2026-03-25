const API_URL = 'https://taskmanager-java.onrender.com/api';

// Check Authentication immediately
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'index.html';
}

// UI Elements
const displayUsername = document.getElementById('displayUsername');
const logoutBtn = document.getElementById('logoutBtn');
const tasksList = document.getElementById('tasksList');

// Modal Elements
const modalOverlay = document.getElementById('taskModalOverlay');
const openModalBtn = document.getElementById('openCreateTaskModal');
const closeModalBtn = document.getElementById('closeTaskModal');
const taskForm = document.getElementById('taskForm');
const modalTitle = document.getElementById('modalTitle');

// Set Welcome Username
displayUsername.textContent = `Welcome, ${localStorage.getItem('username') || 'User'}!`;

// Toast System
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const icon = toast.querySelector('ion-icon');

    toast.className = `toast ${type}`;
    icon.setAttribute('name', type === 'success' ? 'checkmark-circle-outline' : 'warning-outline');
    toastMessage.textContent = message;

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Format Date Utility
function formatDate(dateArray) {
    if (!dateArray || !Array.isArray(dateArray)) return 'Unknown Date';
    // Java LocalDateTime comes as [year, month, day, hour, minute, second]
    const date = new Date(dateArray[0], dateArray[1] - 1, dateArray[2], dateArray[3], dateArray[4]);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Fetch and Render Tasks
async function fetchTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            window.location.href = 'index.html';
            return;
        }

        const tasks = await response.json();

        if (tasks.length === 0) {
            tasksList.innerHTML = `
                <div class="task-card" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
                    <ion-icon name="clipboard-outline" style="font-size: 4rem; color: var(--text-secondary); margin-bottom: 1rem;"></ion-icon>
                    <h3>No tasks found</h3>
                    <p style="color: var(--text-secondary);">You're all caught up! Create a new task to get started.</p>
                </div>
            `;
            return;
        }

        tasksList.innerHTML = tasks.map(task => `
            <div class="task-card" data-priority="${task.priority}">
                <div class="task-header">
                    <h3 class="task-title">${task.title}</h3>
                    <span class="task-badge badge-${task.status.toLowerCase()}">${task.status.replace('_', ' ')}</span>
                </div>
                <p class="task-desc">${task.description || 'No description provided.'}</p>

                <div style="color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.25rem;">
                    <ion-icon name="time-outline"></ion-icon> Created ${formatDate(task.createdAt)}
                </div>

                <div class="task-actions">
                    <button class="btn btn-outline btn-small" onclick="openEditModal(${task.id}, '${task.title.replace(/'/g, "\\'")}', '${(task.description || '').replace(/'/g, "\\'")}', '${task.status}', '${task.priority}')">
                        <ion-icon name="create-outline"></ion-icon> Edit
                    </button>
                    <button class="btn btn-outline btn-small" style="color: var(--danger-color); border-color: rgba(239, 68, 68, 0.3);" onclick="deleteTask(${task.id})">
                        <ion-icon name="trash-outline"></ion-icon> Delete
                    </button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        showToast('Failed to load tasks. Check connection.', 'error');
        console.error(error);
    }
}

// Save Task (Create or Update)
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('taskId').value;
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const status = document.getElementById('taskStatus').value;
    const priority = document.getElementById('taskPriority').value;
    const btn = document.getElementById('saveTaskBtn');

    btn.innerHTML = `<span class="spinner"></span> Saving...`;
    btn.disabled = true;

    try {
        const method = id ? 'PUT' : 'POST';
        const endpoint = id ? `${API_URL}/tasks/${id}` : `${API_URL}/tasks`;

        const response = await fetch(endpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, description, status, priority })
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            window.location.href = 'index.html';
            return;
        }

        if (response.ok) {
            showToast(`Task ${id ? 'updated' : 'created'} successfully!`);
            closeModal();
            fetchTasks();
        } else {
            const data = await response.json();
            showToast(data.message || 'Failed to save task.', 'error');
        }
    } catch (error) {
        showToast('Network error while saving task.', 'error');
        console.error(error);
    } finally {
        btn.innerHTML = 'Save Task';
        btn.disabled = false;
    }
});

// Delete Task
window.deleteTask = async (id) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            window.location.href = 'index.html';
            return;
        }

        if (response.ok) {
            showToast('Task deleted successfully.');
            fetchTasks();
        } else {
            showToast('Failed to delete task.', 'error');
        }
    } catch (error) {
        showToast('Network error.', 'error');
    }
};

// Modal Logic
function openModal(title = 'Create New Task') {
    modalTitle.textContent = title;
    modalOverlay.classList.add('active');
}

function closeModal() {
    modalOverlay.classList.remove('active');
    taskForm.reset();
    document.getElementById('taskId').value = '';
}

window.openEditModal = (id, title, desc, status, priority) => {
    document.getElementById('taskId').value = id;
    document.getElementById('taskTitle').value = title;
    document.getElementById('taskDescription').value = desc;
    document.getElementById('taskStatus').value = status;
    document.getElementById('taskPriority').value = priority;

    openModal('Edit Task');
};

openModalBtn.addEventListener('click', () => openModal('Create New Task'));
closeModalBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
});

// Initial Fetch
fetchTasks();