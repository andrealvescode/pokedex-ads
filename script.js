
const enderecoAPI = "https://pokeapi.co/api/v2/pokemon";

const listaPokemon = document.querySelector("#lista-pokemon");
const mensagem = document.querySelector("#mensagem");
const campoPesquisa = document.querySelector("#campo-pesquisa");
const botaoPesquisar = document.querySelector("#botao-pesquisar");
const botaoCarregar = document.querySelector("#botao-carregar");
const areaDetalhes = document.querySelector("#detalhes-pokemon");
const conteudoDetalhes = document.querySelector("#conteudo-detalhes");
const botaoFecharDetalhes = document.querySelector("#fechar-detalhes");

let proximaPagina = 0;
let carregando = false;
let modoPesquisa = false;

// Consulta dados na PokéAPI usando fetch
async function buscarPokemon(url) {
    const resposta = await fetch(url);

    if (!resposta.ok) {
        throw new Error("Não foi possível consultar a PokéAPI.");
    }

    return resposta.json();
}

// Obtém a imagem oficial ou usa uma imagem alternativa
function obterImagem(pokemon) {
    return (
        pokemon.sprites?.other?.["official-artwork"]?.front_default ||
        pokemon.sprites?.front_default ||
        ""
    );
}

// Traduz uma habilidade quando existe tradução em português
async function traduzirHabilidade(habilidade) {
    try {
        const dados = await buscarPokemon(habilidade.url);

        const traducao = dados.names?.find(item =>
            item.language.name === "pt" ||
            item.language.name === "pt-BR"
        );

        return traducao ? traducao.name : habilidade.name;
    } catch (erro) {
        console.warn(
            "Não foi possível traduzir a habilidade:",
            habilidade.name
        );

        return habilidade.name;
    }
}

// Cria os cards dinamicamente com createElement e appendChild
function criarCard(pokemon) {
    const card = document.createElement("article");
    card.classList.add("card-pokemon");

    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute(
        "aria-label",
        "Ver detalhes de " + pokemon.name
    );

    const imagem = document.createElement("img");
    imagem.src = obterImagem(pokemon);
    imagem.alt = "Pokémon " + pokemon.name;
    imagem.loading = "lazy";

    const numero = document.createElement("p");
    numero.classList.add("numero-pokemon");
    numero.textContent =
        "#" + String(pokemon.id).padStart(3, "0");

    const nome = document.createElement("h3");
    nome.textContent = pokemon.name;

    const medidas = document.createElement("p");
    medidas.classList.add("medidas-pokemon");
    medidas.textContent =
        `Altura: ${(pokemon.height / 10).toFixed(1)} m | ` +
        `Peso: ${(pokemon.weight / 10).toFixed(1)} kg`;

    const tipos = document.createElement("div");
    tipos.classList.add("tipos-pokemon");

    pokemon.types.forEach(item => {
        const tipo = document.createElement("span");

        tipo.classList.add("tipo-pokemon");
        tipo.classList.add("tipo-" + item.type.name);
        tipo.textContent = item.type.name;

        tipos.appendChild(tipo);
    });

    card.appendChild(imagem);
    card.appendChild(numero);
    card.appendChild(nome);
    card.appendChild(medidas);
    card.appendChild(tipos);

    // Abre os detalhes ao clicar no card
    card.addEventListener("click", () => {
        mostrarDetalhes(pokemon);
    });

    // Permite abrir o card usando Enter ou Espaço
    card.addEventListener("keydown", evento => {
        if (evento.key === "Enter" || evento.key === " ") {
            evento.preventDefault();
            mostrarDetalhes(pokemon);
        }
    });

    listaPokemon.appendChild(card);
}

