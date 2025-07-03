//

class Interest {

    interests = [];
    
    constructor(initialInterests = []) {
        this.interests = [...initialInterests];
    }

    // Retorna um interesse com base no índice fornecido.
    getInterest(index) {
        if (index >= 0 && index < this.interests.length) {
            return this.interests[index];
        }
        return null;        
    }
     
    // Retorna a lista completa de interesses.
    getInterests() {
        return this.interests;
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
        return -1;
    }
    
}


}   