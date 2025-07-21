import { LoginSchema } from '../../../src/schemas/auth';

describe('LoginSchema', () => {
  it('deve passar com dados válidos', () => {
    const data = {
      email: 'usuario@example.com',
      password: 'senha123',
    };
    const result = LoginSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(data);
    }
  });

  it('deve falhar com email inválido', () => {
    const data = {
      email: 'usuario-at-exemplo',
      password: 'senha123',
    };
    const result = LoginSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('E-mail inválido');
      expect(result.error.issues[0].path).toEqual(['email']);
    }
  });

  it('deve falhar com senha muito curta', () => {
    const data = {
      email: 'usuario@example.com',
      password: '123',
    };
    const result = LoginSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Senha deve ter ao menos 6 caracteres',
      );
      expect(result.error.issues[0].path).toEqual(['password']);
    }
  });
});
