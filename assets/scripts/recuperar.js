document.getElementById('recuperar-senha-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;

    if (email.trim() === '') {
        alert('Por favor, digite seu e-mail de cadastro.');
        return;
    }

    const endpoint = 'http://localhost:3000/forgot-password';

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    };

    // 1. Envia a requisição para o backend
    fetch(endpoint, options)
        .then(response => {
            if (!response.ok) {
                // Tenta ler o erro detalhado do servidor
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            // 2. Exibe a mensagem de sucesso (mesmo que o e-mail não exista, por segurança)
            alert(data.mensagem);
        })
        .catch(error => {
            // Exibe a mensagem de erro (que deve ser a mesma mensagem genérica do backend)
            alert(error.mensagem || 'Ocorreu um erro ao processar sua solicitação.');
        });
});