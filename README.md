# 38 - Integrando o Mongo ao nosso backend com o Mongoose

Agora vamos fazer essa integração e ver como podemos fazer um CRUD usando o Mongoose para interagir com nosso banco de dados.

# Configurações iniciais

## Instalando requisitos

Vamos começar a criação do nosso projeto com o básica, na linha de comando:

```jsx
npm init -y
```

Agora importamos os pacotes que vamos usar, são eles:

- Express
- Mongoose
- EJS
- Method Override

Novamente no nosso console:

```jsx
npm i express mongoose ejs method-override
```

## Estrutura básica dos arquivos

Vamos colocar nossas views na pasta `view`, nosso modelo na pasta `models`, no final, a estrutura ficara assim:

- 📁models/
- 📁node_modules/
- 📁views/
- 📄index.js
- 📄package.json

## Importando os pacotes necessários

Para importar os pacotes necessários vamos usar o seguinte código:

```jsx
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
```

Para facilitar o uso do express, vamos fazer o seguinte:

```jsx
const app = express();
```

## Conectando ao nosso Banco de dados

Vamos usar esse código:

```jsx
mongoose
  .connect("mongodb://localhost:27017/farmStand", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Conexão aberta com o Mongo!");
  })
  .catch((err) => {
    console.log("A conexão com o Mongo falhou.");
    console.log(err);
  });
```

A porta padrão o Mongo é a 27017. “farmStand” é o nome do banco de dados ao qual estamos nos conectando.

## Definindo o caminho das nossas views

```jsx
app.set("views", path.join(__dirname, "views"));
```

Usamos o pacote `path` para que, independente de onde a gente execute o arquivo para iniciar o servidor, a gente não tenha problemas.

## Definindo a view engine

```jsx
app.set("view engine", "ejs");
```

## Configurando nosso middleware

```jsx
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
```

A primeira linha a gente usa para que possamos acessar o que esta vindo no `req.body`. A segunda estamos configurando o Method Override para que possamos usar as rotas numa configuração RESTful.

## Criando um array com as categorias

Vamos usar um array para definir as categorias para que, caso a gente crie uma categoria nova, vamos precisar apenas adicionar ela a esse array:

```html
const categories = ["fruit", "vegetable", "dairy"];
```

## Definindo a porta

**Isso fica no final do código**, vamos mandar o express esperar as requisições na porta 3000:

```jsx
app.listen(3000, () => {
  console.log("APP IS LISTENING ON PORT 3000");
});
```

# Criando nosso modelo

Nosso modelo vai ficar na pasta `models`:

- 📁models/
    - 📄product.js

Para criar um modelo, vamos fazer o seguinte:

1. Importar o mongoose: 
    
    ```jsx
    const mongoose = require("mongoose");
    ```
    
2. Criando o schema:
    
    ```jsx
    const productSchema = new mongoose.Schema({
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      category: {
        type: String,
        lowercase: true,
        enum: ["fruit", "vegetable", "dairy"],
      },
    });
    ```
    
3. Agora vamos pegar o schema e definir o modelo:
    
    ```jsx
    const Product = mongoose.model("Product", productSchema);
    ```
    
4. Por fim nós exportamos o modelo:
    
    ```jsx
    module.exports = Product;
    ```
    

## Importando o modelo

```jsx
const Product = require("./models/product");
```

# Rotas e CRUD

Para simplificar, no código das views, vamos colocar apenas o que esta dentro do `<body>`. Para o CRUD vamos usar uma estrutura de rotas RESTful.

## Rota principal

Primeira rota é a que exibe todos os produtos:

```jsx
app.get("/products", async (req, res) => {
  const products = await Product.find({});
  res.render("products/index", { products });
});
```

### View da rota principal

```html
<h1>All Products</h1>
<ul>
  <% for(let product of products) { %>
  <li><a href="/products/<%= product._id %>"><%= product.name %></a></li>
  <% } %>
</ul>
<a href="/products/new">Add Product</a>
```

Aqui a gente pega o array de produtos que pegamos do banco de dados, itera sobre ele, cada produto da lista é um link que leva para as informações detalhadas do mesmo. Por fim um link para adicionar um produto.

## Read - Lendo as informações de um produto

A rota será:

```jsx
app.get("/products/:id", async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  res.render("products/show", { product });
});
```

Vamos pegar o ID a partir dos parâmetros da requisição, fazer a query e enviar o resultado para a view `show.ejs`.

### View da rota de informações do produto

```html
<h1><%= product.name %></h1>
<ul>
  <li>Price: $<%= product.price %></li>
  <li>Category: <%= product.category %></li>
</ul>
<a href="/products">All Products</a>
<a href="/products/<%= product._id %>/edit">Edit Product</a>
<form action="/products/<%= product._id %>?_method=DELETE" method="POST">
  <button>Delete Product</button>
</form>
```

Temos o nome dentro do `<h1>`, e os dados dentro de um `<li>`. No fundo da página vamos ter um link para retornar a lista de produtos, um para editar e um para remover. O de remover a gente usou um botão para que possamos usar o Method Override e usar uma rota DELETE.

## Create - Cadastrando um produto novo

Aqui temos 2 rotas:

1. A view aonde o usuário cadastra os dados do novo produto: 
    
    ```jsx
    app.get("/products/new", (req, res) => {
      res.render("products/new", { categories });
    });
    ```
    
    Aqui nós vamos mandar as categorias para que na view elas apareçam na lista
    
