const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to read database
function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initialDB = {
      pacientes: [
        { id: 1, nome: "Maria Oliveira", idade: 48, sexo: "F", cpf: "032.xxx.xxx-12", prontuario: "PRN-00421", ultimaConsulta: "30/05/2025", especialidade: "Clínica Geral", status: "Ativo" },
        { id: 2, nome: "João Santos", idade: 63, sexo: "M", cpf: "071.xxx.xxx-44", prontuario: "PRN-00398", ultimaConsulta: "28/05/2025", especialidade: "Cardiologia", status: "Internado" },
        { id: 3, nome: "Ana Ferreira", idade: 35, sexo: "F", cpf: "188.xxx.xxx-77", prontuario: "PRN-00512", ultimaConsulta: "30/05/2025", especialidade: "Ginecologia", status: "Ativo" },
        { id: 4, nome: "Carlos Mendes", idade: 52, sexo: "M", cpf: "044.xxx.xxx-23", prontuario: "PRN-00289", ultimaConsulta: "15/05/2025", especialidade: "Ortopedia", status: "Ativo" },
        { id: 5, nome: "Rita Souza", idade: 29, sexo: "F", cpf: "221.xxx.xxx-05", prontuario: "PRN-00641", ultimaConsulta: "30/05/2025", especialidade: "Urgência", status: "Triagem" }
      ],
      profissionais: [
        { id: 1, nome: "Dr. Roberto Costa", crm: "CRM-SC 12345", papel: "Médico", especialidade: "Clínica Geral", turno: "Manhã", consultas: "8 / 12", status: "Ativo" },
        { id: 2, nome: "Dra. Sandra Faria", crm: "CRM-SC 23456", papel: "Médica", especialidade: "Cardiologia", turno: "Integral", consultas: "15 / 20", status: "Ativo" },
        { id: 3, nome: "Dr. Jorge Alves", crm: "CRM-SC 34567", papel: "Médico", especialidade: "Ortopedia", turno: "Tarde", consultas: "0 / 10", status: "Folga" },
        { id: 4, nome: "Dra. Sandra Mello", crm: "CRM-SC 45678", papel: "Médica · Tele", especialidade: "Telemedicina", turno: "Manhã", consultas: "12 / 15", status: "Online" },
        { id: 5, nome: "Enf. Laura Rocha", crm: "COREN-SC 78901", papel: "Enfermeira", especialidade: "UTI", turno: "Noturno", consultas: "—", status: "Ativo" }
      ],
      agenda: [
        { id: 1, hora: "07:30", nome: "Fernanda Lima", especialidade: "Pré-natal", profissional: "Dra. Sandra Mello", status: "Confirmado" },
        { id: 2, hora: "08:00", nome: "Marco Pereira", especialidade: "Ecocardiograma", profissional: "Dra. Sandra Faria", status: "Em espera" },
        { id: 3, hora: "08:30", nome: "Beatriz Nunes", especialidade: "Teleconsulta", profissional: "Dra. Sandra Mello", status: "Online" },
        { id: 4, hora: "09:00", nome: "Henrique Castro", especialidade: "Neurologia", profissional: "Dr. Jorge Alves", status: "Agendado" },
        { id: 5, hora: "11:00", nome: "Lúcia Barros", especialidade: "Consulta", profissional: "Dr. Roberto Costa", status: "Confirmado" }
      ],
      telemedicina: {
        espera: [
          { id: 1, nome: "Ana Ferreira", tempo: 8, medico: "Dra. Sandra Mello" },
          { id: 2, nome: "Paulo Ramos", tempo: 3, medico: "Dr. Roberto Costa" },
          { id: 3, nome: "Lúcia Barros", tempo: 1, medico: "Dra. Sandra Faria" }
        ],
        andamento: [
          { id: 101, nome: "Beatriz Nunes", medico: "Dra. Sandra Mello", tempoStr: "00:14:32" },
          { id: 102, nome: "Tadeu Pires", medico: "Dr. Roberto Costa", tempoStr: "00:06:11" }
        ],
        prescricoes: []
      },
      leitos: {
        alaA: [
          { id: "A01", paciente: "João S.", status: "occupied" },
          { id: "A02", paciente: "Maria T.", status: "occupied" },
          { id: "A03", paciente: "Livre", status: "available" },
          { id: "A04", paciente: "Pedro N.", status: "occupied" },
          { id: "A05", paciente: "Limpeza", status: "cleaning" },
          { id: "A06", paciente: "Livre", status: "available" },
          { id: "A07", paciente: "Reservado", status: "reserved" },
          { id: "A08", paciente: "Luísa F.", status: "occupied" },
          { id: "A09", paciente: "Marcos R.", status: "occupied" },
          { id: "A10", paciente: "Livre", status: "available" },
          { id: "A11", paciente: "Célia B.", status: "occupied" },
          { id: "A12", paciente: "Reservado", status: "reserved" }
        ],
        uti: [
          { id: "U01", paciente: "Crítico", status: "occupied" },
          { id: "U02", paciente: "Crítico", status: "occupied" },
          { id: "U03", paciente: "Estável", status: "occupied" },
          { id: "U04", paciente: "Crítico", status: "occupied" },
          { id: "U14A", paciente: "ALERTA", status: "occupied" },
          { id: "U19", paciente: "Livre", status: "available" }
        ]
      },
      relatorios: [
        { id: 1, nome: "Atendimentos por especialidade", periodo: "Mai 2025", data: "30/05/2025", formato: "PDF" },
        { id: 2, nome: "Financeiro consolidado", periodo: "Mai 2025", data: "30/05/2025", formato: "XLSX" },
        { id: 3, nome: "Taxa de ocupação hospitalar", periodo: "Mai 2025", data: "29/05/2025", formato: "PDF" },
        { id: 4, nome: "Auditoria de acessos", periodo: "Mai 2025", data: "28/05/2025", formato: "CSV" },
        { id: 5, nome: "Indicadores LGPD", periodo: "Mai 2025", data: "27/05/2025", formato: "PDF" }
      ],
      logs: [
        { id: 1, hora: "09:47", usuario: "dr.costa", acao: "Acesso prontuário", ip: "192.168.1.12" },
        { id: 2, hora: "09:31", usuario: "admin", acao: "Login", ip: "192.168.1.1" },
        { id: 3, hora: "09:18", usuario: "enf.rocha", acao: "Atualização leito", ip: "192.168.1.44" },
        { id: 4, hora: "08:55", usuario: "desconhecido", acao: "Acesso negado", ip: "201.24.xx.xx" },
        { id: 5, hora: "08:12", usuario: "dra.mello", acao: "Receita emitida", ip: "192.168.1.22" }
      ],
      configuracoes: {
        instituicao: "VidaPlus Hospitais e Clínicas",
        cnpj: "00.000.000/0001-00",
        unidade: "Sede — Florianópolis",
        idioma: "Português (Brasil)",
        email: "suporte@vidaplus.com.br",
        uptime: "99,82%",
        ultimoBackup: "26h atrás"
      }
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDB, null, 2));
    return initialDB;
  }
  const rawData = fs.readFileSync(DB_PATH);
  return JSON.parse(rawData);
}

