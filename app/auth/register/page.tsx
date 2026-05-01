import { AuthSplit, RegisterForm } from "../_components/explorer-ui";

export default function RegisterPage() {
  return <AuthSplit tone="register" form={<RegisterForm />} />;
}