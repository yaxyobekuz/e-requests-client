import { Link, Navigate } from "react-router-dom";

const HomePage = () => {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-2xl font-bold">E</span>
        </div>

        <h1 className="text-3xl font-bold mb-3">E-Murojaat</h1>
        <p className="text-gray-500 mb-8">
          Davlat tashkilotiga elektron murojaat yuborish tizimi. Arizangizni
          onlayn yuborib, jarayonni kuzatib boring.
        </p>

        <div className="space-y-3">
          <Link
            to="/login"
            className="block w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Kirish
          </Link>

          <Link
            to="/register"
            className="block w-full py-2.5 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Ro'yxatdan o'tish
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
