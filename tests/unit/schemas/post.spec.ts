import {
  CreatePostSchema,
  UpdatePostSchema,
  SearchPostSchema,
} from '../../../src/schemas/post';

describe('CreatePostSchema', () => {
  it('deve passar com dados válidos', () => {
    const data = {
      title: 'Meu primeiro post',
      content: 'Conteúdo do post',
      authorId: 42,
    };
    const result = CreatePostSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(data);
    }
  });

  it('deve falhar se title estiver vazio', () => {
    const data = {
      title: '',
      content: 'Conteúdo do post',
      authorId: 42,
    };
    const result = CreatePostSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Título obrigatório');
      expect(result.error.issues[0].path).toEqual(['title']);
    }
  });

  it('deve falhar se content estiver vazio', () => {
    const data = {
      title: 'Título',
      content: '',
      authorId: 42,
    };
    const result = CreatePostSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Conteúdo obrigatório');
      expect(result.error.issues[0].path).toEqual(['content']);
    }
  });

  it('deve falhar se authorId não for positivo', () => {
    const data = {
      title: 'Título',
      content: 'Conteúdo',
      authorId: -1,
    };
    const result = CreatePostSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === 'authorId');
      expect(issue).toBeDefined();
    }
  });
});

describe('UpdatePostSchema', () => {
  it('deve aceitar atualização parcial válida', () => {
    const data = { title: 'Novo título' };
    const result = UpdatePostSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(data);
    }
  });

  it('deve falhar se nenhum campo for informado', () => {
    const data = {};
    const result = UpdatePostSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Pelo menos um campo deve ser informado',
      );
    }
  });

  it('deve falhar se titulo ou content for vazio quando informado', () => {
    const data1 = { title: '' };
    const result1 = UpdatePostSchema.safeParse(data1);
    expect(result1.success).toBe(false);
    if (!result1.success) {
      const issue = result1.error.issues.find((i) => i.path[0] === 'title');
      expect(issue).toBeDefined();
    }

    const data2 = { content: '' };
    const result2 = UpdatePostSchema.safeParse(data2);
    expect(result2.success).toBe(false);
    if (!result2.success) {
      const issue = result2.error.issues.find((i) => i.path[0] === 'content');
      expect(issue).toBeDefined();
    }
  });
});

describe('SearchPostSchema', () => {
  it('deve passar com termo de busca válido', () => {
    const data = { q: 'busca' };
    const result = SearchPostSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(data);
    }
  });

  it('deve falhar se termo estiver vazio', () => {
    const data = { q: '' };
    const result = SearchPostSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Termo de busca obrigatório');
      expect(result.error.issues[0].path).toEqual(['q']);
    }
  });
});
