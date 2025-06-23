# Disparador de Mensagens WhatsApp via Planilhas Google

Este projeto é uma aplicação web que lê contatos e mensagens de uma Planilha Google e os envia via WhatsApp, atualizando a planilha com o status de cada envio em tempo real.

## Funcionalidades

-   **Interface Web Simples**: Inicie o processo de envio com um único clique.
-   **Log em Tempo Real**: Acompanhe o progresso e os erros diretamente na tela.
-   **Integração com Google Sheets**: Lê os dados diretamente de uma planilha que você controla.
-   **Atualização Automática de Status**: A aplicação escreve o status ("Enviado", "Erro", etc.) de volta na planilha para cada contato.
-   **Flexível**: Conecte-se a qualquer serviço de envio de WhatsApp que possua uma API.

---

## Passo a Passo para Configuração

Siga estas instruções para configurar e executar o projeto em seu próprio ambiente.

### 1. Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão 14 ou superior) instalado em sua máquina.
-   Uma conta Google.
-   Acesso a uma API de envio de WhatsApp (com `URL` e `API_KEY`).

### 2. Configuração do Google Sheets e API

Para que a aplicação possa ler e escrever na sua planilha, você precisa criar uma "Conta de Serviço" no Google Cloud e compartilhar a planilha com ela.

1.  **Crie um Projeto no Google Cloud**:
    -   Acesse o [Console do Google Cloud](https://console.cloud.google.com/).
    -   Crie um novo projeto (ou selecione um existente).

2.  **Ative a API do Google Sheets**:
    -   No menu do seu projeto, vá para `APIs e Serviços > Biblioteca`.
    -   Procure por "Google Sheets API" e clique em **Ativar**.

3.  **Crie uma Conta de Serviço**:
    -   Vá para `APIs e Serviços > Credenciais`.
    -   Clique em `+ CRIAR CREDENCIAIS` e selecione `Conta de serviço`.
    -   Dê um nome para a conta (ex: `whatsapp-sheets-bot`), clique em **CRIAR E CONTINUAR** e depois em **CONCLUÍDO**.

4.  **Gere a Chave de Autenticação (`credentials.json`)**:
    -   Ainda na tela de `Credenciais`, clique na conta de serviço que você acabou de criar.
    -   Vá para a aba `CHAVES`.
    -   Clique em `ADICIONAR CHAVE > Criar nova chave`.
    -   Selecione o formato **JSON** e clique em **CRIAR**. O download de um arquivo `.json` será iniciado.
    -   **Renomeie este arquivo para `credentials.json` e coloque-o na raiz do projeto.**

5.  **Compartilhe a Planilha com a Conta de Serviço**:
    -   Abra o arquivo `credentials.json` e copie o valor do campo `client_email`. (ex: `nome-da-conta@...gserviceaccount.com`).
    -   Abra sua Planilha Google, clique em **Compartilhar** no canto superior direito.
    -   Cole o email da conta de serviço no campo de compartilhamento, dê a ela a permissão de **Editor** e clique em **Enviar**.

### 3. Configuração do Projeto

1.  **Clone o Repositório**:
    -   Se você recebeu o projeto como uma pasta, pule esta etapa. Caso contrário, clone-o do repositório.

2.  **Instale as Dependências**:
    -   Abra o terminal na pasta do projeto e execute o comando:
        ```bash
        npm install
        ```

3.  **Configure as Variáveis de Ambiente**:
    -   Na raiz do projeto, você encontrará um arquivo chamado `.env.example`.
    -   Crie uma cópia deste arquivo e renomeie-a para `.env`.
    -   Abra o arquivo `.env` e preencha os valores:
        -   `SPREADSHEET_ID`: O ID da sua planilha. Você o encontra na URL: `.../spreadsheets/d/`**`ESTE_É_O_ID`**`/edit`.
        -   `SHEET_RANGE`: O nome da aba e o intervalo de colunas. Se o nome da aba tiver espaços, coloque-o entre aspas simples. Ex: `'Minha Aba'!A:C`.
        -   `API_URL` e `API_KEY`: A URL e a Chave de API fornecidas pelo seu serviço de envio do WhatsApp.

### 4. Preparando sua Planilha

A aplicação espera que sua planilha tenha colunas específicas para funcionar corretamente. **A ordem e a posição das colunas são importantes.**

-   **Coluna A**: O **número de telefone** do destinatário (com código do país e DDD, ex: `5511...`).
-   **Coluna D**: O **nome do cliente**.
-   **Coluna H**: O **valor total** da pendência (será usado na mensagem).
-   **Coluna K**: Deixe em branco. A aplicação usará esta coluna para escrever o **status do envio** (`Enviado`, `Erro`, etc.). Você pode adicionar o cabeçalho "Status" na célula `K1`.
-   **Coluna M**: Adicione uma **caixa de seleção** (Vá em `Inserir > Caixa de seleção`).

> **Regra de Envio**: A aplicação só enviará mensagens para as linhas que tiverem a **caixa de seleção na coluna M marcada** E a **célula de status na coluna K vazia**.

### 5. Executando a Aplicação

1.  **Inicie o Servidor**:
    -   No terminal, na pasta do projeto, execute:
        ```bash
        npm start
        ```
    -   Você verá a mensagem `Server is running on port 3000`.

2.  **Acesse a Interface**:
    -   Abra seu navegador e acesse: [http://localhost:3000](http://localhost:3000).

3.  **Envie as Mensagens**:
    -   Clique no botão **"Send Messages"** e acompanhe o progresso na área de logs. 