const loadNavbar = function(){
    fetch('navbar.html')
        .then(response => response.text())
        .then(data => 
            document.getElementById('navbar').innerHTML = data
        );
}

const loadFooter = function(){
    fetch('footer.html')
        .then(response => response.text())
        .then(data => 
            document.getElementById('footer').innerHTML = data
        );
}

document.addEventListener('DOMContentLoaded', loadNavbar);
document.addEventListener('DOMContentLoaded', loadFooter);