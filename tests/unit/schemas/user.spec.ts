import { CreateUserSchema, UpdateUserSchema } from '../../../src/schemas/user';

describe('CreateUserSchema', () => {
  it('deve passar com dados válidos', () => {
    const data = {
      name: 'João',
      email: 'joao@example.com',
      password: 'senha123',
      userTypeId: 1,
    };
    const result = CreateUserSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(data);
    }
  });

  it('deve falhar se o nome estiver vazio', () => {
    const data = {
      name: '',
      email: 'joao@example.com',
      password: 'senha123',
    };
    const result = CreateUserSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Nome é obrigatório');
      expect(result.error.issues[0].path).toEqual(['name']);
    }
  });

  it('deve falhar com email inválido', () => {
    const data = {
      name: 'Maria',
      email: 'maria-at-exemplo',
      password: 'senha123',
    };
    const result = CreateUserSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('E-mail inválido');
      expect(result.error.issues[0].path).toEqual(['email']);
    }
  });

  it('deve falhar se a senha for muito curta', () => {
    const data = {
      name: 'Pedro',
      email: 'pedro@example.com',
      password: '123',
    };
    const result = CreateUserSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Senha deve ter ao menos 6 caracteres',
      );
      expect(result.error.issues[0].path).toEqual(['password']);
    }
  });

  it('userTypeId deve ser positivo quando informado', () => {
    const data = {
      name: 'Professor',
      email: 'professor@nulo.com',
      password: 'senha123',
      userTypeId: -5,
    };
    const result = CreateUserSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === 'userTypeId');
      expect(issue).toBeDefined();
    }
  });
});

describe('UpdateUserSchema', () => {
  it('deve aceitar atualização parcial válida', () => {
    const data = { email: 'professor@nulo.com' };
    const result = UpdateUserSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(data);
    }
  });

  it('deve falhar se nenhum campo for informado', () => {
    const data = {};
    const result = UpdateUserSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Pelo menos um campo deve ser informado',
      );
    }
  });

  it('deve falhar com campo inválido mesmo em update', () => {
    const data = { password: '123' };
    const result = UpdateUserSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((e) => e.path[0] === 'password');
      expect(err).toBeDefined();
      expect(err?.message).toBe('Senha deve ter ao menos 6 caracteres');
    }
  });
});
