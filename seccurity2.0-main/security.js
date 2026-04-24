// Security System - PCB School
// Admin mode and functionality

// Admin state
let isAdmin = false;
// Admin password - change this value to modify the password
const ADMIN_PASSWORD = 'admin123';

// Central translation dictionary
const TRANSLATIONS = {
  es: {
    'Contraseña incorrecta': 'Contraseña incorrecta',
    'No hay registros': 'No hay registros',
    'No hay problemas reportados': 'No hay problemas reportados',
    'Eliminar': 'Eliminar',
    'Resolver': 'Resolver',
    '¿Estás seguro de eliminar este registro?': '¿Estás seguro de eliminar este registro?',
    '¿Estás seguro de eliminar este reporte?': '¿Estás seguro de eliminar este reporte?',
    '¿Estás seguro de eliminar TODOS los registros? Esta acción no se puede deshacer.': '¿Estás seguro de eliminar TODOS los registros? Esta acción no se puede deshacer.',
    '¿Estás seguro de eliminar TODOS los problemas reportados? Esta acción no se puede deshacer.': '¿Estás seguro de eliminar TODOS los problemas reportados? Esta acción no se puede deshacer.',
    'No hay registros para exportar': 'No hay registros para exportar',
    'No hay problemas para exportar': 'No hay problemas para exportar',
    'Registro completado exitosamente': 'Registro completado exitosamente',
    'Reporte enviado exitosamente': 'Reporte enviado exitosamente',
    'Por favor ingresa tu nombre': 'Por favor ingresa tu nombre',
    'Pendiente': 'Pendiente',
    'Resuelto': 'Resuelto',
    'Anónimo': 'Anónimo',
    'Foto': 'Foto',
    'Formulario seguro para controlar accesos e incidencias': 'Formulario seguro para controlar accesos e incidencias',
    'Sesión activa como administrador': 'Sesión activa como administrador'
  },
  en: {
    'Contraseña incorrecta': 'Incorrect password',
    'No hay registros': 'No records',
    'No hay problemas reportados': 'No problems reported',
    'Eliminar': 'Delete',
    'Resolver': 'Solve',
    '¿Estás seguro de eliminar este registro?': 'Are you sure you want to delete this record?',
    '¿Estás seguro de eliminar este reporte?': 'Are you sure you want to delete this report?',
    '¿Estás seguro de eliminar TODOS los registros? Esta acción no se puede deshacer.': 'Are you sure you want to delete ALL records? This action cannot be undone.',
    '¿Estás seguro de eliminar TODOS los problemas reportados? Esta acción no se puede deshacer.': 'Are you sure you want to delete ALL reported problems? This action cannot be undone.',
    'No hay registros para exportar': 'No records to export',
    'No hay problemas para exportar': 'No problems to export',
    'Registro completado exitosamente': 'Registration completed successfully',
    'Reporte enviado exitosamente': 'Report sent successfully',
    'Por favor ingresa tu nombre': 'Please enter your name',
    'Pendiente': 'Pending',
    'Resuelto': 'Solved',
    'Anónimo': 'Anonymous',
    'Foto': 'Photo',
    'Formulario seguro para controlar accesos e incidencias': 'Safe form to control access and incidents',
    'Sesión activa como administrador': 'Active session as administrator'
  }
};

// Get current language
function getCurrentLang() {
  return localStorage.getItem('language') || 'es';
}

// Get translated text
function t(key) {
  const lang = getCurrentLang();
  return TRANSLATIONS[lang][key] || key;
}

// Temporary storage for the photo data URL while filling the form
let currentPhoto = null;

// Data storage keys
const ENTRIES_KEY = 'security_entries';
const PROBLEMS_KEY = 'security_problems';

// Load entries from localStorage
function loadEntries() {
  const data = localStorage.getItem(ENTRIES_KEY);
  return data ? JSON.parse(data) : [];
}

