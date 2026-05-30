# SGHSS — VidaPlus

Este é o protótipo funcional e completo do **Sistema de Gestão Hospitalar e de Serviços de Saúde (SGHSS)** desenvolvido para a instituição **VidaPlus** como entrega do **Projeto Multidisciplinar (Ano 2025)**.

O projeto foi construído utilizando uma arquitetura moderna e de alto desempenho, unindo um front-end dinâmico e responsivo (SPA) a um back-end robusto e persistente em Node.js com banco de dados simulado e relatórios integrados.

## 🚀 Como Executar o Projeto

Certifique-se de possuir o [Node.js](https://nodejs.org/) instalado em sua máquina.

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm start
   ```
   Ou inicie no modo de observação contínua (hot-reload):
   ```bash
   npm run dev
   ```

3. Abra o navegador e acesse:
   ```text
   http://localhost:3000
   ```

## 📁 Estrutura de Arquivos

```text
sghss-vidaplus/
├── database.json        # Banco de dados persistente em formato estruturado
├── server.js            # Servidor Express & rotas da API RESTful
├── package.json         # Manifesto e scripts de execução
├── DOCUMENTACAO.md      # Monografia / Relatório técnico da faculdade
├── README.md            # Instruções e descrição geral
└── public/              # Diretório estático do Front-end (SPA)
    ├── css/
    │   └── style.css    # Variáveis visuais, layouts responsivos e modais
    ├── js/
    │   └── app.js       # Controladores e requisições dinâmicas de API (fetch)
    └── index.html       # Estrutura HTML5 semântica e acessível (W3C/WCAG)
```

## 🌟 Principais Funcionalidades Implementadas

1. **Dashboard Geral Dinâmico:** Indicadores de pacientes hoje, leitos ocupados, teleconsultas ativas e alertas urgentes são calculados assintoticamente em tempo real diretamente do banco de dados.
2. **CRUD Completo de Pacientes:** Cadastro, edição e remoção direta com geração aleatória automática de prontuário eletrônico.
3. **Agendamento de Consultas:** Alocação de slots de consultas por profissional de saúde, horário e especialidade.
4. **Telemedicina Real:** Sala virtual ativa, fila dinâmica de espera ("Iniciar") e emissão de receita eletrônica rápida com hash de assinatura digital criptográfica (SHA-256).
5. **Mapa de Leitos Dinâmico:** Gestão à beira do leito de enfermagem. Clique em qualquer leito clínico (Ala A) ou leito crítico (UTI) para gerenciar o status e o paciente ocupante instantaneamente.
6. **Relatórios Administrativos:** Gerador instantâneo de novos relatórios nos formatos PDF, XLSX ou CSV.
7. **Segurança de Acessos (LGPD):** Logs de auditoria gerados de forma automática em tempo de execução para cada ação crítica executada dentro do sistema (visualizações, cadastros, backups).
8. **Configurações e Backup:** Formulário de atualizações da instituição e botão funcional de disparo de backups manuais integrados à auditoria.

## 🎓 Documentação Acadêmica
O arquivo `DOCUMENTACAO.md` contém a monografia acadêmica completa estruturada estritamente de acordo com as exigências da disciplina, incluindo:
- Capa e Sumário;
- Introdução teórica;
- Análise de Requisitos (Requisitos Funcionais e Não Funcionais em tabelas);
- Diagramas UML em Mermaid (Caso de Uso, Diagrama de Classes, DER);
- Especificação de Endpoints;
- Plano de Testes detalhado com Cypress e casos funcionais;
- Conclusão e Referências Acadêmicas (Sommerville, Pressman, LGPD, CFM).

---

> **Dica:** Para habilitar total integração das ferramentas de edição no editor, defina a pasta `/home/leonardo/.gemini/antigravity/scratch/sghss-vidaplus` como seu **Workspace Ativo**.