// Helper to write database
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// API Routes

// 1. Dashboard Stats
app.get('/api/dashboard/stats', (req, res) => {
  const db = readDB();
  const totalPacientes = db.pacientes.length;
  
  // Count beds
  const alaAOccupied = db.leitos.alaA.filter(b => b.status === 'occupied').length;
  const utiOccupied = db.leitos.uti.filter(b => b.status === 'occupied').length;
  const totalOcupados = alaAOccupied + utiOccupied;
  const totalBeds = db.leitos.alaA.length + db.leitos.uti.length;

  res.json({
    pacientesHoje: 137 + totalPacientes, // Seed + custom additions
    leitosOcupados: totalOcupados,
    leitosTotal: totalBeds,
    teleconsultas: db.telemedicina.andamento.length + db.telemedicina.espera.length + 15,
    alertasAtivos: db.leitos.uti.some(b => b.id === 'U14A' && b.status === 'occupied') ? 4 : 3
  });
});

// 2. Patients CRUD
app.get('/api/pacientes', (req, res) => {
  const db = readDB();
  let result = db.pacientes;
  
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    result = result.filter(p => 
      p.nome.toLowerCase().includes(q) || 
      p.cpf.includes(q) || 
      p.prontuario.toLowerCase().includes(q)
    );
  }
  
  if (req.query.especialidade && req.query.especialidade !== 'Todas') {
    result = result.filter(p => p.especialidade === req.query.especialidade);
  }
  
  res.json(result);
});

