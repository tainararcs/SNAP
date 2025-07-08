// Classe de estrutura de um usuário.

export class User {
    id = 0;
    name = "";
    email = "";
    senha = "";
       
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
