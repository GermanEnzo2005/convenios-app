// Cuando esté la API: poner USE_MOCK en false y completar la llamada real.
const USE_MOCK = true;

export type LoginResult = { token: string; usuario: { nombre: string; rol: string } };

export async function login(usuario: string, password: string): Promise<LoginResult> {
    if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 800)); // simula la red
        if (usuario.toLowerCase() === 'decano@unlpam.edu.ar' && password === 'decano123') {
        return { token: 'token-de-prueba', usuario: { nombre: 'Decano de Prueba', rol: 'decano' } };
        }
        throw new Error('Usuario o contraseña incorrectos.');
    }
    throw new Error('API todavía no conectada.');
}