app.post('/api/pacientes', (req, res) => {
  const db = readDB();
  const newPatient = {
    id: Date.now(),
    nome: req.body.nome,
    idade: parseInt(req.body.idade),
    sexo: req.body.sexo,
    cpf: req.body.cpf,
    prontuario: `PRN-${Math.floor(10000 + Math.random() * 90000)}`,
    ultimaConsulta: new Date().toLocaleDateString('pt-BR'),
    especialidade: req.body.especialidade || "Clínica Geral",
    status: req.body.status || "Ativo"
  };
  
  db.pacientes.unshift(newPatient); // Add to beginning
  
  // Log security / audit action
  db.logs.unshift({
    id: Date.now() + 1,
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    usuario: "admin",
    acao: `Cadastro paciente ${newPatient.nome}`,
    ip: "192.168.1.1"
  });
  
  writeDB(db);
  res.status(201).json(newPatient);
});

app.put('/api/pacientes/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const index = db.pacientes.findIndex(p => p.id === id);
  
  if (index !== -1) {
    db.pacientes[index] = { ...db.pacientes[index], ...req.body };
    writeDB(db);
    res.json(db.pacientes[index]);
  } else {
    res.status(404).json({ error: "Paciente não encontrado" });
  }
});

app.delete('/api/pacientes/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const index = db.pacientes.findIndex(p => p.id === id);
  
  if (index !== -1) {
    const deleted = db.pacientes.splice(index, 1);
    writeDB(db);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ error: "Paciente não encontrado" });
  }
});

// 3. Agenda (Schedule)
app.get('/api/agenda', (req, res) => {
  const db = readDB();
  res.json(db.agenda);
});

app.post('/api/agenda', (req, res) => {
  const db = readDB();
  const newAppointment = {
    id: Date.now(),
    hora: req.body.hora,
    nome: req.body.nome,
    especialidade: req.body.especialidade,
    profissional: req.body.profissional,
    status: req.body.status || "Confirmado"
  };
  db.agenda.push(newAppointment);
  
  db.logs.unshift({
    id: Date.now() + 1,
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    usuario: "admin",
    acao: `Consulta agendada: ${newAppointment.nome}`,
    ip: "192.168.1.1"
  });

  writeDB(db);
  res.status(201).json(newAppointment);
});

// 4. Telemedicina
app.get('/api/telemedicina/espera', (req, res) => {
  const db = readDB();
  res.json(db.telemedicina.espera);
});

app.post('/api/telemedicina/iniciar', (req, res) => {
  const db = readDB();
  const id = parseInt(req.body.id);
  const index = db.telemedicina.espera.findIndex(p => p.id === id);
  
  if (index !== -1) {
    const p = db.telemedicina.espera.splice(index, 1)[0];
    
    // Add to active teleconsultations (andamento)
    const activeConsultation = {
      id: Date.now(),
      nome: p.nome,
      medico: p.medico,
      tempoStr: "00:00:01"
    };
    db.telemedicina.andamento.push(activeConsultation);
    
    db.logs.unshift({
      id: Date.now() + 1,
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      usuario: "admin",
      acao: `Início teleconsulta: ${p.nome}`,
      ip: "192.168.1.1"
    });

    writeDB(db);
    res.json(activeConsultation);
  } else {
    res.status(404).json({ error: "Paciente não está na sala de espera" });
  }
});

