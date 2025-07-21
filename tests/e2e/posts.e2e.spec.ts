import request from 'supertest';
import { prisma } from '../../src/prisma';
import app from '../../src/app';
import { createType, createUser, getPass } from './factories/factories';

describe('E2E - Posts + Auth', () => {
  let user: {
    email: string;
    password: string;
    id: number;
    name: string;
    disabled: boolean;
    userTypeId: number;
    createdAt: Date;
    updatedAt: Date | null;
  };
  let type: { id: number; name: string; createdAt: Date; description: string };
  let plainPassword: string;

  beforeAll(async () => { 
    await prisma.$connect();

    plainPassword = getPass();
    type = await createType();
    user = await createUser();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('deve criar um usuário, logar, criar um post e listar', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: user.email,
      password: plainPassword,
    });

    expect(loginRes.status).toBe(200);

    const token = loginRes.body.token;
    expect(typeof token).toBe('string');

    const payload = {
      title: 'E2E Test',
      content: 'Conteúdo E2E',
      authorId: user.id,
    };

    const createRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(createRes.status).toBe(201);
    expect(createRes.body).toMatchObject(payload);

    const listRes = await request(app)
      .get('/api/posts')
      .set('Authorization', `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body).toEqual(
      expect.arrayContaining([expect.objectContaining(payload)]),
    );
  });
});
