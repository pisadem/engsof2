// Função auxiliar para extrair o token da URL
function getTokenFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('token');
}

document.getElementById('reset-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // 1. Coleta os dados
    const token = getTokenFromUrl();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // 2. Validação Frontend
    if (!token) {
        alert('Erro: O link de redefinição está incompleto.');
        return;
    }
    if (newPassword !== confirmPassword) {
        alert('As novas senhas não coincidem.');
        return;
    }

    // 3. Monta o objeto a ser enviado
    const dadosReset = { token, newPassword };

    const endpoint = 'http://localhost:3000/reset-password';

    fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosReset)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(data => {
        alert(data.mensagem);
        if (data.status === 200) {
            // Redireciona para o login após o sucesso
            window.location.href = 'login.html'; 
        }
    })
    .catch(error => {
        alert(error.mensagem || 'Erro ao redefinir senha.');
    });
});