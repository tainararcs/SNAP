// Classe de estrutura de um usuário.

export class User {
    id = 0;
    name = "";
    email = "";
    senha = ""; 
    bios = "";

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
export function updateUserBios(userBios= "") {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    user.bios = userBios;
    localStorage.setItem('user', JSON.stringify(user));
}
//Recebe o arquivo da imagem selecionada e salva ela no localStore.
export function saveUserProfileImage(file) {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !file) return;

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

//Remove a imagem do usuario
export function removeProfileImage(){
    const user = JSON.parse(localStorage.getItem('user'));
     if (!user) return;
    user.profileImage = "img/icons/circle-user.svg";
    localStorage.setItem('user', JSON.stringify(user));
    const img = document.getElementById("profile-preview");
    if (img) {
        img.src = user.profileImage;
    }
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