import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/admin/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    // Ha a refreshSession lefutott és van user, dobjuk tovább
    if (!auth.loading && auth.user) {
      navigate('/admin');
    }
  }, [auth.user, auth.loading, navigate]);

  const handleLogin: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. BE KELL VÁRNI a bejelentkezést (await)
      const user = await auth.login({
        email: email,
        password: password
      });
      console.log("user", user);

      return;

      // 2. Ha idáig eljutott (nem dobott hibát), akkor sikeres!
      // Irány az admin főoldal
      navigate('/admin/dashboard'); 
    } catch (err: any) {
      // 3. Itt kapjuk el a back-endről jövő hibaüzenetet
      setError(err.message || 'Sikertelen bejelentkezés. Ellenőrizd az adataidat!');
    } finally {
      // 4. Mindenképpen állítsuk le a töltést
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
            <Lock size={24} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Admin Belépés</h2>
          <p className="mt-2 text-sm text-gray-500">Kérlek, add meg a hozzáférési adataidat.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100 text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="email"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                placeholder="E-mail cím"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                placeholder="Jelszó"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Bejelentkezés'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;