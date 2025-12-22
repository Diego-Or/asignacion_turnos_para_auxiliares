/* ========================================
   app.js - Lógica de la Aplicación
   ======================================== */

// ===== ESTADO DE LA APLICACIÓN =====
let patients = []; // Array de objetos: {name, bedNumber, category}
let auxiliaries = [];
let assignments = {};
let editingPatient = null;
let editingAuxiliary = null;

// ===== ELEMENTOS DEL DOM =====
const patientForm = document.getElementById('patientForm');
const patientNameInput = document.getElementById('patientName');
const bedNumberInput = document.getElementById('bedNumber');
const patientCategoryInput = document.getElementById('patientCategory');
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

// ===== CONSTANTES =====
const CATEGORY_WEIGHTS = {
    'Intensivo': 3,
    'Intermedio': 1,
    'Hospitalización': 1
};

const MAX_PATIENTS_PER_AUXILIARY = 4;

// ===== INICIALIZACIÓN =====
function init() {
    loadFromStorage();
    renderPatients();
    renderAuxiliaries();
    updateAssignButton();
}

// ===== ALMACENAMIENTO LOCAL =====
function saveToStorage() {
    const data = {
        patients,
        auxiliaries
    };
    localStorage.setItem('hospitalAssignments', JSON.stringify(data));
}

function loadFromStorage() {
    const stored = localStorage.getItem('hospitalAssignments');
    if (stored) {
        const data = JSON.parse(stored);
        patients = data.patients || [];
        auxiliaries = data.auxiliaries || [];
        assignments = {};
    }
}

// ===== GESTIÓN DE PACIENTES =====
patientForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = patientNameInput.value.trim();
    const bedNumber = parseInt(bedNumberInput.value);
    const category = patientCategoryInput.value;

    if (!name || !bedNumber) {
        alert('⚠️ Por favor complete todos los campos');
        return;
    }

    if (editingPatient !== null) {
        // Modo edición
        const oldPatient = patients[editingPatient];
        if (isDuplicateBed(bedNumber) && bedNumber !== oldPatient.bedNumber) {
            alert('⚠️ Ya existe un paciente en la cama ' + bedNumber);
            return;
        }
        patients[editingPatient] = { name, bedNumber, category };
        editingPatient = null;
        patientForm.querySelector('button[type="submit"]').textContent = '➕ Agregar Paciente';
    } else {
        // Modo agregar
        if (isDuplicateBed(bedNumber)) {
            alert('⚠️ Ya existe un paciente en la cama ' + bedNumber);
            return;
        }
        patients.push({ name, bedNumber, category });
    }

    patientNameInput.value = '';
    bedNumberInput.value = '';
    patientCategoryInput.value = 'Hospitalización';
    saveToStorage();
    renderPatients();
    updateAssignButton();
    clearAssignments();
});

function isDuplicateBed(bedNumber) {
    return patients.some(p => p.bedNumber === bedNumber);
}

function editPatient(index) {
    editingPatient = index;
    const patient = patients[index];
    patientNameInput.value = patient.name;
    bedNumberInput.value = patient.bedNumber;
    patientCategoryInput.value = patient.category;
    patientNameInput.focus();
    patientForm.querySelector('button[type="submit"]').textContent = '✏️ Actualizar Paciente';
}

