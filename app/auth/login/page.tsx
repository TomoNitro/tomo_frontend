import { AuthSplit, LoginForm } from "../_components/explorer-ui";

export default function LoginPage() {
  return <AuthSplit tone="login" form={<LoginForm />} />;
}