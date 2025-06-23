const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const path = require('path');
const { getAuthenticatedClient, readSheet, updateSheet } = require('./sheets');
const { sendMessage } = require('./whatsapp');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = process.env.SHEET_RANGE.split('!')[0];
const SHEET_RANGE = process.env.SHEET_RANGE;

app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('send-messages', async () => {
        try {
            if (!SPREADSHEET_ID || !SHEET_RANGE) {
                throw new Error('SPREADSHEET_ID and SHEET_RANGE must be set in .env file');
            }

            socket.emit('log', { message: 'Autenticando com o Google...' });
            const auth = await getAuthenticatedClient();
            socket.emit('log', { message: 'Lendo e filtrando contatos da planilha...' });
            
            const rows = await readSheet(auth, SPREADSHEET_ID, SHEET_RANGE);
            
            if (rows && rows.length > 1) {
                const contactsToProcess = [];
                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i];
                    const currentStatus = row[10]; // Coluna K
                    const shouldSend = row[12];    // Coluna M
                    if (shouldSend === 'TRUE' && !currentStatus) {
                        contactsToProcess.push({ data: row, originalIndex: i + 1 });
                    }
                }

                const total = contactsToProcess.length;
                let processed = 0;
                let success = 0;
                let failed = 0;

                socket.emit('log', { message: `Encontrados ${total} contatos para processar.` });
                socket.emit('progress-update', { total, processed, success, failed });

                if (total === 0) {
                    socket.emit('process-finished');
                    return;
                }

                for (const contact of contactsToProcess) {
                    const row = contact.data;
                    const rowIndex = contact.originalIndex;

                    const to = row[0];
                    const clientName = row[3];
                    const totalValue = row[7];
                    
                    if (to && clientName && totalValue) {
                        const message = `Olá, ${clientName}. Tudo bem?\nSou a Vitória e faço parte do time de CS na *W1 Consultoria*.\n\nIdentifiquei que a parcela referente ao seu plano Previdência, ainda está pendente. É importante regularizá-la para que você continue aproveitando todos os benefícios e planejamento financeiro.\n\nSegue abaixo o resumo da pendência:\n\n*Plano: Previdência*\n*Valor total: R$ ${totalValue}*\n\nSe já realizou o pagamento, desconsidere esta mensagem. Caso contrário, estou à disposição para ajudar da melhor forma possível. ☺️`;
                        
                        try {
                            await sendMessage(to, message);
                            await updateSheet(auth, SPREADSHEET_ID, `${SHEET_NAME}!K${rowIndex}`, [['Contato realizado']]);
                            success++;
                            socket.emit('log', { status: 'success', message: `✅ Enviado para ${clientName}.` });
                        } catch (error) {
                            const errorMessage = `Erro: ${error.message}`;
                            await updateSheet(auth, SPREADSHEET_ID, `${SHEET_NAME}!K${rowIndex}`, [[errorMessage]]);
                            failed++;
                            socket.emit('log', { status: 'error', message: `❌ Falha ao enviar para ${clientName}: ${error.message}` });
                        }
                    } else {
                        const errorMessage = 'Dados obrigatórios ausentes (Telefone, Nome ou Valor)';
                        await updateSheet(auth, SPREADSHEET_ID, `${SHEET_NAME}!K${rowIndex}`, [[errorMessage]]);
                        failed++;
                        socket.emit('log', { status: 'error', message: `Pulando linha ${rowIndex}: ${errorMessage}` });
                    }
                    
                    processed++;
                    socket.emit('progress-update', { total, processed, success, failed });
                    await new Promise(res => setTimeout(res, 300)); // Pequena pausa
                }

                socket.emit('log', { message: 'Processamento concluído.' });

            } else {
                socket.emit('log', { message: 'Nenhum dado encontrado na planilha (ou apenas o cabeçalho).' });
            }

        } catch (error) {
            console.error('Error:', error);
            socket.emit('log', { status: 'error', message: `Erro geral: ${error.message}` });
        } finally {
            socket.emit('process-finished');
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 