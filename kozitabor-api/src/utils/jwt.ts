import jwt, { SignOptions, Secret } from 'jsonwebtoken';

/**
 * A jsonwebtoken .sign() metódusának aszinkron (Promise) verziója.
 * @param payload - Az adatok, amiket a tokenbe zárunk (pl. id, email).
 * @param secret - A titkos kulcs az aláíráshoz.
 * @param options - JWT beállítások (pl. expiresIn).
 */
export const signAsync = (
  payload: string | object | Buffer,
  secret: Secret,
  options: SignOptions
): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) {
        return reject(err);
      }
      if (!token) {
        return reject(new Error("Token generálási hiba: A token üres maradt."));
      }
      resolve(token);
    });
  });
};