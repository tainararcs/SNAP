// Classe de estrutura de um usuário. 

export class User {
    id = 0;
    name = "";
    email = "";
    senha = "";
    
    // Lista de objetos Post.
    posts = [];

    // Lista de objetos Interest.
    interests = [];

    constructor(id, name, email, senha) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.senha = senha;
    }
        
    // Getters
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

    // Setters
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

    setInterests(newInterests) {
        this.interests = newInterests;
    }

    // Adiciona um post.
    addPost(post) {
        this.posts.push(post);
    }
    
}