import GuestLayout from "@/layouts/GuestLayout";
import {
    Button,
    PasswordInput,
    TextInput,
} from "@mantine/core";
import {
    IconLock,
    IconMail,
} from "@tabler/icons-react";
import { useForm } from "laravel-precognition-react-inertia";
import { useEffect } from "react";
import classes from "./css/Login.module.css";

const ResetPassword = ({ token }) => {
    const form = useForm("post", route("auth.newPassword.save"), {
        token,
        email: "",
        password: "",
        password_confirmation: "",
    });

    useEffect(() => {
        return () => {
            form.reset("password", "password_confirmation");
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        form.clearErrors();

        form.submit({
            preserveScroll: true,
        });
    };

    return (
        <form
            onSubmit={submit}
            className={classes.form}
            style={{ marginTop: "1rem" }}
        >
            <TextInput
                label="Correo electrónico"
                placeholder="usuario@hospital.edu.ar"
                required
                radius="xl"
                size="md"
                leftSection={<IconMail size={18} />}
                value={form.data.email}
                onChange={(e) => form.setData("email", e.target.value)}
                error={form.errors.email}
            />

            <PasswordInput
                mt="lg"
                label="Nueva contraseña"
                placeholder="Ingresá tu nueva contraseña"
                radius="xl"
                size="md"
                leftSection={<IconLock size={18} />}
                value={form.data.password}
                onChange={(e) => form.setData("password", e.target.value)}
                error={form.errors.password}
            />

            <PasswordInput
                mt="lg"
                label="Confirmar contraseña"
                placeholder="Repetí la nueva contraseña"
                radius="xl"
                size="md"
                leftSection={<IconLock size={18} />}
                value={form.data.password_confirmation}
                onChange={(e) =>
                    form.setData(
                        "password_confirmation",
                        e.target.value
                    )
                }
                error={form.errors.password_confirmation}
            />

            <Button
                type="submit"
                fullWidth
                mt="xl"
                radius="xl"
                size="lg"
                loading={form.processing}
            >
                Restablecer contraseña
            </Button>
        </form>
    );
};

ResetPassword.layout = (page) => (
    <GuestLayout
        title="Restablecer contraseña"
        heading="Restablecer contraseña"
        subtitle="Ingresá tu correo electrónico y elegí una nueva contraseña para tu cuenta."
        sideTitle={
            <>
                Protegé
                <br />
                tu cuenta
            </>
        }
        sideDescription="Elegí una contraseña segura para proteger el acceso al sistema."
    >
        {page}
    </GuestLayout>
);

export default ResetPassword;