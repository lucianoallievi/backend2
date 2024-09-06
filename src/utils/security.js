import bcrypt from "bcrypt";

export const createHash = (password) => {
  const salt = bcrypt.genSaltSync();

  return bcrypt.hashSync(String(password), salt);
};

export const isValidPassword = (password, hash) => {
  return bcrypt.compareSync(String(password), hash);
};
