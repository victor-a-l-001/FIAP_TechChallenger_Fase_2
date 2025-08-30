describe('config.ts', () => {
  let OLD_ENV: NodeJS.ProcessEnv;
  let dotenv: typeof import('dotenv');

  beforeEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();

    OLD_ENV = { ...process.env };
    process.env = { ...OLD_ENV };

    dotenv = require('dotenv');
    jest.spyOn(dotenv, 'config').mockReturnValue({ parsed: {} } as any);

    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('deve lançar erro se JWT_SECRET não estiver definido', () => {
    process.env.NODE_ENV = 'local';
    delete process.env.JWT_SECRET;
    process.env.PORT = '3000';

    expect(() => require('../../src/config')).toThrow(
      'Variável JWT_SECRET não definida em process.env'
    );
  });

  it('deve emitir warning e usar porta padrão quando PORT não estiver definida', () => {
    process.env.NODE_ENV = 'local';
    process.env.JWT_SECRET = 'xyz';
    process.env.ORIGIN = 'abc';
    delete process.env.PORT;

    const { config } = require('../../src/config');

    expect(console.warn).toHaveBeenCalledWith(
      'PORT não definida; usando 3000 como padrão'
    );
    expect(config.server.port).toBe(3000);
  });
});