app.post('/api/telemedicina/prescricao', (req, res) => {
  const db = readDB();
  const prescription = {
    id: Date.now(),
    paciente: req.body.paciente,
    prescricao: req.body.prescricao,
    data: new Date().toLocaleString('pt-BR'),
    assinaturaDigital: `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
  };
  
  db.telemedicina.prescricoes.push(prescription);
  
  db.logs.unshift({
    id: Date.now() + 1,
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    usuario: "admin",
    acao: `Prescrição emitida para ${prescription.paciente}`,
    ip: "192.168.1.1"
  });

  writeDB(db);
  res.status(201).json(prescription);
});

// 5. Leitos (Beds)
app.get('/api/leitos', (req, res) => {
  const db = readDB();
  res.json(db.leitos);
});

app.post('/api/leitos/status', (req, res) => {
  const db = readDB();
  const { id, ala, status, paciente } = req.body;
  
  const bedList = db.leitos[ala];
  if (!bedList) return res.status(400).json({ error: "Ala inválida" });
  
  const bed = bedList.find(b => b.id === id);
  if (bed) {
    bed.status = status;
    if (paciente !== undefined) bed.paciente = paciente;
    
    db.logs.unshift({
      id: Date.now(),
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      usuario: "admin",
      acao: `Alterado status leito ${id} para ${status}`,
      ip: "192.168.1.1"
    });

    writeDB(db);
    res.json(bed);
  } else {
    res.status(404).json({ error: "Leito não encontrado" });
  }
});

// 6. Profissionais
app.get('/api/profissionais', (req, res) => {
  const db = readDB();
  res.json(db.profissionais);
});

app.post('/api/profissionais', (req, res) => {
  const db = readDB();
  const newProf = {
    id: Date.now(),
    nome: req.body.nome,
    crm: req.body.crm || `CRM-SC ${Math.floor(10000 + Math.random() * 90000)}`,
    papel: req.body.papel || "Médico",
    especialidade: req.body.especialidade,
    turno: req.body.turno || "Integral",
    consultas: "0 / 10",
    status: "Ativo"
  };
  db.profissionais.push(newProf);

  db.logs.unshift({
    id: Date.now() + 1,
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    usuario: "admin",
    acao: `Cadastro profissional: ${newProf.nome}`,
    ip: "192.168.1.1"
  });

  writeDB(db);
  res.status(201).json(newProf);
});

// 7. Relatórios
app.get('/api/relatorios', (req, res) => {
  const db = readDB();
  res.json(db.relatorios);
});

app.post('/api/relatorios/gerar', (req, res) => {
  const db = readDB();
  const newReport = {
    id: Date.now(),
    nome: req.body.nome,
    periodo: req.body.periodo || "Mai 2025",
    data: new Date().toLocaleDateString('pt-BR'),
    formato: req.body.formato || "PDF"
  };
  db.relatorios.unshift(newReport);
  
  db.logs.unshift({
    id: Date.now() + 1,
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    usuario: "admin",
    acao: `Relatório gerado: ${newReport.nome}`,
    ip: "192.168.1.1"
  });

  writeDB(db);
  res.status(201).json(newReport);
});

// 8. Segurança Logs
app.get('/api/seguranca/logs', (req, res) => {
  const db = readDB();
  res.json(db.logs);
});

// 9. Configurações
app.get('/api/configuracoes', (req, res) => {
  const db = readDB();
  res.json(db.configuracoes);
});

app.post('/api/configuracoes', (req, res) => {
  const db = readDB();
  db.configuracoes = { ...db.configuracoes, ...req.body };
  
  db.logs.unshift({
    id: Date.now(),
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    usuario: "admin",
    acao: "Configurações gerais atualizadas",
    ip: "192.168.1.1"
  });

  writeDB(db);
  res.json(db.configuracoes);
});

app.post('/api/configuracoes/backup', (req, res) => {
  const db = readDB();
  db.configuracoes.ultimoBackup = "Agora mesmo (Sucesso)";
  
  db.logs.unshift({
    id: Date.now(),
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    usuario: "admin",
    acao: "Forçado backup do sistema",
    ip: "192.168.1.1"
  });
  
  writeDB(db);
  res.json({ success: true, message: "Backup realizado com sucesso!", timestamp: new Date().toLocaleString() });
});

// Start Server
readDB(); // Initialize DB if not present
app.listen(PORT, () => {
  console.log(`SGHSS Server is running on http://localhost:${PORT}`);
});
