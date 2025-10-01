document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // 1. Coleta os dados do formulário
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    if (email.trim() === '' || senha.trim() === '') {
        alert('Por favor, preencha todos os campos.');
        return; // Interrompe o envio
    }

    const dadosLogin = { email, senha };

    const endpoint = 'http://localhost:3000/login';

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosLogin)
    };

    // 2. Envia os dados para o servidor
    fetch(endpoint, options)
        .then(response => {
            if (!response.ok) {
                // Tenta ler o erro do servidor (Email ou senha incorretos)
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            console.log('Login bem-sucedido:', data);
            
            alert(data.mensagem);

            // 3. Redireciona com base no tipo de usuário retornado pelo servidor
            if (data.status === 200) {
                localStorage.setItem('isLoggedIn', 'true'); 
                
                window.location.href = 'dashboard.html';
            }
        })
        .catch(error => {
            // Exibe a mensagem de erro do servidor (Email ou senha incorretos)
            console.error('Erro de login:', error);
            alert(error.mensagem || 'Erro ao realizar login. Tente novamente.');
        });
});