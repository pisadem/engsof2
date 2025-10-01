const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const port = 3000;

// Configuração da conexão com o banco de dados
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '@Fm180998',
    database: 'purrposedb'
});

// Conecta ao banco de dados
connection.connect(error => {
    if (error) {
        console.error('Erro ao conectar ao banco de dados: ', error);
        return;
    }
    console.log('Conectado ao banco de dados!');
});

app.use(express.json());
app.use(cors());

// Rota inicial
app.get('/', (req, res) => {
    res.send('Servidor rodando!');
});

// Rota de cadastro
app.post('/cadastro', (req, res) => {
    const dados = req.body;
    
    // 1. Validação básica de campos obrigatórios
    if (!dados.email || !dados.senha) {
        return res.status(400).json({ mensagem: 'Email e senha são obrigatórios.', status: 400 });
    }

    // 2. Criptografar a senha antes de salvar
    const salt = bcrypt.genSaltSync(10);
    const senhaCriptografada = bcrypt.hashSync(dados.senha, salt);
    
    // 3. Montar a query SQL para inserir os dados
    const sql = `
        INSERT INTO usuarios (tipo, email, senha, primeiroNome, ultimoNome, cpf, nascimento, razaoSocial, nomeFantasia, cnpj) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // 4. Determinar os valores a serem inseridos com base no tipo de usuário
    let valores;
    if (dados.tipo === 'pf') {
        valores = [
            dados.tipo,
            dados.email,
            senhaCriptografada,
            dados.primeiroNome,
            dados.ultimoNome,
            dados.cpf,
            dados.nascimento,
            null, // razão social
            null, // nome fantasia
            null  // cnpj
        ];
    } else if (dados.tipo === 'pj') {
        valores = [
            dados.tipo,
            dados.email,
            senhaCriptografada,
            null, // primeiro nome
            null, // ultimo nome
            null, // cpf
            null, // nascimento
            dados.razaoSocial,
            dados.nomeFantasia,
            dados.cnpj
        ];
    }

    // 5. Executar a query
    connection.query(sql, valores, (error, results) => {
        if (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado.', status: 409 });
            }
            console.error('Erro ao salvar no banco de dados:', error);
            return res.status(500).json({ mensagem: 'Erro ao cadastrar usuário.', status: 500 });
        }
        
        console.log('Usuário cadastrado com sucesso! ID:', results.insertId);
        res.status(200).json({ mensagem: 'Cadastro realizado com sucesso!', status: 200 });
    });
});

// Rota de login
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    
    // 1. Validação básica
    if (!email || !senha) {
        return res.status(400).json({ mensagem: 'Email e senha são obrigatórios.', status: 400 });
    }

    // 2. Consulta o banco de dados para encontrar o usuário pelo e-mail
    const sql = 'SELECT id, email, senha, tipo FROM usuarios WHERE email = ?';

    connection.query(sql, [email], (error, results) => {
        if (error) {
            console.error('Erro ao buscar usuário no banco de dados:', error);
            return res.status(500).json({ mensagem: 'Erro interno no servidor.', status: 500 });
        }

        // 3. Verifica se o usuário foi encontrado
        if (results.length === 0) {
            // Se não encontrou, envia uma mensagem de erro genérica por segurança
            return res.status(401).json({ mensagem: 'Email ou senha incorretos.', status: 401 });
        }

        const usuario = results[0];
        const hashSalvo = usuario.senha;

        // 4. Compara a senha digitada com a senha criptografada (hash)
        bcrypt.compare(senha, hashSalvo, (err, resultadoComparacao) => {
            if (err) {
                console.error('Erro ao comparar senhas:', err);
                return res.status(500).json({ mensagem: 'Erro interno no servidor.', status: 500 });
            }

            // 5. Se as senhas baterem, o login é bem-sucedido
            if (resultadoComparacao) {
                // Aqui você pode criar um token de sessão, mas por enquanto, apenas logamos o sucesso
                console.log('Login bem-sucedido para o usuário:', usuario.email);
                
                // Retorna o sucesso e o tipo de usuário para o frontend
                return res.status(200).json({ 
                    mensagem: 'Login realizado com sucesso!', 
                    status: 200,
                    tipoUsuario: usuario.tipo
                });
            } else {
                // Se as senhas não baterem
                return res.status(401).json({ mensagem: 'Email ou senha incorretos.', status: 401 });
            }
        });
    });
});

// Rota de Recuperar Senha
app.post('/forgot-password', (req, res) => {
    const { email } = req.body;

    // 1. Encontra o usuário pelo e-mail
    const sqlSelectUser = 'SELECT id, email FROM usuarios WHERE email = ?';

    connection.query(sqlSelectUser, [email], (error, results) => {
        if (error || results.length === 0) {
            // Se o e-mail não for encontrado, envia uma mensagem genérica por segurança
            return res.status(404).json({ mensagem: 'Se o e-mail estiver cadastrado, você receberá um link.', status: 404 });
        }

        const user = results[0];
        const userId = user.id;

        // 2. Geração do Token de Segurança
        // Gera um token aleatório de 32 bytes (64 caracteres hexadecimais)
        const token = crypto.randomBytes(32).toString('hex');
        
        // 3. Define a Expiração (Exemplo: 1 hora a partir de agora)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); 

        // 4. Salva o Token no Banco de Dados
        const sqlInsertToken = `
            INSERT INTO tokens_redefinicao (user_id, token, expires_at) 
            VALUES (?, ?, ?)
        `;

        connection.query(sqlInsertToken, [userId, token, expiresAt], (err) => {
            if (err) {
                console.error('Erro ao salvar token no DB:', err);
                return res.status(500).json({ mensagem: 'Erro interno ao gerar token.', status: 500 });
            }

            // 5. Configuração e Envio do E-mail (Lógica Simplificada)
            const resetLink = `http://localhost:5500/reset-password.html?token=${token}`; 

           const transporter = nodemailer.createTransport({
                service: 'gmail', 
                auth: {
                    user: 'purrpose.univali@gmail.com', // Endereço do Gmail
                    pass: 'netj kxay rjss yczy'   // Senha 
                }
            });

            const mailOptions = {
                from: 'purrpose.univali@gmail.com',
                to: user.email,
                subject: 'Redefinição de Senha Purrpose',
                html: `<p>Você solicitou a redefinição de senha.</p>
                       <p>Clique neste link para continuar: <a href="${resetLink}">Redefinir Senha</a></p>
                       <p>O link expirará em 1 hora.</p>`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Erro ao enviar e-mail:', error);
                    return res.status(500).json({ mensagem: 'Erro ao enviar e-mail. Tente novamente.', status: 500 });
                }
                console.log('E-mail de redefinição enviado com sucesso para:', user.email);
                res.status(200).json({ mensagem: 'E-mail de recuperação enviado com sucesso!', status: 200 });
            });
        });
    });
});

