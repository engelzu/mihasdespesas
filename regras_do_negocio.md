# Regras de Negócio - Minhas Despesas App

Este documento reúne todas as regras de negócio, fluxos de funcionamento, integrações e comportamentos do aplicativo **Minhas Despesas**.

---

## 1. Perfil e Autenticação do Usuário

### 1.1 Cadastro e Login
*   **Métodos Permitidos**: O usuário pode autenticar-se por e-mail/senha ou através de login social com o Google.
*   **Comportamento Nativo vs. Web**:
    *   No ambiente mobile nativo (Android/iOS via Capacitor), o login do Google utiliza o plugin `@capacitor-firebase/authentication` com credenciais locais.
    *   No ambiente Web (navegador), o login do Google utiliza fluxo de pop-up padrão do Firebase Auth (`signInWithPopup`).
*   **Recuperação de Senha**: Usuários de e-mail/senha podem solicitar e-mail de recuperação utilizando o fluxo nativo do Firebase Auth.

### 1.2 Estrutura do Perfil Inicial (Firestore)
Ao registrar-se (ou no primeiro login), um documento na coleção `users` com o ID do usuário (`uid`) é criado ou atualizado com os seguintes dados padrão:
*   `monthlyBudget`: R$ 3.000,00 (Orçamento inicial padrão).
*   `categories`: Lista inicial de categorias: `['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer', 'Fixas', 'Outros']`.
*   `isPaid`: `false` (Acesso premium desativado por padrão).
*   `trialStartDate`: Carimbo de data/hora (ISO string) que marca a data e hora do primeiro login ou criação da conta, iniciando a contagem do trial.

### 1.3 Exibição do Perfil e Logout (Modal de Perfil)
*   Em todas as abas principais do aplicativo, o cabeçalho exibe um ícone de perfil de usuário (`account_circle`).
*   Ao clicar neste ícone, um modal flutuante é aberto exibindo o e-mail do usuário autenticado no momento, cujos dados são buscados ativamente via integração com o `firebase.auth().currentUser`.
*   **Logout (Sair do App)**: A ação de deslogar do sistema foi movida para dentro deste Modal de Perfil. Isso centraliza as informações da conta e previne cliques acidentais na barra superior.

---

## 2. Controle de Acesso, Período de Testes e Paywall (Premium)

### 2.1 Período de Avaliação Gratuita (Trial)
*   **Duração**: O usuário tem direito a até **7 dias** de uso gratuito da versão web, contados a partir da data de seu primeiro login (`trialStartDate`).
*   **Modal de Aviso**: Logo após o login (e nas visitas subsequentes no dashboard), caso o usuário esteja no período de testes e ainda não tenha pago a licença, o sistema apresenta um modal moderno informando que ele tem até 7 dias grátis e que após isso poderá comprar a licença por R$ 7,00. O modal é exibido uma vez por sessão.

### 2.2 Regra de Cobrança e Bloqueio por Plataforma
*   **Mobile Nativo**: O acesso ao aplicativo em plataformas móveis nativas (Android e iOS) é **gratuito e liberado** sem restrições.
*   **Web (Navegador)**: O acesso na versão web exige um pagamento único de **R$ 7,00** para liberação vitalícia após a expiração do período de testes.
*   **Bloqueio de Navegação (Pós-Trial)**:
    *   Sempre que o usuário está no ambiente Web, `isPaid` é `false` **e** o período de trial de 7 dias já expirou (mais de 7 dias desde `trialStartDate`), qualquer tentativa de acessar páginas internas (como Dashboard, Histórico ou Adicionar Despesa) resulta em redirecionamento compulsório para `/paywall/code.html`.

### 2.2 Métodos de Pagamento e Liberação
1.  **PIX Manual**:
    *   O usuário realiza um PIX de R$ 7,00 para o CNPJ: `14.504.178/0001-84`.
    *   A liberação é **manual**, realizada por um administrador através do Painel Admin.
    *   Na página de Paywall, o usuário pode clicar em "Já paguei, verificar meu status" para reconsultar as informações de seu perfil no Firestore.
