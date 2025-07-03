// Classe de estrutura de uma postagem. 

class Post {
    userName;
    content;

    constructor(userName, content) {
        this.userName = userName;
        this.content = content;
    }

    // Getters.
    getUserName() {
        return this.userName;
    }

    getContent() {
        return this.content;
    }

    // Setters.
    setUserName(newUserName) {
        this.userName = newUserName;
    }

    setContent(newContent) {
        this.content = newContent;
    }
}
