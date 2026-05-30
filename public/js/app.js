const API_BASE = '/api';

const pageLabels = {
  dashboard:      'Dashboard',
  pacientes:      'Pacientes',
  agenda:         'Agenda',
  telemedicina:   'Telemedicina',
  leitos:         'Leitos / Internações',
  profissionais:  'Profissionais de Saúde',
  relatorios:     'Relatórios',
  seguranca:      'Segurança e Compliance',
  configuracoes:  'Configurações'
};

// Global variables for pagination & editing
let allPacientes = [];
let editingPacienteId = null;

document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
  setupKeyboardNav();
  setupFormListeners();
});

// Toast notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.className = 'toast show';
  if (type === 'danger') toast.style.background = 'var(--red-600)';
  else if (type === 'warn') toast.style.background = 'var(--amber-600)';
  else toast.style.background = 'var(--teal-600)';
  
  toast.innerHTML = `<i class="ti ti-${type === 'success' ? 'check' : 'alert-circle'}" aria-hidden="true"></i> <span>${message}</span>`;
  setTimeout(() => {
    toast.className = 'toast';
  }, 3500);
}

// Navigation Tab Management
window.nav = function(id, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.remove('active');
    n.removeAttribute('aria-current');
  });
  
  const targetPage = document.getElementById('page-' + id);
  if (targetPage) targetPage.classList.add('active');
  
  if (el) {
    el.classList.add('active');
    el.setAttribute('aria-current', 'page');
  }
  
  document.getElementById('page-title').textContent = pageLabels[id] || id;

  // Lazy load tab contents
  if (id === 'dashboard') initDashboard();
  else if (id === 'pacientes') loadPacientes();
  else if (id === 'agenda') loadAgenda();
  else if (id === 'telemedicina') loadTelemedicina();
  else if (id === 'leitos') loadLeitos();
  else if (id === 'profissionais') loadProfissionais();
  else if (id === 'relatorios') loadRelatorios();
  else if (id === 'seguranca') loadSegurancaLogs();
  else if (id === 'configuracoes') loadConfiguracoes();
};

function setupKeyboardNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });
}

// ── DASHBOARD MODULE ─────────────────────────────────
async function initDashboard() {
  try {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    const stats = await res.json();
    
    // Update main cards
    document.querySelector('#page-dashboard .stats-row .stat-card:nth-child(1) .stat-value').textContent = stats.pacientesHoje;
    document.querySelector('#page-dashboard .stats-row .stat-card:nth-child(2) .stat-value').innerHTML = `${stats.leitosOcupados} <span style="font-size:14px;font-weight:400;color:var(--muted)">/ ${stats.leitosTotal}</span>`;
    
    const occupancyRate = Math.round((stats.leitosOcupados / stats.leitosTotal) * 100);
    document.querySelector('#page-dashboard .stats-row .stat-card:nth-child(2) .stat-sub').textContent = `${occupancyRate}% de ocupação`;
    
    document.querySelector('#page-dashboard .stats-row .stat-card:nth-child(3) .stat-value').textContent = stats.teleconsultas;
    document.querySelector('#page-dashboard .stats-row .stat-card:nth-child(4) .stat-value').textContent = stats.alertasAtivos;

    // Load recent today's schedule for dashboard view
    const schedRes = await fetch(`${API_BASE}/agenda`);
    const agendaList = await schedRes.json();
    const dashboardSchedContainer = document.querySelector('#page-dashboard .grid-2 .card:nth-child(1)');
    
    // Clean old schedule list, keeping header
    const header = dashboardSchedContainer.querySelector('.card-header');
    dashboardSchedContainer.innerHTML = '';
    dashboardSchedContainer.appendChild(header);
    
    agendaList.slice(0, 5).forEach(item => {
      const row = document.createElement('div');
      row.className = 'sched-item';
      
      let badgeClass = 'badge-gray';
      if (item.status === 'Confirmado') badgeClass = 'badge-green';
      else if (item.status === 'Em espera') badgeClass = 'badge-blue';
      else if (item.status === 'Online') badgeClass = 'badge-amber';
      else if (item.status === 'Aguardando') badgeClass = 'badge-amber';
      else if (item.status === 'Urgente') badgeClass = 'badge-red';

      row.innerHTML = `
        <div class="sched-time">${item.hora}</div>
        <div class="sched-dot" style="background:var(--teal-400)"></div>
        <div class="sched-info">
          <div class="sched-name">${item.nome}</div>
          <div class="sched-spec">${item.especialidade} · ${item.profissional}</div>
        </div>
        <span class="badge ${badgeClass}">${item.status}</span>
      `;
      dashboardSchedContainer.appendChild(row);
    });

  } catch (err) {
    console.error("Error loading dashboard data:", err);
  }
}

