//função pra limpar os erros até serem corrigidos
function limpa_erros_cliente() {
    const errors = document.getElementsByClassName("error");

    for (const e of errors) {
        e.style.display = "none";
    }
}

//função pra exibir erros com base no span definido no HTML
function exibe_erros_cliente(id, msg) {
    const error = document.getElementById(id);
    error.innerHTML = msg;
    error.style.display = "inline";
}

//função pra calcular a data de nascimento a ser usada na validação
function calculaDn(dn) {
    const today = new Date();
    
    let age = today.getFullYear() - dn.getFullYear();

    if (age == 0)
      return 0;
      
    const dtAniv = new Date(today.getFullYear(), dn.getMonth(), dn.getDate());

    if (dtAniv.valueOf() > today.valueOf())
      age--;
      
    return age;
}

function validaCpf(cpf) {
    cpf = cpf.replace(/[^\d]+/g, ''); // tira tudo oq nao for numero
    if (cpf.length !== 11) return false;
    if (/^(\d)\1*$/.test(cpf)) return false; // verifica na string toda se o cpf não é composto de somente um numero ex: 1111111111

    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = soma % 11;
    let primeiroDigito = (resto < 2) ? 0 : 11 - resto;
    if (parseInt(cpf.charAt(9)) !== primeiroDigito) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = soma % 11;
    let segundoDigito = (resto < 2) ? 0 : 11 - resto;
    if (parseInt(cpf.charAt(10)) !== segundoDigito) return false;

    return true
}

function formataCpf(cpf){
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length === 11) {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cpf;
}

//função pra validar os campos do formulário
function valida_formulario_cliente() {
    let valid = true;

    //Validação do nome
    const nome = document.data.nome.value.trim();
    if (nome.length < 4 || nome.length > 80) {
        exibe_erros_cliente("erroNome", "Nome deve ter de 4 a 80 caracteres!");
        valid = false;
    }

    //Validação da data de nascimento
    
    let data = document.getElementById('dn').value.trim();

    if (data === "") {
        exibe_erros_cliente("erroDn", "Data inválida!");
        valid = false;
    } else {
        let dtNasc = data.split("-");
        if (dtNasc.length === 3) {
            dtNasc = new Date(dtNasc[0], dtNasc[1] - 1, dtNasc[2]);
            const hoje = new Date();
            let age = hoje.getFullYear() - dtNasc.getFullYear();
            const mes = hoje.getMonth() - dtNasc.getMonth();
            const dia = hoje.getDate() - dtNasc.getDate();

        // Ajusta a idade se o mês atual for antes do mês de nascimento
            if (mes < 0 || (mes === 0 && dia < 0)) {
                age--;
            }

            if (age < 18) {
                exibe_erros_cliente("erroDn", `Cliente tem ${age} anos. Deve ter pelo menos 18 anos!`);
                valid = false;
            }
        } else {
            exibe_erros_cliente("erroDn", "Data inválida!");
            valid = false;
        }
    }

    //Validção de CPF
    let cpf = document.data.cpf.value.trim();
    if (!validaCpf(cpf)) {
        exibe_erros_cliente("erroCpf", "CPF inválido!");
        valid = false;
    } else {
        let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        if (clientes.some(cliente => cliente.cpf === cpf)) {
            exibe_erros_cliente("erroCpf", "CPF já cadastrado!");
            valid = false;
        }
    }
    return valid;
}