// Rota para digitar nova senha
app.post('/reset-password', (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ mensagem: 'Token e nova senha são obrigatórios.', status: 400 });
    }
    
    // 1. Encontra e valida o token no banco de dados
    const sqlSelectToken = `
        SELECT user_id, expires_at, used 
        FROM tokens_redefinicao 
        WHERE token = ?
    `;

    connection.query(sqlSelectToken, [token], (error, results) => {
        if (error) {
            console.error('Erro de DB ao buscar token:', error);
            return res.status(500).json({ mensagem: 'Erro interno no servidor.', status: 500 });
        }

        // Token não existe
        if (results.length === 0) {
            return res.status(400).json({ mensagem: 'Token inválido ou expirado.', status: 400 });
        }

        const tokenData = results[0];

        // 2. Verifica se o token expirou
        if (new Date() > new Date(tokenData.expires_at)) {
            return res.status(400).json({ mensagem: 'Token expirado. Solicite uma nova redefinição.', status: 400 });
        }

        // 3. Verifica se o token já foi usado
        if (tokenData.used) {
            return res.status(400).json({ mensagem: 'Token já utilizado.', status: 400 });
        }

        const userId = tokenData.user_id;

        // 4. Gera o hash da nova senha
        const salt = bcrypt.genSaltSync(10);
        const newHash = bcrypt.hashSync(newPassword, salt);

        // 5. Atualiza a senha na tabela 'usuarios'
        const sqlUpdatePassword = 'UPDATE usuarios SET senha = ? WHERE id = ?';

        connection.query(sqlUpdatePassword, [newHash, userId], (err) => {
            if (err) {
                console.error('Erro ao atualizar senha:', err);
                return res.status(500).json({ mensagem: 'Erro ao salvar nova senha.', status: 500 });
            }

            // 6. Marca o token como usado na tabela 'tokens_redefinicao'
            const sqlMarkUsed = 'UPDATE tokens_redefinicao SET used = TRUE WHERE token = ?';
            
            connection.query(sqlMarkUsed, [token], (err) => {
                if (err) {
                    console.error('Erro ao marcar token como usado:', err);
                    // O erro de marcar como usado é interno, mas o sucesso deve ser retornado
                }

                console.log(`Senha atualizada para o usuário ID: ${userId}.`);
                res.status(200).json({ mensagem: 'Senha redefinida com sucesso!', status: 200 });
            });
        });
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});