// Save entries to localStorage
function saveEntries(entries) {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

// Load problems from localStorage
function loadProblems() {
  const data = localStorage.getItem(PROBLEMS_KEY);
  return data ? JSON.parse(data) : [];
}

// Save problems to localStorage
function saveProblems(problems) {
  localStorage.setItem(PROBLEMS_KEY, JSON.stringify(problems));
}

// Toggle admin mode
function toggleAdminMode() {
  const adminPanel = document.getElementById('adminPanel');

  if (isAdmin) {
    // Close admin panel
    if (adminPanel) {
      adminPanel.classList.add('hidden');
    }
    isAdmin = false;
    // Show register tab
    showTab('register');
  } else {
    // Show admin login tab
    showTab('admin');
  }
}

// Admin login
function adminLogin() {
  const passwordInput = document.getElementById('adminPassword');
  const password = passwordInput ? passwordInput.value : '';
  
  if (password === ADMIN_PASSWORD) {
    isAdmin = true;
    
    // Show success message
    const loginForm = document.getElementById('loginForm');
    const adminWelcome = document.getElementById('adminWelcome');
    
    if (loginForm) loginForm.classList.add('hidden');
    if (adminWelcome) adminWelcome.classList.remove('hidden');
    
    // Show admin panel
    setTimeout(() => {
      const adminPanel = document.getElementById('adminPanel');
      if (adminPanel) {
        adminPanel.classList.remove('hidden');
      }
      showAdminSection('entries');
      updateStats();
    }, 500);
  } else {
    alert(t('Contraseña incorrecta'));
    if (passwordInput) passwordInput.value = '';
  }
}

// Show admin section
function showAdminSection(section) {
  const entriesSection = document.getElementById('entriesSection');
  const problemsSection = document.getElementById('problemsSection');
  
  if (section === 'entries') {
    if (entriesSection) entriesSection.classList.remove('hidden');
    if (problemsSection) problemsSection.classList.add('hidden');
    renderEntries();
  } else if (section === 'problems') {
    if (entriesSection) entriesSection.classList.add('hidden');
    if (problemsSection) problemsSection.classList.remove('hidden');
    renderProblems();
  }
}

// Helper function to parse Spanish date format
function parseSpanishDate(dateStr) {
  if (!dateStr) return new Date(0);
  // Format: DD/MM/YYYY, HH:MM:SS or similar Spanish format
  const parts = dateStr.split(/[/, :]/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const hour = parts[3] ? parseInt(parts[3], 10) : 0;
    const minute = parts[4] ? parseInt(parts[4], 10) : 0;
    const second = parts[5] ? parseInt(parts[5], 10) : 0;
    return new Date(year, month, day, hour, minute, second);
  }
  return new Date(dateStr);
}

// Render entries table
function renderEntries() {
  const tbody = document.getElementById('entriesBody');
  if (!tbody) return;
  
  let entries = loadEntries();
  
  // Sort by date (newest first)
  entries.sort((a, b) => parseSpanishDate(b.time) - parseSpanishDate(a.time));
  
  if (entries.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--security-text-soft);">' + t('No hay registros') + '</td></tr>';
    return;
  }
  
  tbody.innerHTML = entries.map((entry, index) => `
    <tr>
      <td>${entry.name}</td>
      <td>${entry.type}</td>
      <td>${entry.action}</td>
      <td>${entry.time}</td>
      <td>
        <button class="action-btn view" onclick="viewEntry(${index})">
          <i class="fas fa-eye"></i> ${t('Ver')}
        </button>
        <button class="action-btn delete" onclick="deleteEntry(${index})">
          <i class="fas fa-trash"></i> ${t('Eliminar')}
        </button>
      </td>
    </tr>
  `).join('');
}

// Render problems table
function renderProblems() {
  const tbody = document.getElementById('problemsBody');
  if (!tbody) return;
  
  let problems = loadProblems();
  
  // Sort by date (newest first)
  problems.sort((a, b) => parseSpanishDate(b.date) - parseSpanishDate(a.date));
  
  if (problems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--security-text-soft);">' + t('No hay problemas reportados') + '</td></tr>';
    return;
  }
  
  tbody.innerHTML = problems.map((problem, index) => `
    <tr>
      <td onclick="event.stopPropagation();">
        <button class="action-btn view" onclick="viewProblem(${index})"><i class="fas fa-eye"></i></button>
      </td>
      <td onclick="viewProblem(${index})" style="cursor:pointer;">${problem.type}</td>
      <td onclick="viewProblem(${index})" style="cursor:pointer;">${problem.location}</td>
      <td onclick="viewProblem(${index})" style="cursor:pointer;">${problem.description}</td>
      <td onclick="viewProblem(${index})" style="cursor:pointer;">${problem.reporter || t('Anónimo')}</td>
      <td onclick="viewProblem(${index})" style="cursor:pointer;">${problem.date}</td>
      <td onclick="viewProblem(${index})" style="cursor:pointer;">
        <span class="status-badge ${problem.resolved ? 'solved' : 'pending'}">
          ${problem.resolved ? '<i class="fas fa-check"></i> ' + t('Resuelto') : '<i class="fas fa-clock"></i> ' + t('Pendiente')}
        </span>
      </td>
      <td onclick="event.stopPropagation();">
        ${problem.photo ? `<img src="${problem.photo}" class="problem-thumb" onclick="openPhoto(${index})" alt="${t('Foto')}">` : `<button class="action-btn view" onclick="viewProblem(${index})"><i class="fas fa-eye"></i></button>`}
      </td>
      <td onclick="event.stopPropagation();">
        ${!problem.resolved ? `<button class="action-btn solve" onclick="resolveProblem(${index})"><i class="fas fa-check"></i> ${t('Resolver')}</button>` : ''}
        <button class="action-btn delete" onclick="deleteProblem(${index})"><i class="fas fa-trash"></i> ${t('Eliminar')}</button>
      </td>
    </tr>
  `).join('');
}

// Delete entry
function deleteEntry(index) {
  if (!confirm(t('¿Estás seguro de eliminar este registro?'))) return;
  
  const entries = loadEntries();
  entries.splice(index, 1);
  saveEntries(entries);
  renderEntries();
  updateStats();
}

// Delete problem
function deleteProblem(index) {
  if (!confirm(t('¿Estás seguro de eliminar este reporte?'))) return;
  
  const problems = loadProblems();
  problems.splice(index, 1);
  saveProblems(problems);
  renderProblems();
  updateStats();
}

