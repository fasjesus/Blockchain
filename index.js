const express = require('express');
const { Web3 } = require('web3');
const session = require('express-session');
const moment = require('moment')

const fs = require('fs');
const path = require('path');
const { emit } = require('process');

const bodyParser = require('body-parser');


// Ruta al archivo JSON del contrato
const contractFilePath = path.join(__dirname, 'build', 'contracts', 'VirtualStore.json');

// Leer el archivo JSON
const contractJSON = fs.readFileSync(contractFilePath, 'utf-8');
const contractData = JSON.parse(contractJSON);

// Obtener ABI y dirección del contrato
const contractABI = contractData.abi;
const contractAddress = contractData.networks['5777'].address; // Reemplaza <network_id> con el ID de la red específica

// Conexión a Ganache local
const web3 = new Web3('http://127.0.0.1:7545');

const app = express();
const port = 3000;
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração da sessão
app.use(session({
    secret: 'secreta',
    id: 0,
    ethereumAddress: 0,
    user_name: '',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Para desenvolvimento; use true com HTTPS em produção
}));

app.use(express.static('public'));

// Rotas
// Rota principal chama index.ejs

var ssn;

let accounts = [];
getAccounts().then(() => {
    console.log(`Account owner: ${accounts[0]}`)
})

async function getAccounts() {
    accounts = await web3.eth.getAccounts();
}
// Rutas y lógica de la aplicación Express

const contract = new web3.eth.Contract(contractABI, contractAddress);
const gasLimit = 500000;


async function addProduct(nombre, type, price, quantityAvailable, status) {
    try {
        const accounts = await web3.eth.getAccounts();
        await contract.methods.addProduct(nombre, type, price, quantityAvailable, status).send({ from: accounts[0], gas: gasLimit });
    } catch (error) {
        console.error('Error al agregar producto:', error);
    }
}

async function updateUser(id, username, name, email, senha, age, ethereumAddress) {
    try {
        await contract.methods.updateUser(
            id, name, email, username, senha, age, ethereumAddress
        ).send({ from: accounts[0], gas: gasLimit });
        return
    } catch (error) {
        console.error('Error update user:', error);
    }
}
async function deleteUser(name, senha) {
    try {
        const user = await contract.methods.findUser(name, senha).send({ from: accounts[0], gas: gasLimit });
        await contract.methods.deleteUser(user.id).send({ from: accounts[0], gas: gasLimit });
        return;
    } catch (error) {
        console.error('Error delete user:', error);
    }
}
async function getAllProducts() {
    try {
        const products = await contract.methods.getAllProducts().call();

        const formattedProducts = products.map(product => ({
            id: product.id.toString(),
            name: product.name,
            type: product.category,
            price: product.price.toString(),
            quantityAvailable: product.quantityAvailable.toString(),
            status: product.status
        }));
        return formattedProducts
    } catch (error) {
        console.error('Error al obtener los productos:', error);
    }
}
async function getAllSales() {
    try {
        const sales = await contract.methods.getAllSales().call();
        const formattedSales = sales.map(sale => ({
            id: sale.id,
            productId: sale.productId,
            quantity: sale.quantity,
            price: sale.price,
            buyerAddress: sale.buyerAddress,
            startDate: sale.startDate,
            endDate: sale.endDate
        }));

        return formattedSales
    } catch (error) {
        console.error('Error al obtener los productos:', error);
    }
}
async function login(email, pass) {
    try {
        return await contract.methods.findUserByEmail(
            email,
            pass).call();

    } catch (error) {
        throw (`Error login user ${err}`)
    }

}
//name, email, username, senha, 0, etherAddress
async function registerUser(
    name,
    email,
    username,
    senha,
    age,
    ethereumAddress) {
    console.log(name,
        email,
        username,
        senha,
        age,
        ethereumAddress)
    if (!web3.utils.isAddress(ethereumAddress)) {
        throw new Error('Invalid Ethereum address');
    }
    try {
        await contract.methods.registerUser(name,
            email,
            username,
            senha,
            age,
            ethereumAddress).send({ from: accounts[0], gas: gasLimit });
        return;
    }
    catch (err) {
        throw (`Error register user ${err}`)
    }
}
async function recordSale(IdProduct, Preco, ethereumAddress, DataCheckIn, DataCheckOut) {
    try {
        console.log(IdProduct, Preco, ethereumAddress, DataCheckIn, DataCheckOut)
        await contract.methods.recordSale(IdProduct, 1, Preco, ethereumAddress, DataCheckIn, DataCheckOut).send({ from: accounts[0], gas: gasLimit });
        return;
    }
    catch (err) {
        throw (`Error register sale ${err}`)
    }
}
// Llamada de ejemplo para obtener y mostrar los productos
//nombre,type,price,quantityAvailable,status
//addProduct('Habitacion', 'Doble', 40, 3, 'Disponible');
//getAllProducts()