// Exibe informações detalhadas do Pokémon selecionado
async function mostrarDetalhes(pokemon) {
    conteudoDetalhes.replaceChildren();

    const titulo = document.createElement("h3");
    titulo.textContent = pokemon.name;

    const imagem = document.createElement("img");
    imagem.classList.add("imagem-detalhes");
    imagem.src = obterImagem(pokemon);
    imagem.alt = "Imagem de " + pokemon.name;

    const numero = document.createElement("p");
    numero.textContent =
        "Número: #" + String(pokemon.id).padStart(3, "0");

    const experiencia = document.createElement("p");
    experiencia.textContent =
        "Experiência-base: " +
        (pokemon.base_experience ?? "Não disponível") +
        " pontos";

    const altura = document.createElement("p");
    altura.textContent =
        "Altura: " + (pokemon.height / 10).toFixed(1) + " m";

    const peso = document.createElement("p");
    peso.textContent =
        "Peso: " + (pokemon.weight / 10).toFixed(1) + " kg";

    const tituloTipos = document.createElement("p");
    tituloTipos.textContent = "Tipos:";

    const listaTipos = document.createElement("ul");

    pokemon.types.forEach(item => {
        const tipo = document.createElement("li");
        tipo.textContent = item.type.name;
        listaTipos.appendChild(tipo);
    });

    const tituloHabilidades = document.createElement("p");
    tituloHabilidades.textContent = "Habilidades:";

    const listaHabilidades = document.createElement("ul");

    // Exibe os nomes das habilidades enquanto busca traduções
    pokemon.abilities.forEach(item => {
        const habilidade = document.createElement("li");

        habilidade.textContent = item.ability.name;

        if (item.is_hidden) {
            habilidade.textContent += " (habilidade oculta)";
        }

        listaHabilidades.appendChild(habilidade);
    });

    conteudoDetalhes.appendChild(imagem);
    conteudoDetalhes.appendChild(titulo);
    conteudoDetalhes.appendChild(numero);
    conteudoDetalhes.appendChild(experiencia);
    conteudoDetalhes.appendChild(altura);
    conteudoDetalhes.appendChild(peso);
    conteudoDetalhes.appendChild(tituloTipos);
    conteudoDetalhes.appendChild(listaTipos);
    conteudoDetalhes.appendChild(tituloHabilidades);
    conteudoDetalhes.appendChild(listaHabilidades);

    areaDetalhes.hidden = false;

    areaDetalhes.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    // Consulta as traduções das habilidades
    const traducoes = await Promise.all(
        pokemon.abilities.map(item =>
            traduzirHabilidade(item.ability)
        )
    );

    // Atualiza a lista de habilidades com as traduções disponíveis
    pokemon.abilities.forEach((item, indice) => {
        const habilidade = listaHabilidades.children[indice];

        if (habilidade) {
            habilidade.textContent = traducoes[indice];

            if (item.is_hidden) {
                habilidade.textContent += " (habilidade oculta)";
            }
        }
    });
}

// Fecha a área de detalhes
function fecharDetalhes() {
    areaDetalhes.hidden = true;
    conteudoDetalhes.replaceChildren();
}

botaoFecharDetalhes.addEventListener("click", fecharDetalhes);

// Carrega 20 Pokémon por página
async function carregarPokemon() {
    if (carregando || modoPesquisa) {
        return;
    }

    carregando = true;
    botaoCarregar.disabled = true;
    mensagem.textContent = "Carregando Pokémon...";

    try {
        const dados = await buscarPokemon(
            `${enderecoAPI}?limit=20&offset=${proximaPagina}`
        );

        const detalhes = await Promise.all(
            dados.results.map(item => buscarPokemon(item.url))
        );

        detalhes.forEach(criarCard);

        proximaPagina += dados.results.length;

        botaoCarregar.hidden = !dados.next;
        mensagem.textContent = "";
    } catch (erro) {
        console.error("Erro ao carregar Pokémon:", erro);

        mensagem.textContent =
            "Não foi possível carregar os Pokémon. " +
            "Verifique sua conexão e tente novamente.";
    } finally {
        carregando = false;
        botaoCarregar.disabled = false;
    }
}

// Pesquisa Pokémon pelo nome ou número
async function pesquisarPokemon() {
    if (carregando) {
        return;
    }

    const termo = campoPesquisa.value.trim().toLowerCase();

    // Se a pesquisa estiver vazia, volta à galeria inicial
    if (!termo) {
        modoPesquisa = false;
        listaPokemon.replaceChildren();
        fecharDetalhes();

        proximaPagina = 0;
        botaoCarregar.hidden = true;

        await carregarPokemon();
        return;
    }

    modoPesquisa = true;
    botaoCarregar.hidden = true;

    listaPokemon.replaceChildren();
    fecharDetalhes();

    mensagem.textContent = "Pesquisando Pokémon...";

    try {
        const pokemon = await buscarPokemon(
            `${enderecoAPI}/${encodeURIComponent(termo)}`
        );

        criarCard(pokemon);
        mensagem.textContent = "";
    } catch (erro) {
        console.warn("Pesquisa não encontrada:", termo);

        mensagem.textContent =
            "Pokémon não encontrado. Confira o nome ou número digitado.";
    }
}

// Botão de pesquisa
botaoPesquisar.addEventListener("click", pesquisarPokemon);

// Permite pesquisar pressionando Enter
campoPesquisa.addEventListener("keydown", evento => {
    if (evento.key === "Enter") {
        pesquisarPokemon();
    }
});

// Ao apagar o texto da pesquisa, volta à galeria
campoPesquisa.addEventListener("input", () => {
    if (
        campoPesquisa.value.trim() === "" &&
        modoPesquisa &&
        !carregando
    ) {
        modoPesquisa = false;
        listaPokemon.replaceChildren();
        fecharDetalhes();

        proximaPagina = 0;
        botaoCarregar.hidden = true;

        carregarPokemon();
    }
});

// Botão para carregar mais Pokémon
botaoCarregar.addEventListener("click", carregarPokemon);

// Inicia a aplicação ao abrir a página
carregarPokemon();