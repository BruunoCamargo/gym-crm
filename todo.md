# Gym CRM - Lista de Tarefas

## Banco de Dados
- [x] Criar tabela `students` (alunos) com todos os campos obrigatórios
- [x] Criar tabela `plans` (planos) com tipos e preços
- [x] Criar tabela `payment_history` (histórico de pagamentos)
- [x] Gerar migration SQL e aplicar no banco

## Backend (tRPC Routers)
- [x] Router de alunos: listar, criar, editar, excluir
- [x] Router de alunos: filtros por nome, status e plano
- [x] Router de dashboard: estatísticas e contadores
- [x] Router de histórico de pagamentos

## Frontend - Layout e Identidade Visual
- [x] Definir paleta de cores HEX e aplicar no index.css
- [x] Configurar fontes profissionais (Google Fonts)
- [x] Criar DashboardLayout adaptado para o CRM
- [x] Criar componente de sidebar com navegação

## Frontend - Páginas
- [x] Tela de login (redirecionamento OAuth)
- [x] Dashboard com cards de estatísticas e gráficos
- [x] Página de listagem de alunos com tabela
- [x] Modal/página de cadastro de novo aluno
- [x] Modal/página de edição de aluno
- [x] Confirmação de exclusão de aluno

## Funcionalidades Avançadas
- [x] Sistema de filtros e busca em tempo real
- [x] Alertas visuais para mensalidades vencidas
- [x] Alertas para mensalidades próximas do vencimento (7 dias)
- [x] Badge de status colorido (Pago/Pendente/Vencido)

## Logotipo e Identidade
- [x] Gerar logotipo via IA com prompt otimizado
- [x] Integrar logotipo na sidebar e tela de login

## Qualidade e Entrega
- [x] Escrever testes vitest para routers principais (19 testes passando)
- [x] Revisar comentários didáticos no código
- [x] Salvar checkpoint final


## Conversão para Electron (Desktop App Windows)
- [x] Instalar e configurar Electron
- [x] Criar arquivo main.ts para gerenciar janela do app
- [x] Configurar IPC (Inter-Process Communication) para comunicação segura
- [x] Integrar build do Vite com Electron
- [x] Configurar electron-builder para gerar instalador .exe
- [x] Criar ícone do aplicativo (PNG 1024x1024)
- [x] Criar documentação de build (ELECTRON_BUILD.md)
- [x] Configurar scripts de build no package.json
- [x] Criar guia completo de uso (GUIA_COMPLETO.md e PDF)
