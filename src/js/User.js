// Classe de estrutura de um usuário.

export class User {
    id = 0;
    name = "";
    email = "";
    senha = ""; 
    bio = "";

    // Lista de interesses.
    interests = [];

    // Lista de objetos Post.
    posts = [];

    constructor(id, name, email, senha) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.senha = senha;
    }
        
    // Getters.

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getEmail() {
        return this.email;
    }

    getSenha() {
        return this.senha;
    }

    getPosts() {
        return this.posts;
    }

    getInterests() {
        return this.interests;
    }

    // Retorna um interesse com base no índice fornecido.
    getInterestIndex(index) {
        if (index >= 0 && index < this.interests.length) {
            return this.interests[index];
        }
        return null;         
    }
      
    // Retorna a lista completa de interesses.
    getInterests() {
        return this.interests;
    }

    // Gera a URL do avatar com base no ID do usuário.
    getAvatarUrl() {
        // Usa o ID do usuário para gerar um avatar consistente.
        // O serviço i.pravatar.cc usa IDs até 70. Vamos usar o módulo para garantir que esteja no range.
        const avatarId = (this.id % 70) + 1; 
        return `https://i.pravatar.cc/150?img=${avatarId}`;
    }

    // Setters.

    setId(newId) {
        this.id = newId;
    }

    setName(newName) {
        this.name = newName;
    }

    setEmail(newEmail) {
        this.email = newEmail;
    }

    setSenha(newSenha) {
        this.senha = newSenha;
    }

    setPosts(newPosts) {
        this.posts = newPosts;
    }

    // Adiciona um post.
    addPost(post) {
        this.posts.push(post);
    }

    // Adiciona um interesse.
    addInterest(interest) {
        this.interests.push(interest);
    }
    // Adiciona uma lista de interesses.
    addInterestList(interestList) {
        this.interests.push(...interestList);
    }

    // Pesquisa um interesse na lista.
    searchInterest(interest) {
        for (let i = 0; i < this.interests.length; i++) {
            if (this.interests[i] === interest) {
                return i;
            }
        }
        return -1;
    }
}


// Atualiza o tema do usuário no localStorage.
export function updateUserTheme(themeDark = false) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    user.theme = themeDark ? 'dark' : 'light';
    localStorage.setItem('user', JSON.stringify(user));
}

// Função corrigida para atualizar a biografia do usuário
export function updateUserBio(userBio= "") {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    user.bio = userBio;
    localStorage.setItem('user', JSON.stringify(user));
}

//Recebe o arquivo da imagem selecionada e salva ela no localStore.
export function saveUserProfileImage(file) {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) return;
    const img = document.getElementById("profile-preview");

    // Imagem SVG padrão (base64)
    const defaultImageBase64 =
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9ImdyYXkiIGQ9Ik0xMiAyYy0xLjY2IDAtMyAxLjM0LTMgM3MxLjM0IDMgMyAzIDMtMS4zNCAzLTMtMS4zNC0zLTMtM3ptMCAxMGMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz48L3N2Zz4=";

    if (!file) {
        user.profileImage = defaultImageBase64;
        localStorage.setItem('user', JSON.stringify(user));
        if (img) img.src = defaultImageBase64;
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        user.profileImage = reader.result; // base64
        localStorage.setItem('user', JSON.stringify(user));
        // Atualiza a imagem na tela imediatamente
        const img = document.getElementById("profile-preview");
        if (img) {
            img.src = user.profileImage;
        }
  };

  reader.readAsDataURL(file);// Converte o arquivo em base64
}

// Carrega a imagem salva no localStore, se não exisitir nenhuma ele usa uma padrão existente.
export function loadUserProfileImage() {
    const user = JSON.parse(localStorage.getItem('user'));
    const img = document.getElementById("profile-preview");

    if (user && user.profileImage) {
        img.src = user.profileImage;
    }else{
        img.src = "img/icons/circle-user.svg";
    }
}