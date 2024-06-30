/*
    Projeto de Banco de Dados feito por Brenda Castro da Silva e Flavia Alessandra de Jesus.

    Para iniciar o npm use este comando no terminal na pasta do seu projeto: npm init -y
    Para instalar as dependências necessárias use o comando no terminal na pasta em que seu projeto está: npm install express ejs mysql2 express-session body-parser
    Para executar esse código digite no terminal o comando: node app.js
    Para ver o resultado, vá no seu navegador e entre no link: http://localhost:3000
    Para finalizar clique em ctrl + c no terminal
*/

// Define configurações iniciais
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const session = require('express-session');
const app = express();
const port = 3000; // Porta que será usada

// Configura o banco de dados MySQL
const connection = mysql.createConnection({
    host: "localhost", // Nome do servidor
    user: "root", // Usuário do servidor
    password: "senia", // Senha do servidor
    database: "reserva_hotel", // Nome do banco de dados
});

// Avisa se a conexão foi bem-sucedida
connection.connect((err) => {
    if (err) {
        console.log("Erro ao conectar ao MySQL: " + err.stack); // Isso será impresso no console no caso de erro
        return;
    }
    console.log("Conectado ao MySQL com ID " + connection.threadId); // Isso será impresso no console no caso de sucesso
});

// Configura o express
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Configuração da sessão
app.use(session({
    secret: 'secreta', // Altere para uma chave secreta adequada
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Para desenvolvimento; use true com HTTPS em produção
}));

//INCLUIR PASTA PUBLIC o projeto
app.use(express.static('public'));

// Rotas
// Rota principal chama index.ejs
app.get('/', (req, res) => {
    res.render('index'); // Renderiza a página index.ejs no navegador
});

// Rota para a página de login
app.get("/loginPage", (req, res) => {
    res.render("login.ejs"); // Renderiza a página login.ejs no navegador
});

// Rota para a página de opções
app.get("/options", (req, res) => {
    if (req.session.nome) {
        res.render("options.ejs", { user_name: req.session.nome }); // Renderiza a página options.ejs passando o nome do usuário
    } else {
        res.redirect('/loginPage');
    }
});

// Rota para renderizar a página de lista de reservas
app.get("/reserveList", (req, res) => {
    const { status, tipo } = req.query;

    let query = "SELECT * FROM QUARTO";
    let queryParams = [];

    if (status || tipo) {
        query += " WHERE";
        if (status) {
            query += " Status = ?";
            queryParams.push(status);
        }
        if (status && tipo) {
            query += " AND";
        }
        if (tipo) {
            query += " TipoQuarto = ?";
            queryParams.push(tipo);
        }
    }

    connection.query(query, queryParams, (err, results) => {
        if (err) throw err;
        res.render("reserveList", { quartos: results });
    });
});

// Rota para renderizar a página atualizar.ejs
app.get("/update", (req, res) => {
    if (!req.session.email) {
        return res.redirect('/loginPage'); // Redireciona para login se não autenticado
    }
    res.render("update.ejs"); // Renderiza a página atualizar.ejs
});

// Rota para fazer a atualização dos dados do usuário
app.post("/atualizarConta", (req, res) => {
    const { nome_completo, user_name, senha, idade } = req.body; // Pega os dados inseridos na página atualizar.ejs

    // Faz o update dos dados
    connection.query(
        'UPDATE CLIENTE SET nome_completo = ?, senha = ?, idade = ? WHERE user_name = ?',
        [nome_completo, senha, idade, user_name],
        (err, results) => {
            if (err) throw err;
            res.render("login.ejs"); // Depois de atualizar os dados o usuário é redirecionado para a página de login
        }
    );
});

// Rota para renderizar a página de deletar conta
app.get("/delete", (req, res) => {
    if (!req.session.email) {
        return res.redirect('/loginPage'); // Redireciona para login se não autenticado
    }
    res.render("delete.ejs"); // Renderiza a página deletar.ejs
});

// Rota para deletar conta
app.post("/deletarconta", (req, res) => {
    const { user_name, senha } = req.body;

    // Verifica se a senha é realmente a senha do usuário
    connection.query(
        'DELETE FROM CLIENTE WHERE user_name = ? AND senha = ?',
        [user_name, senha],
        (err, result) => {
            if (err) throw err;

            if (result.affectedRows > 0) {
                res.redirect('/'); // Redireciona para a página inicial após a exclusão
            } else {
                res.send('Credenciais inválidas ou a conta não foi encontrada.'); // Envia um aviso se algum dado está inválido
            }
        }
    );
});

// Rota para a página de cadastro
app.post('/cadastro', (req, res) => {
    const { nome_completo, email, senha, cpf } = req.body; // Esses dados vão vir do formulário que o usuário digitou

    connection.query('SELECT * FROM CLIENTE WHERE email = ? OR cpf = ?', [email, cpf], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Erro ao verificar usuário. Por favor, tente novamente.');
            return;
        }

        if (results.length > 0) {
            res.send('Email ou CPF já cadastrado. Por favor, escolha outro.');
        } else {
            const usuario = { nome_completo, email, senha, cpf };

            connection.query('INSERT INTO CLIENTE SET ?', usuario, (err, results) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Erro ao cadastrar usuário. Por favor, tente novamente.');
                    return;
                }
                res.redirect('/loginPage');
            });
        }
    });
});

