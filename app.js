/* ========================================
   app.js - Lógica de la Aplicación
   ======================================== */

// ===== ESTADO DE LA APLICACIÓN =====
let patients = [];
let auxiliaries = [];
let assignments = {};
let editingPatient = null;
let editingAuxiliary = null;

// ===== ELEMENTOS DEL DOM =====
const patientForm = document.getElementById('patientForm');
const patientNameInput = document.getElementById('patientName');
const patientList = document.getElementById('patientList');
const patientCount = document.getElementById('patientCount');

const auxiliaryForm = document.getElementById('auxiliaryForm');
const auxiliaryNameInput = document.getElementById('auxiliaryName');
const auxiliaryList = document.getElementById('auxiliaryList');
const auxiliaryCount = document.getElementById('auxiliaryCount');

const assignBtn = document.getElementById('assignBtn');
const assignmentInfo = document.getElementById('assignmentInfo');
const assignmentsSection = document.getElementById('assignmentsSection');
const assignmentsList = document.getElementById('assignmentsList');

// ===== INICIALIZACIÓN =====
function init() {
    loadFromStorage();
    renderPatients();
    renderAuxiliaries();
    updateAssignButton();
    
    // Renderizar asignaciones si existen al cargar
    if (Object.keys(assignments).length > 0 && auxiliaries.length > 0 && assignments[auxiliaries[0]]?.length > 0) {
        renderAssignments();
    }
}

// ===== ALMACENAMIENTO LOCAL =====
function saveToStorage() {
    const data = {
        patients,
        auxiliaries,
        assignments
    };
    localStorage.setItem('hospitalAssignments', JSON.stringify(data));
}

function loadFromStorage() {
    const stored = localStorage.getItem('hospitalAssignments');
    if (stored) {
        const data = JSON.parse(stored);
        patients = data.patients || [];
        auxiliaries = data.auxiliaries || [];
        assignments = data.assignments || {};
    }
}

// ===== GESTIÓN DE PACIENTES =====
patientForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = patientNameInput.value.trim();

    if (!name) {
        alert('⚠️ Por favor ingrese un nombre válido');
        return;
    }

    if (editingPatient !== null) {
        // Modo edición
        const oldName = patients[editingPatient];
        if (isDuplicatePatient(name) && name !== oldName) {
            alert('⚠️ Este paciente ya existe en la lista');
            return;
        }
        patients[editingPatient] = name;
        editingPatient = null;
        patientForm.querySelector('button[type="submit"]').textContent = '➕ Agregar Paciente';
    } else {
        // Modo agregar
        if (isDuplicatePatient(name)) {
            alert('⚠️ Este paciente ya existe en la lista');
            return;
        }
        patients.push(name);
    }

    patientNameInput.value = '';
    saveToStorage();
    renderPatients();
    updateAssignButton();
    
    // Limpiar asignaciones previas
    if (Object.keys(assignments).length > 0) {
        assignmentsSection.classList.add('hidden');
        assignments = {};
    }
});

function isDuplicatePatient(name) {
    return patients.some(p => p.toLowerCase() === name.toLowerCase());
}

function editPatient(index) {
    editingPatient = index;
    patientNameInput.value = patients[index];
    patientNameInput.focus();
    patientForm.querySelector('button[type="submit"]').textContent = '✏️ Actualizar Paciente';
}

function deletePatient(index) {
    if (confirm(`¿Está seguro de eliminar al paciente "${patients[index]}"?`)) {
        patients.splice(index, 1);
        saveToStorage();
        renderPatients();
        updateAssignButton();
        
        // Limpiar asignaciones previas
        if (Object.keys(assignments).length > 0) {
            assignmentsSection.classList.add('hidden');
            assignments = {};
        }
    }
}