function deletePatient(index) {
    const patient = patients[index];
    if (confirm(`¿Está seguro de eliminar al paciente "${patient.name}" (Cama ${patient.bedNumber})?`)) {
        patients.splice(index, 1);
        saveToStorage();
        renderPatients();
        updateAssignButton();
        clearAssignments();
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

    // Ordenar pacientes por número de cama
    const sortedPatients = [...patients].sort((a, b) => a.bedNumber - b.bedNumber);

    patientList.innerHTML = sortedPatients.map((patient) => {
        const index = patients.indexOf(patient);
        const categoryClass = patient.category.toLowerCase().replace('ó', 'o').replace('í', 'i');
        return `
            <li class="list-item fade-in">
                <div class="list-item-content">
                    <span class="list-item-name">${patient.name}</span>
                    <div class="list-item-details">
                        <span class="bed-number">🛏️ Cama ${patient.bedNumber}</span>
                        <span class="category-badge category-${categoryClass}">${patient.category}</span>
                    </div>
                </div>
                <div class="list-item-actions">
                    <button class="btn btn-edit" onclick="editPatient(${index})">✏️</button>
                    <button class="btn btn-danger" onclick="deletePatient(${index})">🗑️</button>
                </div>
            </li>
        `;
    }).join('');
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
        const oldName = auxiliaries[editingAuxiliary];
        if (isDuplicateAuxiliary(name) && name !== oldName) {
            alert('⚠️ Este auxiliar ya existe en la lista');
            return;
        }
        auxiliaries[editingAuxiliary] = name;
        editingAuxiliary = null;
        auxiliaryForm.querySelector('button[type="submit"]').textContent = '➕ Agregar Auxiliar';
    } else {
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
    clearAssignments();
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
        clearAssignments();
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
    // Ordenar pacientes por número de cama (cercanía)
    const sortedPatients = [...patients].sort((a, b) => a.bedNumber - b.bedNumber);
    
    // Inicializar asignaciones
    assignments = {};
    const auxiliaryLoads = {}; // Tracking de carga equivalente de cada auxiliar
    auxiliaries.forEach(aux => {
        assignments[aux] = [];
        auxiliaryLoads[aux] = 0;
    });

    // Asignar pacientes de forma secuencial y cercana
    let currentAuxIndex = 0;
    
    for (const patient of sortedPatients) {
        const patientWeight = CATEGORY_WEIGHTS[patient.category];
        let assigned = false;
        
        // Intentar asignar al auxiliar actual primero (mantener cercanía)
        const currentAux = auxiliaries[currentAuxIndex];
        
        if (auxiliaryLoads[currentAux] + patientWeight <= MAX_PATIENTS_PER_AUXILIARY) {
            // El auxiliar actual puede tomar este paciente
            assignments[currentAux].push(patient);
            auxiliaryLoads[currentAux] += patientWeight;
            assigned = true;
        } else {
            // El auxiliar actual está lleno, buscar el siguiente disponible
            let attempts = 0;
            let nextAuxIndex = (currentAuxIndex + 1) % auxiliaries.length;
            
            while (!assigned && attempts < auxiliaries.length) {
                const nextAux = auxiliaries[nextAuxIndex];
                
                if (auxiliaryLoads[nextAux] + patientWeight <= MAX_PATIENTS_PER_AUXILIARY) {
                    assignments[nextAux].push(patient);
                    auxiliaryLoads[nextAux] += patientWeight;
                    currentAuxIndex = nextAuxIndex; // Cambiar al nuevo auxiliar
                    assigned = true;
                } else {
                    nextAuxIndex = (nextAuxIndex + 1) % auxiliaries.length;
                    attempts++;
                }
            }
            
            // Si ningún auxiliar tiene capacidad exacta, asignar al que tenga menos carga
            if (!assigned) {
                const leastLoadedAux = Object.keys(auxiliaryLoads).reduce((a, b) => 
                    auxiliaryLoads[a] < auxiliaryLoads[b] ? a : b
                );
                assignments[leastLoadedAux].push(patient);
                auxiliaryLoads[leastLoadedAux] += patientWeight;
            }
        }
    }

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

    let html = `
        <div class="alert alert-info mb-2">
            ✅ Se han asignado <strong>${totalPatients} pacientes</strong> entre 
            <strong>${totalAuxiliaries} auxiliares</strong> considerando proximidad y carga de trabajo
        </div>
    `;

    auxiliaries.forEach(auxiliary => {
        const assignedPatients = assignments[auxiliary] || [];
        
        // Calcular carga equivalente
        let equivalentLoad = 0;
        assignedPatients.forEach(patient => {
            equivalentLoad += CATEGORY_WEIGHTS[patient.category];
        });

        html += `
            <div class="assignment-card fade-in">
                <div class="assignment-header">
                    <span class="assignment-auxiliary">👨‍⚕️ ${auxiliary}</span>
                    <span class="assignment-count">${assignedPatients.length} pacientes (${equivalentLoad}/${MAX_PATIENTS_PER_AUXILIARY})</span>
                </div>
                ${assignedPatients.length > 0 ? `
                    <ul class="assignment-patients">
                        ${assignedPatients.map(patient => {
                            const categoryClass = patient.category.toLowerCase().replace('ó', 'o').replace('í', 'i');
                            return `
                                <li class="assignment-patient">
                                    <div class="assignment-patient-info">
                                        <div class="assignment-patient-name">🏥 ${patient.name}</div>
                                        <div class="assignment-patient-details">
                                            <span class="bed-number">🛏️ Cama ${patient.bedNumber}</span>
                                            <span class="category-badge category-${categoryClass}">${patient.category}</span>
                                        </div>
                                    </div>
                                </li>
                            `;
                        }).join('')}
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

// ===== UTILIDADES =====
function clearAssignments() {
    if (Object.keys(assignments).length > 0) {
        assignmentsSection.classList.add('hidden');
        assignments = {};
    }
}

// ===== INICIAR APLICACIÓN =====
init();