2.  **Mercado Pago (Cartão/PIX Integrado)**:
    *   O usuário clica em "Realizar Pagamento" e o app chama a Netlify Function `create_preference`, gerando uma preferência com preço unitário de R$ 7,00 e associando o `uid` do usuário ao campo `external_reference`.
    *   O usuário é redirecionado ao checkout do Mercado Pago.
    *   Após aprovação, o webhook do Mercado Pago (`webhook.js`) recebe o evento, consulta a transação e atualiza o documento do usuário no Firestore setando `isPaid: true`, o ID do pagamento e o carimbo de data/hora (`paidAt`).

---

## 3. Painel Administrativo (Gestão de Acessos)

O aplicativo possui um painel administrativo acessível na rota `/admin/index.html` para gerenciamento manual de usuários.

### 3.1 Autenticação Admin
*   O acesso ao painel é protegido por uma **senha mestra**: `789512`.
*   A senha é validada no backend (Netlify Functions) a cada requisição de dados ou ação.

### 3.2 Funcionalidades do Painel
*   **Listagem de Usuários** (`admin_list_users.js`): Exibe o e-mail, data de cadastro, status do pagamento (`isPaid`) e orçamento dos últimos 1000 usuários registrados. Ordena os usuários aguardando pagamento primeiro.
*   **Aprovação Manual** (`admin_approve_pix.js`): Permite ao administrador aprovar manualmente um pagamento (definindo `isPaid` como `true` e gravando `paymentId: 'manual_pix_admin'`) ou revogar/bloquear o acesso (definindo `isPaid` como `false`).

---

## 4. Gestão de Categorias

### 4.1 Lista de Categorias
*   As categorias são salvas no array `categories` dentro do documento do usuário no Firestore.
*   O usuário pode adicionar novas categorias e excluir existentes pelo modal "Gerenciar Categorias" no menu lateral.

### 4.2 Edição e Cascata
*   Ao renomear uma categoria, o sistema executa um lote de atualizações no Firestore (usando `db.batch()`) para reescrever o campo `category` em **todas** as despesas antigas atreladas ao nome anterior.

---

## 5. Lançamentos (Receitas e Despesas)

Os lançamentos são salvos na subcoleção `expenses` dentro do documento do usuário (`/users/{uid}/expenses/{id}`).

### 5.1 Regras de Campos por Tipo
*   **Despesa (`type: 'expense'`)**:
    *   Exige: Descrição, Valor, Data, Categoria e Forma de Pagamento.
*   **Receita (`type: 'income'`)**:
    *   Exige: Descrição, Valor, Data.
    *   A categoria é automaticamente definida como `"Receita"`.
    *   A forma de pagamento é deixada em branco (`""`).

### 5.2 Mapeamento de Forma de Pagamento (Despesas)
No formulário de inserção, os meios de pagamento são mapeados da seguinte forma:
*   `dinheiro` -> `"Dinheiro"`
*   `debito` -> `"Cartão de Débito"`
*   `credito` -> `"Cartão de Crédito"`
*   `pix` -> `"Pix"`
*   `boleto` -> `"Boleto"`

### 5.3 Lançamento com Cartão de Crédito
*   Quando a forma de pagamento selecionada é `"Cartão de Crédito"`, o aplicativo calcula e exibe na tela um alerta informativo com a **Previsão de Pagamento** para 30 dias após a data selecionada no lançamento.

---

## 6. Dashboard e Indicadores Financeiros

O Dashboard (`dashboard_de_despesas/code.html`) realiza cálculos em tempo real baseados nas despesas e receitas do **mês vigente**:

### 6.1 Saldo Disponível
*   **Fórmula**: `Saldo Disponível = (Orçamento Mensal + Total Receitas do Mês) - Total Despesas do Mês`
*   *Nota*: O orçamento mensal é definido pelo usuário no modal de saldo e pode ter uma data de lançamento registrada (`budgetDate`).

### 6.2 Divisão de Gastos por Meio de Pagamento
Calcula a soma das despesas do mês corrente segregando-as pelos seguintes termos (case-insensitive):
*   **Lançamento Futuro (Crédito)**: Meio de pagamento que contém "crédito" ou igual a "credito". No painel do dashboard, esse card é exibido com o título "Lançamento Futuro" para representar o valor previsto a ser pago na fatura de crédito.
*   **Débito**: Meio de pagamento que contém "débito" ou igual a "debito".
*   **Dinheiro**: Demais casos que não correspondam aos anteriores ou ao Pix e Boleto.
*   **Pix**: Meio de pagamento que contém "pix".
*   **Boleto**: Meio de pagamento que contém "boleto".

