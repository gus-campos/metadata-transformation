export function printErrorBeforeThrowing(action: () => void) {
  try {
    action();
  } catch (e) {
    if (e instanceof Error) console.log(e.message);
    throw e;
  }
}

export function toCamelCase(str: string): string {

  return str
    // 1. Remove acentos e diacríticos (ex: "ç" vira "c", "ã" vira "a")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    
    // 2. Substitui qualquer caractere que não seja letra ou número por um espaço
    .replace(/[^a-zA-Z0-9]/g, ' ')
    
    // 3. Limpa as bordas e divide a string por um ou mais espaços
    .trim()
    .split(/\s+/)
    
    // 4. Transforma em camelCase
    .map((word: string, index: number) => {
      if (!word) return ''; // Garante segurança contra strings vazias
      
      // Deixa a primeira palavra toda em minúsculo
      if (index === 0) {
        return word.toLowerCase();
      }
      // Capitaliza a primeira letra das palavras seguintes
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    
    // 5. Junta tudo de volta
    .join('');
}