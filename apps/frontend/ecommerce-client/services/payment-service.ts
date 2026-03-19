import { PaymentInformationModel } from "@/types/payment";
import api from "@/lib/api";

const paymentService = {
    createVnPayUrl: async (data: PaymentInformationModel) => {
        const response = await api.post<{ paymentUrl: string }>("/payments/vnpay/create-url", data);
        return response.data; // Adapting to Axios response structure if api is axios instance
    },
};

export default paymentService;