### 6.3 Indicador de Economia e Progresso
*   **Percentual Usado**: `(Total Despesas do Mês / (Orçamento Mensal + Total Receitas do Mês)) * 100`.
*   **Percentual de Economia**: `100 - Percentual Usado`.

### 6.4 Meta Mensal (Savings Goal)
*   O usuário pode definir uma **Meta Mensal** (`monthlyGoal`).
*   **Se ultrapassada** (`Total Despesas > Meta Mensal`): A interface altera o card da meta para vermelho (classe de erro), exibe um ícone de tendência para cima (`trending_up`) e destaca o valor acumulado em vermelho.
*   **Se dentro do limite**: O card se mantém verde, com ícone de tendência para baixo (`trending_down`).

### 6.5 Gasto Diário Médio
*   **Fórmula**: `Gasto Diário Médio = Total Despesas do Mês / Dia Atual do Mês`.

---

## 7. Histórico e Exportação de Relatórios

O histórico permite visualizar, filtrar e exportar os registros financeiros.

### 7.1 Filtros e Busca
*   **Mês de Referência**: Permite filtrar registros por um mês e ano específicos. O menu seletor é preenchido dinamicamente com base nos meses em que há lançamentos cadastrados.
*   **Busca Textual**: Filtra as despesas em tempo real pelo campo de descrição (case-insensitive).
*   **Pills de Categoria**: Filtra as despesas pela categoria selecionada.

### 7.2 Métodos de Exportação
1.  **Excel (CSV)**: Gera um arquivo CSV com codificação UTF-8 contendo as colunas `Data, Descrição, Tipo, Categoria, Forma de Pagamento, Valor` de acordo com os filtros aplicados no momento da exportação.
2.  **Cupom Fiscal Virtual**:
    *   Exige a seleção de um mês de referência específico.
    *   Exibe um modal estilizado como cupom fiscal térmico amarelo contendo a listagem simplificada das transações, a soma das receitas, a soma das despesas e o saldo final (Receitas - Despesas) do respectivo mês.

---

## 8. Funcionalidades Offline e PWA

### 8.1 Offline Caching
*   O aplicativo utiliza um Service Worker (`sw.js`) que cacheia arquivos estáticos (HTML, JS, CSS, fontes e ícones) para carregamento instantâneo e funcionamento mesmo sem conectividade com a internet.

### 8.2 Monitor de Armazenamento Local
*   No menu lateral (sidebar), é exibido um widget informando a ocupação do banco de dados local (`localStorage`).
*   O cálculo estima o total de bytes ocupados pela soma do tamanho das chaves e valores armazenados no `localStorage` frente a um limite de segurança de **5 MB** (padrão em aparelhos iOS).
*   Se o consumo ultrapassar 80%, a barra indicadora e o texto de porcentagem mudam de cor para vermelho (estado de alerta).

---

## 9. Compilação e Deploy nas Lojas (Ionic Appflow)

### 9.1 Estrutura Base
*   O aplicativo utiliza o **Capacitor** (criado pela equipe do Ionic) como motor para transformar o código web (HTML/JS/CSS) em aplicações nativas.
*   Os arquivos de configuração ficam centralizados em `capacitor.config.json` e a pasta `android/` guarda a base do projeto mobile nativo.

### 9.2 Build na Nuvem (Ionic Appflow)
*   Para compilar o aplicativo para as lojas (Google Play e Apple App Store) sem a necessidade de instalar ambientes locais pesados (como o Android Studio ou Xcode), o projeto utiliza a plataforma em nuvem **Ionic Appflow** (`https://ionic.io/appflow`).
*   **Processo**: 
    1. O código-fonte é enviado para um repositório (ex: GitHub).
    2. O Ionic Appflow lê o repositório e executa a compilação nos próprios servidores.
    3. Ele gera os pacotes finais (`.aab` e `.apk` para Android, `.ipa` para iOS) prontos para upload direto nas respectivas lojas de aplicativos.

---

## 10. Versionamento e Código-Fonte

O código-fonte completo deste projeto está versionado de forma segura no **GitHub**. Isso garante o histórico de atualizações e facilita a integração com serviços de build na nuvem (como o Ionic Appflow).

*   **Plataforma**: GitHub
*   **Endereço do Repositório**: `https://github.com/engelzu/mihasdespesas`
*   **Branch Principal**: `main`
