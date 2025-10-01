function confirmaSenha() {
    const senha = document.getElementById('senha').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (senha !== confirmPassword) {
        alert('As senhas não coincidem. Por favor, tente novamente.');
        return false;
    } else {
        return true;
    }
}

function fazCadastro(idFormulario) {
    const form = document.getElementById(idFormulario);

    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();

            // Chamada da função de validação de senha
            if (!confirmaSenha()) {
                return;
            }

            let dadosDoFormulario = {};

            if (idFormulario === 'cadastro-pf') {
                dadosDoFormulario = {
                    primeiroNome: document.getElementById('primeiro-nome').value,
                    ultimoNome: document.getElementById('ultimo-nome').value,
                    cpf: document.getElementById('cpf').value,
                    nascimento: document.getElementById('nascimento').value,
                    email: document.getElementById('email').value,
                    senha: document.getElementById('senha').value,
                    tipo: 'pf'
                };
            } else if (idFormulario === 'cadastro-pj') {
                dadosDoFormulario = {
                    razaoSocial: document.getElementById('razaoSocial').value,
                    nomeFantasia: document.getElementById('nomeFantasia').value,
                    cnpj: document.getElementById('cnpj').value,
                    email: document.getElementById('email').value,
                    senha: document.getElementById('senha').value,
                    tipo: 'pj'
                };
            }

            const endpoint = 'http://localhost:3000/cadastro';

            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosDoFormulario)
            };

            fetch(endpoint, options)
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => { throw err; });
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Resposta do servidor:', data);
                    alert(data.mensagem);

                    if (data.status === 200) {
                        window.location.href = 'login.html';
                    }
                })
                .catch(error => {
                    console.error('Erro ao enviar dados:', error);
                    alert(error.mensagem || 'Erro ao enviar dados. Tente novamente.');
                });
        });
    }
}

fazCadastro('cadastro-pf');
fazCadastro('cadastro-pj');