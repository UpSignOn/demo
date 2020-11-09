import bcrypt from 'bcrypt';

const hash = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

const isOk = async (password: string, passwordHash: string): Promise<boolean> => {
  return await bcrypt.compare(password, passwordHash);
};

export const passwordHash = {
  hash,
  isOk,
};
