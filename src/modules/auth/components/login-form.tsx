"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { loginSchema, type LoginInput } from "@/modules/auth/schemas/login.schema";
import { loginAction } from "@/modules/auth/actions/auth.actions";
import { GoogleSignInButton } from "@/modules/auth/components/google-signin-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setIsSubmitting(true);
    const result = await loginAction({ ...data, callbackUrl });
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.message ?? "Não foi possível entrar");
    }
  }

  return (
    <Card className="w-full max-w-md rounded-2xl p-2 shadow-[0_0_60px_rgba(37,99,235,0.15)]">
      <CardContent className="p-6">
        <p className="text-sm font-medium text-sky-400">Bem-vindo de volta</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Entrar na sua conta</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              icon={<Mail size={16} />}
              {...register("email")}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Senha
            </Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua senha"
              icon={<Lock size={16} />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-muted-foreground hover:text-white"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              {...register("password")}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox defaultChecked />
              Lembrar de mim
            </label>
            <Link href="/forgot-password" className="text-sm text-sky-400 hover:underline">
              Esqueci minha senha
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full gap-2 bg-gradient-to-r from-blue-600 to-sky-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
            {!isSubmitting && <ArrowRight size={16} />}
          </Button>
        </form>

        {googleEnabled && (
          <>
            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-white/10" />
              ou
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <GoogleSignInButton />
          </>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <Link href="/register" className="text-sky-400 hover:underline">
            Criar conta
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
