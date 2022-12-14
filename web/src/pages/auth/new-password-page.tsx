import { CaptchaDto } from "@api/auth/dto";
import { withDashboardLayout } from "@shared/components/layout/layout";
import { DiscriminatedUnion } from "@shared/types/types";
import { PasswordResetFormPassword } from "@zones/authorization/forms/password-reset-form-password";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { SWRConfig } from "swr";

const NewPasswordPageComponent: NextPage<DiscriminatedUnion<CaptchaDto>> = ({ data, error }) => {
	const router = useRouter();
	const { accessToken } = router.query;

	if (error) {
		router.push("/").then(() => toast.error("Během načítání stránky se něco nepovedlo"));
		return null;
	}

	return (
		<SWRConfig value={{ fallback: { "/captcha/generate": data } }}>
			<PasswordResetFormPassword accessToken={accessToken as string} />
		</SWRConfig>
	);
};

export const Page = withDashboardLayout(NewPasswordPageComponent, "Nastavení nového hesla");
