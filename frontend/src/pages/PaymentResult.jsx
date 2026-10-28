import { useParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import Button from "../components/ui/Button";
import { useLang } from "../hooks/useLang";

// Stripe success_url -> /payment/success, cancel_url -> /payment/cancel
export default function PaymentResult() {
  const { status } = useParams();
  const { t } = useLang();
  const ok = status === "success";

  return (
    <div className="container not-found">
      {ok ? <CheckCircle2 size={90} color="#12B76A" /> : <XCircle size={90} color="#F04438" />}
      <h2>{t(ok ? "payment.successTitle" : "payment.cancelTitle")}</h2>
      <p>{t(ok ? "payment.successText" : "payment.cancelText")}</p>
      <Button to="/#courses">{t("payment.back")}</Button>
    </div>
  );
}
