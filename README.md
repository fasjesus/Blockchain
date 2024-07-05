# Aplicação Web 3.0 de um Hotel - Hotel HUB

Este projeto é uma aplicação Web 3.0 que permite aos usuários reservar quartos e realizar pagamentos utilizando ETH. O projeto é composto por um contrato inteligente em Solidity que gerencia as reservas e os pagamentos, e um servidor Node.js com Express que fornece a interface de usuário e interage com o contrato inteligente.

## Estrutura do Projeto

### build
- **VirtualStore.json**  Configuração de contrato inteligente Solidity
### contracts
- **VirtualStore.sol** Contrato inteligente em Solidity que gerencia os produtos (quartos), usuários, e vendas (reservas).
### migrations
- **1_deployed_contracts.js**: Script de migração para implantar o contrato inteligente.
### public - pasta de imagens
- **hotelHUB.jpeg**
### test - gitkeep
### views - telas da aplicação web
- **delete.js**
- **detailsRoom.js**
- **fullRoom.js**
- **index.js**
- **upRoom.js** 
- **login.js** 
- **options.js** 
- **products.js** 
- **reserveList.js** 
- **payment.js** 
- **update.js**
- **historic.js**

**index.js**: Servidor Node.js com Express que fornece a interface de usuário e interage com o contrato inteligente.

## Arquivo 1_deployed_contracts.js

Este arquivo contém o script de migração para implantar o contrato inteligente `VirtualStore` na blockchain.

```javascript
const VirtualStore = artifacts.require('VirtualStore');

module.exports = function (deployer) {
    deployer.deploy(VirtualStore);
};

const instance = VirtualStore.deployed();
console.log('Address: ');
```

## Arquivo VirtualStore.sol
Este arquivo contém o contrato inteligente VirtualStore escrito em Solidity. O contrato gerencia produtos (quartos), usuários e vendas (reservas).

## Arquivo index.js
Este arquivo contém o servidor Node.js com Express que fornece a interface de usuário e interage com o contrato inteligente `VirtualStore`.

#### Requisitos e Dependências
- node: https://nodejs.org/en
- ganache: https://archive.trufflesuite.com/ganache/
- JavaScript
- Solidty
- express
- web3
- express-session
- moment
- fs
- path
- body-parser

## Configuração da Sessão

```javascript
app.use(session({
    secret: 'secreta',
    id: 0,
    ethereumAddress: 0,
    user_name: '',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
```
## Arquivo configuração do truffle

Adicione a seguinte configuração no arquivo truffle-config.js:

```javascript
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 7545,        // Standard Ganache port (default: none)
      network_id: "*",   // Any network (default: none)
    }
  },
  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.0",  // Fetch exact version from solc-bin (default: truffle's version)
    },
  },
};
```

## Funções principais
- **addProduct:** Adiciona um novo produto (quarto) ao contrato inteligente.
-  **updateUser:** Atualiza as informações de um usuário no contrato inteligente.
-  **deletUser:** Deleta um usuário do contrato inteligente.
-  **getAllProducts:** Obtém todos os produtos (quartos) do contrato inteligente.
-  **getAllSales:** Obtém todas as venda (reservas).
-  **login:** Autentica um ususário no sistema.
-  **registerUser:** Registra um novo usuário.
-  **recordSale:** Registra uma nova venda (reserva) no sistema.

## Rotas da Aplicação
### GET
- **/** : Renderiza a página principal (`index.ejs`).
- **/upRoom:** Renderiza a página para adicionar um quarto.
- **/login:** Renderiza a página de login.
- **/options:** Renderiza a página de opções do usuário.
- **/products:** Retorna todos os produtos.
- **/reserveList:** Renderiza a lista de reservas.
- **/payment:** Renderiza a página de pagamento.
- **/update:** Renderiza a página de atualização de conta.
- **/historic:** Renderiza o histórico de vendas.

### POST
- **/upRoom:** Adiciona um novo quarto.
- **/atualizarConta:** Atualiza a conta do usuário.
- **/deletarconta:** Deleta a conta do usuário.
- **/cadastro:** Registra um novo usuário.
- **/login:** Realiza o login do usuário.
- **/finalizar-reserva:** Finaliza uma reserva.


### Comandos para execução

`npx truffle compile `
`npx truffle migrate --network development`
`node index.js`