// ── PACIENTES MODULE ─────────────────────────────────
async function loadPacientes() {
  const searchQuery = document.getElementById('search-pac').value;
  const specialtyFilter = document.getElementById('filter-esp').value;
  
  let url = `${API_BASE}/pacientes?`;
  if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
  if (specialtyFilter && specialtyFilter !== 'Todas') url += `especialidade=${encodeURIComponent(specialtyFilter)}&`;

  try {
    const res = await fetch(url);
    allPacientes = await res.json();
    
    // Update total count metadata
    document.querySelector('#page-pacientes .section-meta').innerHTML = `Total: <strong>${allPacientes.length}</strong> pacientes cadastrados`;
    document.querySelector('#page-pacientes .pagination span').textContent = `Mostrando ${allPacientes.length} de ${allPacientes.length} registros`;

    const tbody = document.querySelector('#page-pacientes table tbody');
    tbody.innerHTML = '';
    
    allPacientes.forEach(p => {
      const tr = document.createElement('tr');
      
      let badgeClass = 'badge-green';
      if (p.status === 'Internado') badgeClass = 'badge-amber';
      else if (p.status === 'Triagem') badgeClass = 'badge-red';
      else if (p.status === 'Inativo') badgeClass = 'badge-gray';

      const initials = p.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

      tr.innerHTML = `
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="pat-av">${initials}</div>
            <div>
              <div style="font-size:12px;font-weight:500">${p.nome}</div>
              <div style="font-size:11px;color:var(--muted)">${p.idade} anos · ${p.sexo}</div>
            </div>
          </div>
        </td>
        <td class="mono">${p.cpf}</td>
        <td class="mono">#${p.prontuario}</td>
        <td>${p.ultimaConsulta}</td>
        <td><span class="badge badge-teal">${p.especialidade}</span></td>
        <td><span class="badge ${badgeClass}">${p.status}</span></td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn btn-outline btn-sm" onclick="editPaciente(${p.id})" aria-label="Editar"><i class="ti ti-edit" aria-hidden="true"></i></button>
            <button class="btn btn-outline btn-sm" onclick="deletePaciente(${p.id})" aria-label="Remover"><i class="ti ti-trash" aria-hidden="true"></i></button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Error loading patients list:", err);
  }
}

// Search and Filter Listeners
document.getElementById('search-pac').addEventListener('input', loadPacientes);
document.getElementById('filter-esp').addEventListener('change', loadPacientes);

window.openNewPacienteModal = function() {
  editingPacienteId = null;
  document.getElementById('modal-paciente-title').textContent = "Cadastrar Novo Paciente";
  document.getElementById('form-paciente').reset();
  openModal('modal-paciente');
};

window.editPaciente = function(id) {
  const p = allPacientes.find(item => item.id === id);
  if (!p) return;
  
  editingPacienteId = id;
  document.getElementById('modal-paciente-title').textContent = "Editar Paciente";
  
  document.getElementById('pac-nome').value = p.nome;
  document.getElementById('pac-idade').value = p.idade;
  document.getElementById('pac-sexo').value = p.sexo;
  document.getElementById('pac-cpf').value = p.cpf;
  document.getElementById('pac-esp').value = p.especialidade;
  document.getElementById('pac-status').value = p.status;
  
  openModal('modal-paciente');
};

async function handlePacienteSubmit(e) {
  e.preventDefault();
  const data = {
    nome: document.getElementById('pac-nome').value,
    idade: document.getElementById('pac-idade').value,
    sexo: document.getElementById('pac-sexo').value,
    cpf: document.getElementById('pac-cpf').value,
    especialidade: document.getElementById('pac-esp').value,
    status: document.getElementById('pac-status').value
  };

  try {
    let res;
    if (editingPacienteId) {
      res = await fetch(`${API_BASE}/pacientes/${editingPacienteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      showToast("Cadastro de paciente atualizado com sucesso!");
    } else {
      res = await fetch(`${API_BASE}/pacientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      showToast("Paciente cadastrado com sucesso!");
    }

    if (res.ok) {
      closeModal('modal-paciente');
      loadPacientes();
    }
  } catch (err) {
    console.error("Error saving patient:", err);
    showToast("Erro ao salvar paciente", "danger");
  }
}

window.deletePaciente = async function(id) {
  if (!confirm("Tem certeza que deseja excluir este paciente?")) return;
  try {
    const res = await fetch(`${API_BASE}/pacientes/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast("Paciente removido com sucesso!");
      loadPacientes();
    }
  } catch (err) {
    console.error("Error deleting patient:", err);
    showToast("Erro ao remover paciente", "danger");
  }
};


// ── AGENDA MODULE ────────────────────────────────────
async function loadAgenda() {
  try {
    const res = await fetch(`${API_BASE}/agenda`);
    const list = await res.json();
    
    const card = document.querySelector('#page-agenda .grid-2 .card:nth-child(1)');
    const header = card.querySelector('.card-title');
    card.innerHTML = '';
    card.appendChild(header);

    list.forEach(item => {
      const row = document.createElement('div');
      row.className = 'sched-item';
      
      let badgeClass = 'badge-gray';
      if (item.status === 'Confirmado') badgeClass = 'badge-green';
      else if (item.status === 'Em espera') badgeClass = 'badge-blue';
      else if (item.status === 'Online') badgeClass = 'badge-amber';
      else if (item.status === 'Agendado') badgeClass = 'badge-gray';

      row.innerHTML = `
        <div class="sched-time">${item.hora}</div>
        <div class="sched-dot" style="background:var(--teal-400)"></div>
        <div class="sched-info">
          <div class="sched-name">${item.nome}</div>
          <div class="sched-spec">${item.especialidade} · ${item.profissional}</div>
        </div>
        <span class="badge ${badgeClass}">${item.status}</span>
      `;
      card.appendChild(row);
    });

    // Populate day summary totals dynamically
    const confirmados = list.filter(item => item.status === 'Confirmado').length;
    const teleconsultas = list.filter(item => item.especialidade.toLowerCase().includes('tele') || item.status === 'Online').length;
    
    document.querySelector('#page-agenda .summary-grid .summary-item:nth-child(1) .summary-num').textContent = list.length;
    document.querySelector('#page-agenda .summary-grid .summary-item:nth-child(2) .summary-num').textContent = confirmados;
    document.querySelector('#page-agenda .summary-grid .summary-item:nth-child(3) .summary-num').textContent = teleconsultas;

  } catch (err) {
    console.error("Error loading agenda:", err);
  }
}

window.openNewAgendaModal = function() {
  document.getElementById('form-agenda').reset();
  openModal('modal-agenda');
};

async function handleAgendaSubmit(e) {
  e.preventDefault();
  const data = {
    nome: document.getElementById('ag-nome').value,
    hora: document.getElementById('ag-hora').value,
    especialidade: document.getElementById('ag-esp').value,
    profissional: document.getElementById('ag-prof').value,
    status: document.getElementById('ag-status').value
  };

  try {
    const res = await fetch(`${API_BASE}/agenda`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      showToast("Agendamento realizado com sucesso!");
      closeModal('modal-agenda');
      loadAgenda();
    }
  } catch (err) {
    console.error("Error scheduling appointment:", err);
    showToast("Erro ao realizar agendamento", "danger");
  }
}


// ── TELEMEDICINA MODULE ──────────────────────────────
async function loadTelemedicina() {
  try {
    // Load waiting room
    const resEspera = await fetch(`${API_BASE}/telemedicina/espera`);
    const espera = await resEspera.json();
    
    const esperaContainer = document.querySelector('#page-telemedicina .grid-2 .card:nth-child(1)');
    const esperaHeader = esperaContainer.querySelector('.card-header');
    esperaContainer.innerHTML = '';
    esperaContainer.appendChild(esperaHeader);
    esperaHeader.querySelector('.badge').textContent = `${espera.length} aguardando`;

    espera.forEach(item => {
      const card = document.createElement('div');
      card.className = 'tele-card';
      card.innerHTML = `
        <div class="tele-icon" style="background:var(--purple-50);color:var(--purple-800)"><i class="ti ti-user" aria-hidden="true"></i></div>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:500">${item.nome}</div>
          <div style="font-size:11px;color:var(--muted)">Aguardando há ${item.tempo} min · ${item.medico}</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="iniciarTeleconsulta(${item.id})"><i class="ti ti-video" aria-hidden="true"></i>Iniciar</button>
      `;
      esperaContainer.appendChild(card);
    });

    // Load active consultations
    const stats = await (await fetch(`${API_BASE}/dashboard/stats`)).json();
    document.querySelector('#page-telemedicina .stats-row .stat-card:nth-child(1) .stat-value').textContent = espera.length;
    
  } catch (err) {
    console.error("Error loading telemedicina data:", err);
  }
}

window.iniciarTeleconsulta = async function(id) {
  try {
    const res = await fetch(`${API_BASE}/telemedicina/iniciar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res.ok) {
      showToast("Videochamada iniciada! Sala de teleconsulta ativa.");
      loadTelemedicina();
    }
  } catch (err) {
    console.error("Error starting teleconsultation:", err);
  }
};

async function handlePrescricaoSubmit(e) {
  e.preventDefault();
  const data = {
    paciente: document.getElementById('tele-pac').value,
    prescricao: document.getElementById('tele-rx').value
  };

  if (!data.paciente || !data.prescricao) {
    showToast("Por favor, preencha o paciente e a prescrição.", "warn");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/telemedicina/prescricao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (res.ok) {
      const prescription = await res.json();
      showToast(`Receita digital emitida! Assinatura: ${prescription.assinaturaDigital}`);
      document.getElementById('tele-pac').value = '';
      document.getElementById('tele-rx').value = '';
    }
  } catch (err) {
    console.error("Error issuing digital prescription:", err);
    showToast("Erro ao emitir prescrição", "danger");
  }
}


// ── LEITOS MODULE ────────────────────────────────────
let selectedBedId = null;
let selectedBedAla = null;

async function loadLeitos() {
  try {
    const res = await fetch(`${API_BASE}/leitos`);
    const leitos = await res.json();
    
    // Ala A grid rendering
    const alaAGrid = document.querySelector('#page-leitos .card:nth-child(2) .bed-grid');
    alaAGrid.innerHTML = '';
    
    leitos.alaA.forEach(bed => {
      const div = document.createElement('div');
      div.className = `bed ${bed.status}`;
      div.setAttribute('role', 'listitem');
      div.setAttribute('title', `${bed.id} — ${bed.paciente}`);
      div.onclick = () => openLeitoModal(bed.id, 'alaA', bed.status, bed.paciente);
      
      let label = 'Livre';
      if (bed.status === 'occupied') label = bed.paciente;
      else if (bed.status === 'cleaning') label = 'Limpeza';
      else if (bed.status === 'reserved') label = 'Reservado';

      div.innerHTML = `<div class="bed-num">${bed.id}</div>${label}`;
      alaAGrid.appendChild(div);
    });

    // UTI grid rendering
    const utiGrid = document.querySelector('#page-leitos .card:nth-child(3) .bed-grid');
    utiGrid.innerHTML = '';
    
    leitos.uti.forEach(bed => {
      const div = document.createElement('div');
      div.className = `bed ${bed.status}`;
      if (bed.id === 'U14A') div.style.borderColor = '#F09595';
      div.setAttribute('role', 'listitem');
      div.setAttribute('title', `${bed.id} — ${bed.paciente}`);
      div.onclick = () => openLeitoModal(bed.id, 'uti', bed.status, bed.paciente);
      
      let label = 'Livre';
      if (bed.status === 'occupied') label = bed.paciente;
      else if (bed.status === 'cleaning') label = 'Limpeza';
      else if (bed.status === 'reserved') label = 'Reservado';

      div.innerHTML = `<div class="bed-num">${bed.id}</div>${label}`;
      utiGrid.appendChild(div);
    });

    // Update stats counters
    const totalAlaA = leitos.alaA.length;
    const totalUti = leitos.uti.length;
    const total = totalAlaA + totalUti;
    
    const occupied = leitos.alaA.filter(b => b.status === 'occupied').length + leitos.uti.filter(b => b.status === 'occupied').length;
    const available = leitos.alaA.filter(b => b.status === 'available').length + leitos.uti.filter(b => b.status === 'available').length;
    const others = total - occupied - available;
    
    document.querySelector('#page-leitos .stats-row .stat-card:nth-child(1) .stat-value').textContent = total;
    document.querySelector('#page-leitos .stats-row .stat-card:nth-child(2) .stat-value').textContent = occupied;
    document.querySelector('#page-leitos .stats-row .stat-card:nth-child(3) .stat-value').textContent = available;
    document.querySelector('#page-leitos .stats-row .stat-card:nth-child(4) .stat-value').textContent = others;

  } catch (err) {
    console.error("Error loading beds information:", err);
  }
}

window.openLeitoModal = function(id, ala, currentStatus, currentPaciente) {
  selectedBedId = id;
  selectedBedAla = ala;
  
  document.getElementById('modal-leito-title').textContent = `Gerenciar Leito ${id}`;
  document.getElementById('leito-status').value = currentStatus;
  document.getElementById('leito-paciente').value = currentStatus === 'occupied' ? currentPaciente : '';
  
  openModal('modal-leito');
};

async function handleLeitoSubmit(e) {
  e.preventDefault();
  const data = {
    id: selectedBedId,
    ala: selectedBedAla,
    status: document.getElementById('leito-status').value,
    paciente: document.getElementById('leito-paciente').value || "Livre"
  };

  try {
    const res = await fetch(`${API_BASE}/leitos/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (res.ok) {
      showToast(`Leito ${selectedBedId} atualizado!`);
      closeModal('modal-leito');
      loadLeitos();
    }
  } catch (err) {
    console.error("Error updating bed status:", err);
  }
}


// ── PROFISSIONAIS MODULE ─────────────────────────────
async function loadProfissionais() {
  try {
    const res = await fetch(`${API_BASE}/profissionais`);
    const list = await res.json();
    
    document.querySelector('#page-profissionais .section-meta').innerHTML = `<strong>${list.length}</strong> profissionais cadastrados`;
    
    const tbody = document.querySelector('#page-profissionais table tbody');
    tbody.innerHTML = '';
    
    list.forEach(prof => {
      const tr = document.createElement('tr');
      const initials = prof.nome.replace("Dr. ", "").replace("Dra. ", "").replace("Enf. ", "").split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
      
      let badgeClass = 'badge-green';
      if (prof.status === 'Folga') badgeClass = 'badge-gray';
      else if (prof.status === 'Online') badgeClass = 'badge-blue';

      tr.innerHTML = `
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="pat-av">${initials}</div>
            <div>
              <div style="font-size:12px;font-weight:500">${prof.nome}</div>
              <div style="font-size:11px;color:var(--muted)">${prof.papel}</div>
            </div>
          </div>
        </td>
        <td class="mono" style="font-size:11px">${prof.crm}</td>
        <td><span class="badge badge-teal">${prof.especialidade}</span></td>
        <td>${prof.turno}</td>
        <td>${prof.consultas}</td>
        <td><span class="badge ${badgeClass}">${prof.status}</span></td>
        <td><button class="btn btn-outline btn-sm"><i class="ti ti-calendar" aria-hidden="true"></i>Agenda</button></td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Error loading professionals:", err);
  }
}

window.openNewProfissionalModal = function() {
  document.getElementById('form-prof').reset();
  openModal('modal-profissional');
};

async function handleProfSubmit(e) {
  e.preventDefault();
  const data = {
    nome: document.getElementById('prof-nome').value,
    crm: document.getElementById('prof-crm').value,
    papel: document.getElementById('prof-papel').value,
    especialidade: document.getElementById('prof-esp').value,
    turno: document.getElementById('prof-turno').value
  };

  try {
    const res = await fetch(`${API_BASE}/profissionais`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (res.ok) {
      showToast("Profissional de saúde cadastrado com sucesso!");
      closeModal('modal-profissional');
      loadProfissionais();
    }
  } catch (err) {
    console.error("Error registering professional:", err);
  }
}


// ── RELATÓRIOS MODULE ────────────────────────────────
async function loadRelatorios() {
  try {
    const res = await fetch(`${API_BASE}/relatorios`);
    const list = await res.json();
    
    const tbody = document.querySelector('#page-relatorios table tbody');
    tbody.innerHTML = '';
    
    list.forEach(rep => {
      const tr = document.createElement('tr');
      
      let badgeClass = 'badge-blue';
      if (rep.formato === 'XLSX') badgeClass = 'badge-green';
      else if (rep.formato === 'CSV') badgeClass = 'badge-amber';

      tr.innerHTML = `
        <td>
          <div style="font-size:12px;font-weight:500">${rep.nome}</div>
          <div style="font-size:11px;color:var(--muted)">Consolidado mensal</div>
        </td>
        <td>${rep.periodo}</td>
        <td>${rep.data}</td>
        <td><span class="badge ${badgeClass}">${rep.formato}</span></td>
        <td><button class="btn btn-outline btn-sm" onclick="showToast('Baixando relatório em formato ${rep.formato}...')"><i class="ti ti-download" aria-hidden="true"></i></button></td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Error loading reports list:", err);
  }
}

window.openNewRelatorioModal = function() {
  document.getElementById('form-rep').reset();
  openModal('modal-relatorio');
};

async function handleReportSubmit(e) {
  e.preventDefault();
  const data = {
    nome: document.getElementById('rep-nome').value,
    periodo: document.getElementById('rep-periodo').value,
    formato: document.getElementById('rep-formato').value
  };

  try {
    const res = await fetch(`${API_BASE}/relatorios/gerar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (res.ok) {
      showToast("Novo relatório gerado com sucesso!");
      closeModal('modal-relatorio');
      loadRelatorios();
    }
  } catch (err) {
    console.error("Error generating report:", err);
  }
}


// ── SEGURANÇA MODULE ─────────────────────────────────
async function loadSegurancaLogs() {
  try {
    const res = await fetch(`${API_BASE}/seguranca/logs`);
    const logs = await res.json();
    
    const tbody = document.querySelector('#page-seguranca table tbody');
    tbody.innerHTML = '';
    
    logs.forEach(log => {
      const tr = document.createElement('tr');
      
      let badgeClass = 'badge-teal';
      if (log.acao.includes('Login')) badgeClass = 'badge-blue';
      else if (log.acao.includes('leito') || log.acao.includes('Leito')) badgeClass = 'badge-green';
      else if (log.acao.includes('negado') || log.acao.includes('exclui')) badgeClass = 'badge-red';
      else if (log.acao.includes('Cadastro') || log.acao.includes('Consulta')) badgeClass = 'badge-amber';

      tr.innerHTML = `
        <td class="mono">${log.hora}</td>
        <td>${log.usuario}</td>
        <td><span class="badge ${badgeClass}">${log.acao}</span></td>
        <td class="mono" style="font-size:11px">${log.ip}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Error loading security logs:", err);
  }
}


// ── CONFIGURAÇÕES MODULE ─────────────────────────────
async function loadConfiguracoes() {
  try {
    const res = await fetch(`${API_BASE}/configuracoes`);
    const cfg = await res.json();
    
    document.getElementById('cfg-nome').value = cfg.instituicao;
    document.getElementById('cfg-cnpj').value = cfg.cnpj;
    document.getElementById('cfg-unidade').value = cfg.unidade;
    document.getElementById('cfg-idioma').value = cfg.idioma;
    document.getElementById('cfg-email').value = cfg.email;
    
    document.querySelector('#page-configuracoes .card:nth-child(2) div:nth-child(7)').textContent = cfg.ultimoBackup;

  } catch (err) {
    console.error("Error loading configurations:", err);
  }
}

async function handleConfigSubmit(e) {
  e.preventDefault();
  const data = {
    instituicao: document.getElementById('cfg-nome').value,
    cnpj: document.getElementById('cfg-cnpj').value,
    unidade: document.getElementById('cfg-unidade').value,
    idioma: document.getElementById('cfg-idioma').value,
    email: document.getElementById('cfg-email').value
  };

  try {
    const res = await fetch(`${API_BASE}/configuracoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (res.ok) {
      showToast("Configurações atualizadas com sucesso!");
      
      // Update sidebar details if name is updated
      document.querySelector('.sidebar-logo .logo-text').textContent = data.instituicao.split(' ')[0];
    }
  } catch (err) {
    console.error("Error saving configurations:", err);
  }
}

window.triggerBackup = async function() {
  try {
    const res = await fetch(`${API_BASE}/configuracoes/backup`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      showToast("Backup gerado: SGHSS_Backup_2025.zip");
      loadConfiguracoes();
    }
  } catch (err) {
    console.error("Error generating backup:", err);
    showToast("Erro ao forçar backup", "danger");
  }
};


// ── MODAL HELPERS ────────────────────────────────────
function openModal(id) {
  const modal = document.getElementById(id);
  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('show'), 10);
}

window.closeModal = function(id) {
  const modal = document.getElementById(id);
  modal.classList.remove('show');
  setTimeout(() => modal.style.display = 'none', 200);
};

function setupFormListeners() {
  document.getElementById('form-paciente').addEventListener('submit', handlePacienteSubmit);
  document.getElementById('form-agenda').addEventListener('submit', handleAgendaSubmit);
  document.getElementById('form-tele-rx').addEventListener('submit', handlePrescricaoSubmit);
  document.getElementById('form-leito').addEventListener('submit', handleLeitoSubmit);
  document.getElementById('form-prof').addEventListener('submit', handleProfSubmit);
  document.getElementById('form-rep').addEventListener('submit', handleReportSubmit);
  document.getElementById('form-config').addEventListener('submit', handleConfigSubmit);
}
