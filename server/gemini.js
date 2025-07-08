export async function requisitarPost(_, interessesPredefinidos = null) {
    
    try{
        const response = await fetch('http://localhost:3001/requisitarPost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ interesses: interessesPredefinidos || [] })
        });

        const data = await response.json();
        return [data.texto, data.interesses];

    } catch(error){
        console.error('Erro ao obter post:', error);
        return [null, interessesPredefinidos || []];
    }
}