///////////////////////////////////////////PETICIONES////////////////////////////////////////////

///////////////////////////////////////////////GET////////////////////////////////////////////
app.get('/', (res) => {
    res.render('index'); // Renderiza a página index.ejs no navegador
});
app.get('/upRoom', (req, res) => {
    res.render('upRoom');
});
// Rota para a página de login
app.get('/login', (req, res) => {
    res.render('login.ejs'); // Renderiza a página login.ejs no navegador
});

// Rota para a página de opções
app.get('/options', (req, res) => {
    if (req.session.nome) {
        res.render('options.ejs', { user_name: req.session.nome }); // Renderiza a página options.ejs passando o nome do usuário
    } else {
        res.redirect('/loginPage');
    }
});
app.get('/products', (req, res) => {
    getAllProducts().then((products) => {
        res.send(products);
    });
});
app.get("/reserveList", (req, res) => {
    getAllProducts().then((products) => {
        res.render("reserveList", { quartos: products });
    });

});
app.get('/payment', (req, res) => {
    const { NumeroQuarto, TipoQuarto, Preco } = req.query;
    console.log('Dados passados para a view payment:', { NumeroQuarto, TipoQuarto, Preco });
    res.render('payment', { NumeroQuarto, TipoQuarto, Preco });
});
app.get("/update", (req, res) => {
    console.log(session.id)
    res.render("update", { session: session }); // Renderiza a página atualizar.ejs
});
app.get('/historic', (req, res) => {
    // Assumindo que o email vem da query string
    getAllSales().then((sales) => {
        console.log(sales)
        res.render('historic', { sales: sales });
    })
});
///////////////////////////////////////////////END GET////////////////////////////////////////////


///////////////////////////////////////////////POST////////////////////////////////////////////
app.post('/upRoom', (req, res) => {
    const { TipoQuarto, Preco, Status } = req.body; // Extrai os dados do formulário

    addProduct('Habitacion', TipoQuarto, parseInt(Preco, 10), 1, Status).then(() => {
        res.send('Product create')
    }).catch((err) => {
        res.send('Error product create: ' + err)
    });
});
app.post('/atualizarConta', (req, res) => {
    const {
        user_id,
        user_name,
        nome_completo,
        email,
        senha,
        idade,
        ethereumAddress,
    } = req.body; // Pega os dados inseridos na página atualizar.ejs

    updateUser(user_id,
        user_name,
        nome_completo,
        email,
        senha,
        idade,
        ethereumAddress).then(() => {
            res.send('User Update')
        }).catch((err) => {
            console.log('Error User Update: ' + err)
        });
});
app.post('/deletarconta', (req, res) => {
    const { user_name, senha } = req.body;
    const name = user_name;
    deleteUser(name, senha).then(() => {
        res.send('User Delete')
    }).catch((err) => {
        console.log('Error User Delete: ' + err)
    });
});
app.post('/cadastro', (req, res) => { //DONE
    console.log(req.body)
    const { nome_completo, user_name, email, senha, etherAddress } = req.body; // Esses dados vão vir do formulário que o usuário digitou

    const name = nome_completo
    const username = user_name
    registerUser(name, email, username, senha, 0, etherAddress).then(() => {
        res.send('User Register')
    }).catch((err) => {
        console.log(`Error register: ${err}`)
    })
});

app.post('/login', (req, res) => { //DONE
    const { email, senha } = req.body; // Traz do formulário o email e a senha do usuário
    login(email, senha).then((user) => {

        session.id = parseInt(user[0], 10)
        session.user_name = user[1]
        session.ethereumAddress = user[6]

        res.render('options.ejs', { user_name: session.user_name })
    }).catch((err) => {
        console.log(`User login error: ${err}`)
    })

});
app.post('/finalizar-reserva', (req, res) => {

    const { NumeroQuarto, Preco, DataCheckIn, DataCheckOut } = req.body;
    const startDateTimestamp = moment(DataCheckIn).unix();
    const endtDateTimestamp = moment(DataCheckOut).unix();

    recordSale(NumeroQuarto, Preco, '0x8464835a4a848eaf56A47C03E60A2C0A2AC9c3f2', startDateTimestamp, endtDateTimestamp).then(() => {
        res.send('Successfully achieved sale!')
    }).catch((err) => {
        console.log(`Sale error: ${err}`)
    })
});
///////////////////////////////////////////////END POST////////////////////////////////////////////

// Inicia el servidor
app.listen(port, () => {
    console.log(`App running on http://localhost:${port}`);
});