function formataData(data) {
    const partes = data.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

//Função para criar a lista de clientes dinamicamente
function renderClientes(clientes){
    let tbody = document.getElementById('tbodyClientes');
    tbody.innerHTML = '';
    clientes.forEach(cliente => {
        const temLocacaoAtiva = clienteTemLocacaoAtiva(cliente.cpf);
        let tr = document.createElement('tr');
        tr.innerHTML = `
                <td>${formataCpf(cliente.cpf)}</td>
                <td>${cliente.nome}</td>
                <td>${formataData(cliente.dn)}</td>
                <td class="actions">
                <button id="excluir_${cliente.cpf}" data-cpf="${cliente.cpf}"
                    ${temLocacaoAtiva ? 'disabled style="background-color: gray;"' : ''}
                    onclick="excluirCliente('${cliente.cpf}')">Excluir
                </button>
                <button id="alugar_${cliente.cpf}" data-cpf="${cliente.cpf}"
                    ${temLocacaoAtiva ? 'disabled style="background-color: gray;"' : ''}
                    onclick="mostrarFormularioAluguel('${cliente.cpf}')">Alugar
                </button>
            </td>
            </td>
            `;
        tbody.appendChild(tr);
    })
}

function excluirCliente(cpf) {
    if (window.confirm(`Deseja realmente excluir o cliente com CPF ${formataCpf(cpf)}?`)) {
        let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        clientes = clientes.filter(cliente => cliente.cpf !== cpf);
        localStorage.setItem('clientes', JSON.stringify(clientes));
        renderClientes(clientes);
        alert("Cliente excluído com sucesso")
    }
}

//função pra realizar o salvamento do que foi colocado no formulário, depois de validado
function save_cliente(ev) {
    // Cancela o comportamento padrão para não submeter automaticamente o form
    ev.preventDefault();

    limpa_erros_cliente();

    if (valida_formulario_cliente()) {
        let apoio = document.getElementById("externa_cadastro_cliente");
        let cpf = document.getElementById('cpf').value;
        let nome = document.getElementById('nome').value;
        let dn = document.getElementById('dn').value;

        let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        clientes.push({cpf,nome,dn});
        localStorage.setItem('clientes', JSON.stringify(clientes));

        document.data.reset();
        renderClientes(clientes)

        apoio.style.display = 'none';
        document.getElementById('externa_consulta_cliente').style.display = 'block';
    }
}

function sortByCpf() {
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    clientes.sort((a, b) => a.cpf.localeCompare(b.cpf));
    localStorage.setItem('clientes', JSON.stringify(clientes));
    renderClientes(clientes);
}

function sortByNome() {
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    clientes.sort((a, b) => a.nome.localeCompare(b.nome));
    localStorage.setItem('clientes', JSON.stringify(clientes));
    renderClientes(clientes);
}

function limpa_erros_veiculo() {
    const errors = document.getElementsByClassName("error");

    for (const e of errors) {
        e.style.display = "none";
    }
}

//função pra exibir erros com base no span definido no HTML
function exibe_erros_veiculo(id, msg) {
    const error = document.getElementById(id);
    error.innerHTML = msg;
    error.style.display = "inline";
}

function validaPlaca(placa) {
    const regex = /^[A-Z]{3}\d{4}$/i;
    return regex.test(placa);
}

function formatarPlaca(placa) {
    return placa.replace(/([A-Z]{3})(\d{4})/, '$1-$2');
}

function formatarDiaria(diaria) {
    return parseFloat(diaria).toFixed(2).replace('.', ',');
}

//função pra validar os campos do formulário
function valida_formulario_veiculo() {
    let valid = true;

    //Validação do Modelo
    const modelo = document.data2.modelo.value.trim();
    if (modelo.length < 4 || modelo.length > 80) {
        exibe_erros_veiculo("erroModelo", "Modelo Inválido! Modelo deve ter de 4 a 30 caracteres.");
        valid = false;
    }

    const tipo = document.data2.ec.value;
    if (!tipo) {
        exibe_erros_cliente("erroEC", "Selecione o tipo!");
        valid = false;
    }

    //Validação do ano
    const ano = document.data2.ano.value;
    if (ano <= 1999 || ano > 2024) {
        exibe_erros_veiculo("erroAno", "Ano Inválido! Ano deve ser maior que 1999 ou igual ao ano atual.");
        valid = false;
    }

    //Validação Diária
    const diaria = document.data2.diaria.value;
    if (diaria <= 0) {
        exibe_erros_veiculo("erroDiaria", "Valor da Diária Inválido! Valor deve ser maior que zero.");
        valid = false;
    }

    //Validação KM
    const km = document.data2.km.value;
    if (km <= 0) {
        exibe_erros_veiculo("erroKm", "Quilometragem Inválida! Valor deve ser maior que zero.");
        valid = false;
    }

    const placa = document.data2.placa.value.trim();
    if (!validaPlaca(placa)) {
        exibe_erros_veiculo("erroPlaca", "Placa inválida! Deve estar no formato AAA9999.");
        valid = false;
    } else {
        let veiculos = JSON.parse(localStorage.getItem('veiculos')) || [];
        if (veiculos.some(veiculo => veiculo.placa === placa)) {
            exibe_erros_veiculo("erroPlaca", "Placa já cadastrada!");
            valid = false;
        }
    }

    return valid;
}

function save_veiculo(ev) {
    ev.preventDefault();
    limpa_erros_veiculo();

    if (valida_formulario_veiculo()) {
        let apoio = document.getElementById("externa_cadastro_veiculos");
        let placa = document.getElementById('placa').value.trim();
        let tipo = document.querySelector('input[name="ec"]:checked').value;
        let modelo = document.getElementById('modelo').value.trim();
        let ano = document.getElementById('ano').value.trim();
        let diaria = document.getElementById('diaria').value.trim();
        let km = document.getElementById('km').value.trim();

        let veiculos = JSON.parse(localStorage.getItem('veiculos')) || [];
        veiculos.push({placa, tipo: String(tipo), modelo, ano, diaria, km});
        localStorage.setItem('veiculos', JSON.stringify(veiculos));

        document.data.reset();
        renderVeiculos(veiculos);

        apoio.style.display = 'none';
        document.getElementById('externa_consulta_veiculos').style.display = 'block';
    }
}

function renderVeiculos(veiculos) {
    let tbody = document.getElementById('tbodyVeiculos');
    tbody.innerHTML = '';

    const tipoVeiculoMap = {
        's': 'Carro',
        'c': 'Moto'
    };

    veiculos.forEach(veiculo => {
        let tr = document.createElement('tr');
        let temLocacao = veiculoTemLocacaoAtiva(veiculo.placa);
        tr.innerHTML = `
                <td>${formatarPlaca(veiculo.placa)}</td>
                <td>${tipoVeiculoMap[veiculo.tipo]}</td>
                <td>${veiculo.modelo}</td>
                <td>${veiculo.ano}</td>
                <td>${formatarDiaria(veiculo.diaria)}</td>
                <td>${veiculo.km}</td>
                <td class="actions">
                <button ${temLocacao ? 'disabled' : ''} style="${temLocacao ? 'background-color: gray;' : ''}" onclick="editarVeiculo('${veiculo.placa}')">Editar</button>
                <button ${temLocacao ? 'disabled' : ''} style="${temLocacao ? 'background-color: gray;' : ''}" onclick="excluirVeiculo('${veiculo.placa}')">Excluir</button>
                </td>
            `;
        tbody.appendChild(tr);
    });
}


function excluirVeiculo(placa) {
    if (window.confirm(`Deseja realmente excluir o veículo com placa ${formatarPlaca(placa)}?`)) {
        let veiculos = JSON.parse(localStorage.getItem('veiculos')) || [];
        veiculos = veiculos.filter(veiculo => veiculo.placa !== placa);
        localStorage.setItem('veiculos', JSON.stringify(veiculos));
        renderVeiculos(veiculos);
        alert("Veículo excluído com sucesso");
    }
}

function editarVeiculo(placa) {
    let veiculos = JSON.parse(localStorage.getItem('veiculos')) || [];
    let veiculo = veiculos.find(v => v.placa === placa);
    
    if (veiculo) {
        document.getElementById('placa').value = veiculo.placa;
        let tipoRadio = document.querySelector(`input[name="ec"][value="${veiculo.tipo}"]`);
        if (tipoRadio) {
            tipoRadio.checked = true;
        }
        document.getElementById('modelo').value = veiculo.modelo;
        document.getElementById('ano').value = veiculo.ano;
        document.getElementById('diaria').value = veiculo.diaria;
        document.getElementById('km').value = veiculo.km;

        document.getElementById('placa').disabled = true;
        document.querySelectorAll('input[name="ec"]').forEach(radio => radio.disabled = true);
        document.getElementById('modelo').disabled = true;
        document.getElementById('ano').disabled = true;
        document.getElementById('km').disabled = true;
        document.getElementById('diaria').disabled = false;
        
        let apoio = document.getElementById("externa_cadastro_veiculos");
        apoio.style.display = 'block';
        document.getElementById('externa_consulta_veiculos').style.display = 'none';

        setTimeout(() => document.getElementById('diaria').focus(), 100);

        document.getElementById("save_veiculo").onclick = function(ev) {
            ev.preventDefault();
            limpa_erros_veiculo();
            
            let diaria = parseFloat(document.getElementById('diaria').value);
            if (isNaN(diaria) || diaria <= 0) {
                exibe_erros_veiculo("erroDiaria", "Valor da diária inválido! Deve ser maior que zero.");
                return;
            }
            
            veiculo.diaria = diaria;
            localStorage.setItem('veiculos', JSON.stringify(veiculos));
            renderVeiculos(veiculos);
            
            apoio.style.display = 'none';
            document.getElementById('externa_consulta_veiculos').style.display = 'block';
        };
    }
}

function mostrarFormularioAluguel(cpfCliente) {
    let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    let veiculos = JSON.parse(localStorage.getItem('veiculos')) || [];
    
    // Encontrar cliente pelo CPF
    let cliente = clientes.find(c => c.cpf === cpfCliente);
    if (!cliente) {
        alert("Cliente não encontrado!");
        return;
    }

    // Preencher informações do cliente
    document.getElementById('cpf_cliente').value = cliente.cpf;
    document.getElementById('nome_cliente').value = cliente.nome;
    
    const listaVeiculosDiv = document.getElementById('lista_veiculos');
    listaVeiculosDiv.innerHTML = '';

    const tipoVeiculoMap = {
        's': 'Carro',
        'c': 'Moto'
    };

    veiculos.forEach(veiculo => {
        if (!veiculo.alugado) {
            let veiculoTr = document.createElement('tr');

            veiculoTr.innerHTML = `
                <input type="radio" name="veiculo" value="${veiculo.placa}">
                <td>${formatarPlaca(veiculo.placa)}</td>
                <td>${tipoVeiculoMap[veiculo.tipo]}</td>
                <td>${veiculo.modelo}</td>
                <td>${formatarDiaria(veiculo.diaria)}</td>
                <td>${veiculo.km}</td>
            `;
            listaVeiculosDiv.appendChild(veiculoTr);
        }
    });

    // Exibir o formulário
    document.getElementById('alugar_veiculo').style.display = 'block';
    document.getElementById('externa_consulta_cliente').style.display = 'none';
    document.getElementById("externa_cadastro_veiculos").style.display = 'none';
    document.getElementById("externa_consulta_veiculos").style.display = 'none';
    document.getElementById('externa_cadastro_cliente').style.display = 'none';
}

function removerDuplicatasLocacoes() {
    let locacoes = JSON.parse(localStorage.getItem('locacoes')) || [];
    let locacoesUnicas = [];
    let locacoesMap = new Map();

    locacoes.forEach(locacao => {
        const chave = `${locacao.cpfCliente}_${locacao.placaVeiculo}`;
        if (!locacoesMap.has(chave)) {
            locacoesMap.set(chave, true);
            locacoesUnicas.push(locacao);
        }
    });

    localStorage.setItem('locacoes', JSON.stringify(locacoesUnicas));
}

// Função para processar o aluguel do veículo
function alugarVeiculo() {
    let cpfCliente = document.getElementById('cpf_cliente').value;
    let veiculoSelecionado = document.querySelector('input[name="veiculo"]:checked');
    let veiculos = JSON.parse(localStorage.getItem('veiculos')) || [];
    let locacoes = JSON.parse(localStorage.getItem('locacoes')) || [];
    let clientes = JSON.parse(localStorage.getItem('clientes')) || [];

    if (!veiculoSelecionado) {
        document.getElementById('erro_veiculo').textContent = 'Você deve selecionar um veículo.';
        return false;  // Impede o envio do formulário
    }

    let placaVeiculo = veiculoSelecionado.value;
    let veiculo = veiculos.find(v => v.placa === placaVeiculo);

    if (veiculo) {
        
        if (veiculo.alugado) {
            document.getElementById('erro_veiculo').textContent = 'Veículo já está alugado.';
            return false;  // Impede o envio do formulário
        }

        // Verifica se o cliente já tem uma locação ativa
        if (locacoes.some(l => l.cpfCliente === cpfCliente && l.placaVeiculo === placaVeiculo)) {
            document.getElementById('erro_veiculo').textContent = 'Este veículo já está alugado por este cliente.';
            return false;  // Impede o envio do formulário
        }

        veiculo.alugado = true;
        localStorage.setItem('veiculos', JSON.stringify(veiculos));

        // Adiciona a locação à lista de locações
        let dataAluguel = new Date().toLocaleDateString();
        locacoes.push({ cpfCliente, placaVeiculo, dataAluguel });
        localStorage.setItem('locacoes', JSON.stringify(locacoes));
        removerDuplicatasLocacoes();

        // Atualiza a lista de veículos
        atualizarListaVeiculos();

        // Atualiza a lista de locações
        renderListaLocacoes();

        // Atualiza a lista de clientes e desabilita botões para clientes com locação ativa
        clientes.forEach(cliente => {
            if (cliente.cpf === cpfCliente) {
                cliente.locacaoAtiva = true;
            }
        });
        localStorage.setItem('clientes', JSON.stringify(clientes));
        
        alert(`Veículo ${formatarPlaca(placaVeiculo)} alugado com sucesso para o cliente ${cpfCliente}!`);
        
        // Oculta o formulário de aluguel
        document.getElementById('alugar_veiculo').style.display = 'none';
        document.getElementById('consultar_locacoes').style.display = 'block';
        return false;  // Impede o envio do formulário
    } else {
        document.getElementById('erro_veiculo').textContent = 'Veículo selecionado não disponível.';
        return false;  // Impede o envio do formulário
    }
}

function clienteTemLocacaoAtiva(cpfCliente) {
    let locacoes = JSON.parse(localStorage.getItem('locacoes')) || [];
    return locacoes.some(locacao => locacao.cpfCliente === cpfCliente);
}

function veiculoTemLocacaoAtiva(placa){
    let locacoes = JSON.parse(localStorage.getItem('locacoes')) || [];
    return locacoes.some(locacao => locacao.placaVeiculo === placa);
}


function atualizarListaVeiculos() {
    let veiculos = JSON.parse(localStorage.getItem('veiculos')) || [];
    const listaDiv = document.getElementById('lista_veiculos');
    listaDiv.innerHTML = ''; 

    veiculos.forEach(veiculo => {
        if (!veiculo.alugado) {  
            const novaLinha = document.createElement('tr');

            novaLinha.innerHTML = `
                <td><input type="radio" name="veiculo_selecionado" value="${veiculo.placa}"></td>
                <td>${veiculo.placa}</td>
                <td>${veiculo.tipo}</td>
                <td>${veiculo.modelo}</td>
                <td>${veiculo.quilometragem}</td>
                <td>${veiculo.diaria}</td>
            `;
            
            listaDiv.appendChild(novaLinha);
        }
    });
}

function renderListaLocacoes() {
    let locacoes = JSON.parse(localStorage.getItem('locacoes')) || [];
    const listaLocacoesDiv = document.getElementById('tabela_locacoes').getElementsByTagName('tbody')[0];
    listaLocacoesDiv.innerHTML = '';

    locacoes.forEach(locacao => {
        let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        let veiculos = JSON.parse(localStorage.getItem('veiculos')) || [];

        let cliente = clientes.find(c => c.cpf === locacao.cpfCliente);
        let veiculo = veiculos.find(v => v.placa === locacao.placaVeiculo);

        if (cliente && veiculo) {
            const locacaoHtml = `
                <tr>
                    <td>${formataCpf(cliente.cpf)}</td>
                    <td>${cliente.nome}</td>
                    <td>${formatarPlaca(veiculo.placa)}</td>
                    <td>${veiculo.modelo}</td>
                    <td>R$ ${veiculo.diaria}</td>
                    <td>${locacao.dataAluguel}</td>
                    <td>
                        <button onclick="prepararDevolucao({ cpf: '${cliente.cpf}', nome: '${cliente.nome}', placa: '${veiculo.placa}', modelo: '${veiculo.modelo}', diaria: ${veiculo.diaria} })">Devolver</button>
                    </td>
                </tr>
            `;
            listaLocacoesDiv.innerHTML += locacaoHtml;
        }
    });
}


function prepararDevolucao(locacao) {
    if (!locacao) {
        alert("Locação não encontrada.");
        return;
    }

    
    document.getElementById('cpf_cliente_dev').value = locacao.cpf;
    document.getElementById('nome_cliente_dev').value = locacao.nome; 
    document.getElementById('placa_veiculo').value = locacao.placa;
    document.getElementById('modelo_veiculo').value = locacao.modelo; 
    document.getElementById('diaria_veiculo').value = locacao.diaria; 

    showSection('devolver_veiculo');
}


function devolverVeiculo() {
    const kmAtual = parseInt(document.getElementById('km_atual').value.trim());
    const placa = document.getElementById('placa_veiculo').value;

    // Recuperar dados do localStorage
    const veiculosData = JSON.parse(localStorage.getItem('veiculos')) || [];
    const locacoes = JSON.parse(localStorage.getItem('locacoes')) || [];

    console.log("Placa do veículo a ser devolvido:", placa);
    console.log("Locações armazenadas:", locacoes);

    // Encontrar o veículo a ser devolvido
    const veiculo = veiculosData.find(v => v.placa === placa);
    if (!veiculo) {
        alert("Veículo não encontrado.");
        return false;
    }

    // Verificar a quilometragem
    if (kmAtual <= parseInt(veiculo.km)) {
        alert("A quilometragem atual deve ser maior que a quilometragem do veículo.");
        return false;
    }

    // Atualizar dados do veículo
    veiculo.km = kmAtual;
    veiculo.alugado = false;

    // Encontrar e remover a locação correspondente
    const indexLocacao = locacoes.findIndex(l => l.placaVeiculo === placa);
    if (indexLocacao !== -1) {
        locacoes.splice(indexLocacao, 1);
    } else {
        alert("Locação não encontrada.");
        return false;
    }

    // Atualizar dados no localStorage
    localStorage.setItem('veiculos', JSON.stringify(veiculosData));
    localStorage.setItem('locacoes', JSON.stringify(locacoes));

    // Atualizar a lista de locações exibida
    renderListaLocacoes();

    alert("Devolução realizada com sucesso!");

    // Voltar para a seção inicial ou ocultar o formulário de devolução
    document.getElementById('devolver_veiculo').style.display = 'none';

    return true;
}


function showSection(sectionId) {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = 'block';
    }
}