// Resolve problem
function resolveProblem(index) {
  const problems = loadProblems();
  problems[index].resolved = true;
  saveProblems(problems);
  renderProblems();
  updateStats();
}

// Clear all entries
function clearEntries() {
  if (!confirm(t('¿Estás seguro de eliminar TODOS los registros? Esta acción no se puede deshacer.'))) return;
  
  localStorage.removeItem(ENTRIES_KEY);
  renderEntries();
  updateStats();
}

// Clear all problems
function clearAllProblems() {
  if (!confirm(t('¿Estás seguro de eliminar TODOS los problemas reportados? Esta acción no se puede deshacer.'))) return;
  
  localStorage.removeItem(PROBLEMS_KEY);
  renderProblems();
  updateStats();
}

// Export entries to CSV
function exportEntries() {
  const entries = loadEntries();
  if (entries.length === 0) {
    alert(t('No hay registros para exportar'));
    return;
  }
  
  let csv = 'Nombre,Tipo,Acción,Hora\n';
  entries.forEach(entry => {
    csv += `"${entry.name}","${entry.type}","${entry.action}","${entry.time}"\n`;
  });
  
  downloadCSV(csv, 'registros_seguridad.csv');
}

// Export problems to CSV
function exportProblems() {
  const problems = loadProblems();
  if (problems.length === 0) {
    alert(t('No hay problemas para exportar'));
    return;
  }
  
  let csv = 'Tipo,Lugar,Descripción,Reportero,Fecha,Estado\n';
  problems.forEach(problem => {
    csv += `"${problem.type}","${problem.location}","${problem.description}","${problem.reporter || t('Anónimo')}","${problem.date}","${problem.resolved ? t('Resuelto') : t('Pendiente')}"\n`;
  });
  
  downloadCSV(csv, 'problemas_seguridad.csv');
}

// Download CSV file
function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// Guest registration
function guestRegister(event) {
  event.preventDefault();
  
  const name = document.getElementById('guestName').value;
  const type = document.getElementById('guestType').value;
  const action = document.getElementById('guestAction').value;
  
  const entry = {
    name: name,
    type: type,
    action: action,
    time: new Date().toLocaleString('es-ES')
  };
  
  const entries = loadEntries();
  entries.push(entry);
  saveEntries(entries);
  
  // Show success message
  const messageDiv = document.getElementById('registerMessage');
  if (messageDiv) {
    messageDiv.innerHTML = '<div class="success-message"><i class="fas fa-check-circle"></i> ' + t('Registro completado exitosamente') + '</div>';
    setTimeout(() => {
      messageDiv.innerHTML = '';
    }, 3000);
  }
  
  // Reset form
  document.getElementById('guestForm').reset();
  updateStats();
}

// Report problem
function reportProblem(event) {
  event.preventDefault();
  
  const type = document.getElementById('problemType').value;
  const location = document.getElementById('problemLocation').value;
  const description = document.getElementById('problemDesc').value;
  const reporter = document.getElementById('problemReporter').value;
  // ensure reporter is provided
  if (!reporter || reporter.trim() === '') {
    alert(t('Por favor ingresa tu nombre'));
    return;
  }
  
  const problem = {
    type: type,
    location: location,
    description: description,
    reporter: reporter,
    date: new Date().toLocaleString('es-ES'),
    resolved: false,
    photo: currentPhoto // may be null if no photo selected
  };
  
  const problems = loadProblems();
  problems.push(problem);
  saveProblems(problems);
  
  // Show success message
  const messageDiv = document.getElementById('problemMessage');
  if (messageDiv) {
    messageDiv.innerHTML = '<div class="success-message"><i class="fas fa-check-circle"></i> ' + t('Reporte enviado exitosamente') + '</div>';
    setTimeout(() => {
      messageDiv.innerHTML = '';
    }, 3000);
  }
  
  // Reset form
  document.getElementById('problemForm').reset();
  document.getElementById('photoPreview').innerHTML = '';
  currentPhoto = null;
  updateStats();
}

// Preview photo
function previewPhoto() {
  const input = document.getElementById('problemPhoto');
  const preview = document.getElementById('photoPreview');
  
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      currentPhoto = e.target.result; // save data URL for later submission
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    }
    reader.readAsDataURL(input.files[0]);
  }
}

// Function to open a problem photo in a new window
function openPhoto(index) {
  const problems = loadProblems();
  const p = problems[index];
  if (p && p.photo) {
    window.open(p.photo, '_blank');
  }
}

// Show tab
function showTab(tabName) {
  // Hide all tabs
  document.getElementById('register-tab').classList.add('hidden');
  document.getElementById('problem-tab').classList.add('hidden');
  document.getElementById('admin-tab').classList.add('hidden');
  
  // Show selected tab
  document.getElementById(tabName + '-tab').classList.remove('hidden');
  
  // Update tab buttons
  document.querySelectorAll('.security-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.getAttribute('data-tab') === tabName) {
      tab.classList.add('active');
    }
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  updateStats();
});