// Rota para a página de fazer login
app.post('/login', (req, res) => {
    const { email, senha } = req.body; // Traz do formulário o email e a senha do usuário

    // Comando select para saber se as informações que o usuário digitou estão no banco de dados
    connection.query(
        'SELECT * FROM CLIENTE WHERE email = ? AND senha = ?',
        [email, senha],
        (err, results) => {
            if (err) throw err;

            // Se estiver certo será redirecionado para a página de opções
            if (results.length > 0) {
                req.session.email = email; // Armazenar o e-mail do cliente na sessão
                req.session.nome = results[0].nome_completo; // Opcional: armazenar o nome completo
                res.redirect('/options');
            } else {
                res.send('Credenciais inválidas!');
            }
        }
    );
});

// Rota para a página de cadastrar quarto
app.get('/upRoom', (req, res) => {
    if (!req.session.email) {
        return res.redirect('/loginPage'); // Redireciona para login se não autenticado
    }
    res.render('upRoom');
});

// Rota para tratar os dados do formulário de cadastro de quarto
app.post('/upRoom', (req, res) => {
    const { NumeroQuarto, TipoQuarto, Preco, Status } = req.body; // Extrai os dados do formulário

    // Define o objeto quarto com os dados do formulário
    const quarto = { NumeroQuarto, TipoQuarto, Preco, Status };

    // Insere os dados do quarto no banco de dados
    connection.query('INSERT INTO QUARTO SET ?', quarto, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Erro ao cadastrar quarto. Por favor, tente novamente.');
            return;
        }
        res.redirect('/options'); // Redireciona para a página de opções após o cadastro bem-sucedido
    });
});

// Rota para a página de pagamento
app.get('/payment', (req, res) => {
    const { numeroQuarto, TipoQuarto, Preco } = req.query;
    console.log('Dados passados para a view payment:', { numeroQuarto, TipoQuarto, Preco });
    res.render('payment', { numeroQuarto, TipoQuarto, Preco });
});

// Rota para finalizar a reserva
app.post('/finalizar-reserva', (req, res) => {
    // Dados do formulário
    const { NumeroQuarto, TipoQuarto, Preco, DataCheckIn, DataCheckOut, metodoPagamento } = req.body;

    // Passo 1: Obter o ID do quarto
    connection.query(
        'SELECT Id_quarto FROM QUARTO WHERE NumeroQuarto = ? AND TipoQuarto = ? AND Status = "Disponível"',
        [NumeroQuarto, TipoQuarto],
        (err, results) => {
            if (err) {
                console.error('Erro ao obter ID do quarto:', err);
                res.status(500).send('Erro ao finalizar a reserva');
                return;
            }

            if (results.length === 0) {
                // Nenhum quarto disponível encontrado
                res.status(400).send('Quarto não disponível');
                return;
            }

            const idQuarto = results[0].Id_quarto;

            // Passo 2: Atualizar o status do quarto para 'Ocupado'
            connection.query(
                'UPDATE QUARTO SET Status = ? WHERE Id_quarto = ?',
                ['Ocupado', idQuarto],
                (err2) => {
                    if (err2) {
                        console.error('Erro ao atualizar o status do quarto:', err2);
                        res.status(500).send('Erro ao atualizar o status do quarto');
                        return;
                    }

                    // Passo 3: Inserir dados na tabela 'reserva'
                    connection.query(
                        'INSERT INTO RESERVA (FK_Id_quarto, DataCheckIn, DataCheckOut, FK_Email, MetodoPagamento) VALUES (?, ?, ?, ?, ?)',
                        [idQuarto, DataCheckIn, DataCheckOut, req.session.email, metodoPagamento],
                        (err3) => {
                            if (err3) {
                                console.error('Erro ao inserir reserva:', err3);
                                res.status(500).send('Erro ao finalizar a reserva');
                                return;
                            }

                            // Sucesso na inserção
                            res.status(200).send('Reserva finalizada com sucesso');
                        }
                    );
                }
            );
        }
    );
});



// Rota para a página de histórico de reservas
app.get('/historic', (req, res) => {
    const clienteEmail = req.query.email; // Assumindo que o email vem da query string

    // Conexão com Banco de Dados
    // Faz o select das reservas que o cliente fez
    connection.query(`SELECT quarto.NumeroQuarto, quarto.TipoQuarto, quarto.Preco, reserva.DataCheckIn, reserva.DataCheckOut
                      FROM quarto
                      JOIN reserva ON quarto.Id_quarto = reserva.FK_Id_quarto
                      JOIN cliente ON cliente.email = reserva.FK_Email
                      WHERE cliente.email = ?`, [clienteEmail], (err2, reservas) => {
        if (err2) {
            console.error('Não contem reservas feitas:', err2);
            res.status(500).send('Não existem reservas para serem exibidas');
            return;
        }
        
        // Calcular o total gasto
        const totalGasto = reservas.reduce((sum, reserva) => sum + parseFloat(reserva.Preco), 0);

        res.render('historic', { reservas, totalGasto }); // Passa o totalGasto para a view
    });
});


// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
