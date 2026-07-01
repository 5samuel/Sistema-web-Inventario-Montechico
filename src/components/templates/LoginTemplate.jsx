import styled from "styled-components";
import {
  Btn1,
  Footer,
  InputText2,
  Title,
  useAuthStore,
} from "../../index";

import { v } from "../../styles/variables";
import { Device } from "../../styles/breakpoints";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import { useNavigate } from "react-router-dom";

export function LoginTemplate() {
  const { loginEmail } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit } = useForm();

  const { mutate, isPending } = useMutation({
    mutationKey: ["login-email"],
    mutationFn: loginEmail,

    onSuccess: (data) => {
      // Redirige al dashboard cuando el login es exitoso
      navigate("/dashboard", { replace: true });
    },

    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const iniciarSesion = (data) => {
    mutate({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <Container>
      <Toaster />

      <div className="card">
        <ContentLogo>
          <img src={v.logo} />
          <span>SIGI-MONTECHICO</span>
        </ContentLogo>

        <Title $paddingbottom="40px">
          Iniciar Sesión
        </Title>

        <PanelLogin>
          <form onSubmit={handleSubmit(iniciarSesion)}>
            <InputText2>
              <input
                className="form__field"
                placeholder="Correo electrónico"
                type="email"
                {...register("email", {
                  required: true,
                })}
              />
            </InputText2>

            <InputText2>
              <input
                className="form__field"
                placeholder="Contraseña"
                type="password"
                {...register("password", {
                  required: true,
                })}
              />
            </InputText2>

            <Btn1
              disabled={isPending}
              titulo={
                isPending
                  ? "INGRESANDO..."
                  : "INGRESAR"
              }
              bgcolor="#1CB0F6"
              color="#fff"
              width="100%"
            />
          </form>
        </PanelLogin>
      </div>

      <Footer />
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  display:flex;
  justify-content:center;
  align-items:center;
  flex-direction:column;

  padding:20px;

  color:${({ theme }) => theme.text};

  .card{
    width:100%;
    max-width:420px;

    background:${({ theme }) => theme.body};

    border-radius:20px;

    padding:35px;

    box-shadow:
      0 10px 30px rgba(0,0,0,.15);

    display:flex;

    flex-direction:column;

    gap:20px;
  }

  form{
    display:flex;

    flex-direction:column;

    gap:15px;
  }

  @media ${Device.tablet}{
    .card{
      width:420px;
    }
  }
`;

const ContentLogo = styled.div`
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:10px;

  img{
    width:90px;
  }

  span{
    font-size:20px;
    font-weight:700;
  }
`;

const PanelLogin = styled.div`
  display:flex;
  flex-direction:column;
  gap:20px;
`;