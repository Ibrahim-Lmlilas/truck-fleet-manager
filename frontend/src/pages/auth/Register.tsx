import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { registerThunk, getMeThunk } from "@/redux/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((s) => s.auth);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch(registerThunk({ nom, prenom, email, password }));
    if (registerThunk.fulfilled.match(res)) {
      await dispatch(getMeThunk());
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-4">Créer un compte</h1>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nom">Nom</Label>
            <Input
              id="nom"
              value={nom}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNom(e.target.value)}
              placeholder="Doe"
              required
            />
          </div>
          <div>
            <Label htmlFor="prenom">Prénom</Label>
            <Input
              id="prenom"
              value={prenom}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrenom(e.target.value)}
              placeholder="John"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
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
            />
            <p className="text-xs text-gray-500 mt-1">
              Min 6 caractères, au moins 1 majuscule, 1 minuscule et 1 chiffre
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={status === "loading"}>
            {status === "loading" ? "Inscription..." : "S'inscrire"}
          </Button>
        </form>
        <p className="text-sm text-gray-600 mt-3">
          Déjà inscrit ? <Link to="/login" className="text-blue-600">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
