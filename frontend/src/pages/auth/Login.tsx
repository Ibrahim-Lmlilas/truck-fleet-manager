import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loginThunk, getMeThunk } from "@/redux/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((s) => s.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch(loginThunk({ email, password }));
    if (loginThunk.fulfilled.match(res)) {
      await dispatch(getMeThunk());
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Form Section - Left Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-4 py-8">
        <div className="w-full max-w-md rounded-lg p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6">Se connecter</h1>
          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
          <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full" disabled={status === "loading"}>
              {status === "loading" ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
          <p className="text-sm text-gray-600 mt-4 sm:mt-6 text-center">
            Pas de compte ? <Link to="/register" className="text-blue-600 hover:underline">S'inscrire</Link>
          </p>
        </div>
      </div>

      {/* Image Section - Right Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-100 relative overflow-hidden">
        <img 
          src="/register.png" 
          alt="Login" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
    </div>
  );
}