2. A rota para salvar o novo produto: 
    
    ```jsx
    app.post("/products", async (req, res) => {
      const newProduct = new Product(req.body);
      await newProduct.save();
      res.redirect(`/products/${newProduct._id}`);
    });
    ```
    
    Usamos o método POST, pegamos o que veio na requisição, criamos um novo produto usando o modelo, salvamos no banco de dados e por fim a gente redireciona o usuário para a página de detalhes do produto criado.
    
    Importante destacar que a gente importou o que veio no corpo diretamente, não limpamos nada, nem verificamos se são valores válidos!! Nunca devemos fazer assim, mais pra frente teremos exemplos corretos de como proceder nessas situações
    
    ### View da rota de criação do produto
    
    ```html
    <h1>Add a Product</h1>
    <form action="/products" method="POST">
      <label for="name">Product Name</label
      ><input type="text" name="name" id="name" placeholder="Product name" />
      <label for="price">Price (Unit)</label>
      <input type="number" id="price" name="price" placeholder="Price" />
      <label for="category">Slect Category</label>
      <select name="category" id="category">
        <% for(let category of categories){ %>
        <option value="<%= category %>"><%= category %></option>
        <% } %>
      </select>
      <button>Submit</button>
      <a href="/products">All Products</a>
    </form>
    ```
    
    Aqui temos um formulário muito simples. As opções nós pegamos o array de categorias e iteramos sobre ele.
    
    ## Update - Atualizando um registro
    
    Novamente temos duas rotas, uma para a view e outra para o requisição HTML:
    
    1. View: 
        
        ```jsx
        app.get("/products/:id/edit", async (req, res) => {
          const { id } = req.params;
          const product = await Product.findById(id);
          res.render("products/edit", { product, categories });
        });
        ```
        
    2. Requisição: 
        
        ```jsx
        app.put("/products/:id", async (req, res) => {
          const { id } = req.params;
          const product = await Product.findByIdAndUpdate(id, req.body, {
            runValidators: true,
            new: true,
          });
          res.redirect(`/products/${product._id}`);
        });
        ```
        
        Vamos atualizar usando o método `findByIdAndUpdate` do mongoose. Nós rodamos a validação e, por padrão, ele vai retornar os dados do registro antigo, mas usamos essa opção `new: true`, para que ele retorne a versão já editada. Por último mandamos o usuário para a página de detalhes do produto
        
    
    ### View da rota de edição
    
    ```html
    <h1>Edit Product</h1>
    <form action="/products/<%= product._id %>?_method=PUT" method="POST">
      <label for="name">Product Name</label
      ><input
        type="text"
        name="name"
        id="name"
        placeholder="Product name"
        value="<%= product.name %>"
      />
      <label for="price">Price (Unit)</label>
      <input
        type="number"
        id="price"
        name="price"
        placeholder="Price"
        value="<%= product.price %>"
      />
      <label for="category">Slect Category</label>
      <select name="category" id="category">
        <% for(let category of categories){ %>
        <option 
            value="<%= category %>"
            <%= category === product.category ? 'selected' : "" %> >
            <%= category %>
        </option>
        <% } %>
      </select>
      <button>Submit</button>
      <a href="/products/<%= product.id %>">Cancel</a>
    </form>
    ```
    
    Aqui o código parece mais complexo, mas é apenas porque estamos carregando o registro dentro do formulário. A rota usamos o Method Override para que o formulário consiga enviar uma requisição do tipo PUT. Por fim temos um operador ternário para que a categoria do produto saia selecionada por padrão.
    
    ## Delete - Removendo um registro
    
    Para isso temos apenas uma rota:
    
    ```jsx
    app.delete("/products/:id", async (req, res) => {
      console.log("Chegou aqui");
      const { id } = req.params;
      const deletedProduct = await Product.findByIdAndDelete(id);
      res.redirect("/products");
    });
    ```
    
    Não temos view porque essa rota é invocada diretamente do botão de remover da página de tetalhes.
    
    # Semeando nosso banco de dados
    
    Um das coisas que aprendemos nessa unidade é que sempre que estamos trabalhando com um projeto desse tipo, é interessante ter um arquivo só para semear nosso banco de dados, dessa maneira, se tiver qualquer problema, nós só executamos esse código e temos um banco de dados limpo novamente:
    
    ```jsx
    const mongoose = require("mongoose");
    const Product = require("./models/product");
    
    mongoose
      .connect("mongodb://localhost:27017/farmStand", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("MONGO CONNECTION OPEN!!!");
      })
      .catch((err) => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!");
        console.log(err);
      });
    
    Product.deleteMany()
      .then((res) => {
        console.log(res);
      })
      .catch((e) => {
        console.log(e);
      });
    
    const seedProducts = [
      {
        name: "Fairy Eggplant",
        price: 1.0,
        category: "vegetable",
      },
      {
        name: "Organic Goddess Melon",
        price: 4.99,
        category: "fruit",
      },
      {
        name: "Organic Mini Seedless Watermelon",
        price: 3.99,
        category: "fruit",
      },
      {
        name: "Organic Celery",
        price: 1.5,
        category: "vegetable",
      },
      {
        name: "Chocolate Whole Milk",
        price: 2.69,
        category: "dairy",
      },
    ];
    
    Product.insertMany(seedProducts)
      .then((res) => {
        console.log(res);
      })
      .catch((e) => {
        console.log(e);
      });
    ```
    
    Aqui é um arquivo do zero, por isso a gente importa o mongoose e o modelo, a ideia é executar só isso e já semear o nosso BD. 
    
    Depois nós conectamos ao BD, removemos os registros existentes, criamos novos registros e salvamos eles.