// Função para carregar o Navbar e o Footer
function loadNavAndFooter() {
    // 1. Checa o status de login no localStorage
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // 2. Define o caminho do arquivo do Navbar
    // Se logado: navbar-logged-in.html
    // Se deslogado: navbar-logged-out.html
    const navUrl = isLoggedIn 
        ? 'navbar_login.html' 
        : 'navbar_logoff.html';
    
    // Define o caminho do footer (assumindo que ele está na mesma pasta)
    const footerUrl = './assets/navbars/footer.html'; 

    // 3. Carrega o Navbar
    fetch(navUrl)
        .then(response => {
            if (!response.ok) {
                // Trata erro se o arquivo não for encontrado
                throw new Error(`Não foi possível carregar ${navUrl}: ${response.statusText}`);
            }
            return response.text();
        })
        .then(html => {
            document.getElementById('navbar').innerHTML = html;
        })
        .catch(error => console.error('Erro ao carregar o Navbar:', error));

    // 4. Carrega o Footer
    if (document.getElementById('footer')) {
        fetch('footer.html')
            .then(response => response.text())
            .then(html => {
                document.getElementById('footer').innerHTML = html;
            });
    }
}

// Função de Logoff
// Esta função é chamada quando o usuário clica no botão "Sair" na navbar-logged-in.html
window.logout = function() {
    // Remove o sinal de login
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    
    // Redireciona para a página inicial
    window.location.href = 'index.html'; 
}

// Inicia o carregamento quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', loadNavAndFooter);