function init() {
    document.getElementById("save_cliente").addEventListener("click", save_cliente);
    document.getElementById("save_veiculo").addEventListener("click", save_veiculo);


    document.getElementById('incluir_cliente').addEventListener("click", function(){
    let apoio = document.getElementById("externa_cadastro_cliente");

    apoio.style.display = 'block';
    document.getElementById('externa_consulta_cliente').style.display = 'none';
    document.getElementById("externa_cadastro_veiculos").style.display = 'none';
    document.getElementById("externa_consulta_veiculos").style.display = 'none';
    document.getElementById('alugar_veiculo').style.display = 'none';
    document.getElementById('externa_consultar_locacoes').style.display= 'none';
    document.getElementById('devolver_veiculo').style.display='none';
    setTimeout(() => document.getElementById('cpf').focus(), 100);
    })

    document.getElementById('consultar_cliente').addEventListener('click', function () {
    document.getElementById('externa_consulta_cliente').style.display = 'block';
    document.getElementById('externa_cadastro_cliente').style.display = 'none';
    document.getElementById("externa_cadastro_veiculos").style.display = 'none';
    document.getElementById("externa_consulta_veiculos").style.display = 'none';
    document.getElementById('externa_consultar_locacoes').style.display= 'none';
    document.getElementById('alugar_veiculo').style.display = 'none';
    document.getElementById('devolver_veiculo').style.display='none';
    })

    let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    renderClientes(clientes);

    document.getElementById('labelCpf').addEventListener('click', sortByCpf);
    document.getElementById('labelNome').addEventListener('click', sortByNome);

    document.getElementById("incluir_veiculo").addEventListener("click", function () {
    document.getElementById('externa_cadastro_veiculos').style.display = 'block';
    document.getElementById('externa_consulta_veiculos').style.display = 'none';
    document.getElementById('externa_consulta_cliente').style.display = 'none';
    document.getElementById('externa_cadastro_cliente').style.display = 'none';
    document.getElementById('externa_consultar_locacoes').style.display= 'none';
    document.getElementById('alugar_veiculo').style.display = 'none';
    document.getElementById('devolver_veiculo').style.display='none';

    document.getElementById('placa').value = '';
    document.querySelectorAll('input[name="ec"]').forEach(radio => radio.checked = false);
    document.getElementById('modelo').value = '';
    document.getElementById('ano').value = '';
    document.getElementById('diaria').value = '';
    document.getElementById('km').value = '';


    document.getElementById('placa').disabled = false;
    document.querySelectorAll('input[name="ec"]').forEach(radio => radio.disabled = false);
    document.getElementById('modelo').disabled = false;
    document.getElementById('ano').disabled = false;
    document.getElementById('km').disabled = false;
    document.getElementById('diaria').disabled = false;

    setTimeout(() => document.getElementById('placa').focus(), 100);
    });
    
    document.getElementById('consultar_veiculo').addEventListener('click', function () {
    document.getElementById('externa_consulta_veiculos').style.display = 'block';
    document.getElementById('externa_cadastro_veiculos').style.display = 'none';
    document.getElementById('externa_cadastro_cliente').style.display = 'none';
    document.getElementById('externa_consulta_cliente').style.display = 'none';
    document.getElementById('alugar_veiculo').style.display = 'none';
    document.getElementById('externa_consultar_locacoes').style.display= 'none';
    document.getElementById('devolver_veiculo').style.display='none';
    });

    document.getElementById('consultar_locacao').addEventListener('click', function(){
    document.getElementById('externa_consulta_veiculos').style.display = 'none';
    document.getElementById('externa_cadastro_veiculos').style.display = 'none';
    document.getElementById('externa_cadastro_cliente').style.display = 'none';
    document.getElementById('externa_consulta_cliente').style.display = 'none';
    document.getElementById('alugar_veiculo').style.display = 'none';
    document.getElementById('externa_consultar_locacoes').style.display= 'block';
    document.getElementById('devolver_veiculo').style.display='none';
    renderListaLocacoes();
    })
    
    let veiculos = JSON.parse(localStorage.getItem('veiculos')) || [];
    renderVeiculos(veiculos);
}



//carregar os scripts junto com a página
window.onload = init;