function renderPatients() {
    patientCount.textContent = patients.length;

    if (patients.length === 0) {
        patientList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏥</div>
                <div class="empty-state-text">No hay pacientes registrados</div>
            </div>
        `;
        return;
    }

    patientList.innerHTML = patients.map((patient, index) => `
        <li class="list-item fade-in">
            <span class="list-item-name">${patient}</span>
            <div class="list-item-actions">
                <button class="btn btn-edit" onclick="editPatient(${index})">✏️</button>
                <button class="btn btn-danger" onclick="deletePatient(${index})">🗑️</button>
            </div>
        </li>
    `).join('');
}

// ===== GESTIÓN DE AUXILIARES =====
auxiliaryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = auxiliaryNameInput.value.trim();

    if (!name) {
        alert('⚠️ Por favor ingrese un nombre válido');
        return;
    }

    if (editingAuxiliary !== null) {
        // Modo edición
        const oldName = auxiliaries[editingAuxiliary];
        if (isDuplicateAuxiliary(name) && name !== oldName) {
            alert('⚠️ Este auxiliar ya existe en la lista');
            return;
        }
        auxiliaries[editingAuxiliary] = name;
        editingAuxiliary = null;
        auxiliaryForm.querySelector('button[type="submit"]').textContent = '➕ Agregar Auxiliar';
    } else {
        // Modo agregar
        if (isDuplicateAuxiliary(name)) {
            alert('⚠️ Este auxiliar ya existe en la lista');
            return;
        }
        auxiliaries.push(name);
    }

    auxiliaryNameInput.value = '';
    saveToStorage();
    renderAuxiliaries();
    updateAssignButton();
    
    // Limpiar asignaciones previas
    if (Object.keys(assignments).length > 0) {
        assignmentsSection.classList.add('hidden');
        assignments = {};
    }
});

function isDuplicateAuxiliary(name) {
    return auxiliaries.some(a => a.toLowerCase() === name.toLowerCase());
}

function editAuxiliary(index) {
    editingAuxiliary = index;
    auxiliaryNameInput.value = auxiliaries[index];
    auxiliaryNameInput.focus();
    auxiliaryForm.querySelector('button[type="submit"]').textContent = '✏️ Actualizar Auxiliar';
}

function deleteAuxiliary(index) {
    if (confirm(`¿Está seguro de eliminar al auxiliar "${auxiliaries[index]}"?`)) {
        auxiliaries.splice(index, 1);
        saveToStorage();
        renderAuxiliaries();
        updateAssignButton();
        
        // Limpiar asignaciones previas
        if (Object.keys(assignments).length > 0) {
            assignmentsSection.classList.add('hidden');
            assignments = {};
        }
    }
}

function renderAuxiliaries() {
    auxiliaryCount.textContent = auxiliaries.length;

    if (auxiliaries.length === 0) {
        auxiliaryList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👨‍⚕️</div>
                <div class="empty-state-text">No hay auxiliares registrados</div>
            </div>
        `;
        return;
    }

    auxiliaryList.innerHTML = auxiliaries.map((auxiliary, index) => `
        <li class="list-item fade-in">
            <span class="list-item-name">${auxiliary}</span>
            <div class="list-item-actions">
                <button class="btn btn-edit" onclick="editAuxiliary(${index})">✏️</button>
                <button class="btn btn-danger" onclick="deleteAuxiliary(${index})">🗑️</button>
            </div>
        </li>
    `).join('');
}

// ===== ASIGNACIÓN DE PACIENTES =====
function updateAssignButton() {
    const canAssign = patients.length > 0 && auxiliaries.length > 0;
    assignBtn.disabled = !canAssign;
    assignBtn.style.opacity = canAssign ? '1' : '0.5';
    assignBtn.style.cursor = canAssign ? 'pointer' : 'not-allowed';
    
    if (canAssign) {
        assignmentInfo.classList.remove('hidden');
    } else {
        assignmentInfo.classList.add('hidden');
    }
}

assignBtn.addEventListener('click', () => {
    if (patients.length === 0) {
        alert('⚠️ No hay pacientes para asignar');
        return;
    }

    if (auxiliaries.length === 0) {
        alert('⚠️ No hay auxiliares disponibles');
        return;
    }

    assignPatientsEquitably();
});

function assignPatientsEquitably() {
    // Resetear asignaciones
    assignments = {};
    auxiliaries.forEach(aux => {
        assignments[aux] = [];
    });

    // Distribuir pacientes de forma equitativa
    const shuffledPatients = [...patients].sort(() => Math.random() - 0.5);
    
    shuffledPatients.forEach((patient, index) => {
        const auxIndex = index % auxiliaries.length;
        const auxiliary = auxiliaries[auxIndex];
        assignments[auxiliary].push(patient);
    });

    saveToStorage();
    renderAssignments();
    
    // Scroll suave hacia las asignaciones
    setTimeout(() => {
        assignmentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function renderAssignments() {
    assignmentsSection.classList.remove('hidden');

    const totalPatients = patients.length;
    const totalAuxiliaries = auxiliaries.length;
    const avgPatients = Math.floor(totalPatients / totalAuxiliaries);

    let html = `
        <div class="alert alert-info mb-2">
            ✅ Se han asignado <strong>${totalPatients} pacientes</strong> entre 
            <strong>${totalAuxiliaries} auxiliares</strong>
            (${avgPatients}-${avgPatients + 1} pacientes por auxiliar)
        </div>
    `;

    auxiliaries.forEach(auxiliary => {
        const assignedPatients = assignments[auxiliary] || [];
        html += `
            <div class="assignment-card fade-in">
                <div class="assignment-header">
                    <span class="assignment-auxiliary">👨‍⚕️ ${auxiliary}</span>
                    <span class="assignment-count">${assignedPatients.length}</span>
                </div>
                ${assignedPatients.length > 0 ? `
                    <ul class="assignment-patients">
                        ${assignedPatients.map(patient => `
                            <li class="assignment-patient">🏥 ${patient}</li>
                        `).join('')}
                    </ul>
                ` : `
                    <div class="empty-state" style="padding: 20px;">
                        <div class="empty-state-text">Sin pacientes asignados</div>
                    </div>
                `}
            </div>
        `;
    });

    assignmentsList.innerHTML = html;
}
